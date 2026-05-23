
-- =========================
-- ENUMS
-- =========================
create type public.seat_class as enum ('economy', 'business', 'first');
create type public.flight_status as enum ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled', 'delayed');
create type public.booking_status as enum ('confirmed', 'rescheduled', 'cancelled');

-- =========================
-- TABLES
-- =========================
create table public.flights (
  id uuid primary key default gen_random_uuid(),
  flight_no text not null unique,
  origin text not null,
  destination text not null,
  departs_at timestamptz not null,
  arrives_at timestamptz not null,
  aircraft_type text not null default 'Boeing 737',
  status public.flight_status not null default 'scheduled',
  base_price numeric(10,2) not null check (base_price >= 0),
  created_at timestamptz not null default now()
);
create index flights_route_idx on public.flights (origin, destination, departs_at);

create table public.seats (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid not null references public.flights(id) on delete cascade,
  seat_number text not null,
  class public.seat_class not null default 'economy',
  is_available boolean not null default true,
  extra_fee numeric(10,2) not null default 0,
  unique (flight_id, seat_number)
);
create index seats_flight_idx on public.seats (flight_id);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flight_id uuid not null references public.flights(id),
  seat_id uuid not null references public.seats(id),
  status public.booking_status not null default 'confirmed',
  booked_at timestamptz not null default now(),
  total_price numeric(10,2) not null,
  pnr_code text not null unique
);
create index bookings_user_idx on public.bookings (user_id);
create index bookings_flight_idx on public.bookings (flight_id);

create table public.passengers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  full_name text not null,
  passport_no text not null,
  nationality text not null,
  dob date not null
);
create index passengers_booking_idx on public.passengers (booking_id);

create table public.reschedules (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  old_flight_id uuid not null references public.flights(id),
  new_flight_id uuid not null references public.flights(id),
  requested_at timestamptz not null default now(),
  fee_charged numeric(10,2) not null default 0
);
create index reschedules_booking_idx on public.reschedules (booking_id);

-- =========================
-- 2-HOUR CANCELLATION TRIGGER
-- =========================
create or replace function public.enforce_cancellation_window()
returns trigger
language plpgsql
as $$
declare
  v_departs timestamptz;
begin
  -- Only enforce when transitioning into 'cancelled'
  if new.status = 'cancelled' and (old.status is distinct from 'cancelled') then
    select departs_at into v_departs from public.flights where id = new.flight_id;
    if v_departs - now() < interval '2 hours' then
      raise exception 'Cancellations are not allowed within 2 hours of departure'
        using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_enforce_cancellation_window
before update on public.bookings
for each row execute function public.enforce_cancellation_window();

-- =========================
-- PNR HELPER
-- =========================
create or replace function public.generate_pnr()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, 1 + floor(random() * length(chars))::int, 1);
  end loop;
  return result;
end;
$$;

-- =========================
-- BOOK SEAT RPC (atomic, prevents race)
-- =========================
create or replace function public.book_seat(
  p_flight_id uuid,
  p_seat_id uuid,
  p_passengers jsonb  -- [{full_name, passport_no, nationality, dob}]
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seat record;
  v_flight record;
  v_booking public.bookings;
  v_pnr text;
  v_total numeric(10,2);
  v_user uuid := auth.uid();
  v_p jsonb;
begin
  if v_user is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  -- Lock the seat row to prevent race conditions
  select * into v_seat from public.seats
    where id = p_seat_id and flight_id = p_flight_id
    for update;

  if not found then
    raise exception 'Seat not found' using errcode = 'P0002';
  end if;

  if not v_seat.is_available then
    raise exception 'Seat is no longer available' using errcode = 'P0003';
  end if;

  select * into v_flight from public.flights where id = p_flight_id;
  if v_flight.status <> 'scheduled' then
    raise exception 'Flight is not bookable';
  end if;

  v_total := v_flight.base_price + v_seat.extra_fee;

  -- Generate unique PNR (retry on collision)
  loop
    v_pnr := public.generate_pnr();
    exit when not exists (select 1 from public.bookings where pnr_code = v_pnr);
  end loop;

  -- Mark seat unavailable
  update public.seats set is_available = false where id = p_seat_id;

  -- Insert booking
  insert into public.bookings (user_id, flight_id, seat_id, total_price, pnr_code)
  values (v_user, p_flight_id, p_seat_id, v_total, v_pnr)
  returning * into v_booking;

  -- Insert passengers
  if p_passengers is not null then
    for v_p in select * from jsonb_array_elements(p_passengers)
    loop
      insert into public.passengers (booking_id, full_name, passport_no, nationality, dob)
      values (
        v_booking.id,
        v_p->>'full_name',
        v_p->>'passport_no',
        v_p->>'nationality',
        (v_p->>'dob')::date
      );
    end loop;
  end if;

  return v_booking;
end;
$$;

-- =========================
-- CANCEL BOOKING RPC
-- =========================
create or replace function public.cancel_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;

  select * into v_booking from public.bookings
    where id = p_booking_id and user_id = v_user
    for update;

  if not found then
    raise exception 'Booking not found';
  end if;

  if v_booking.status = 'cancelled' then
    raise exception 'Booking already cancelled';
  end if;

  -- Trigger enforces 2-hour rule
  update public.bookings set status = 'cancelled'
    where id = p_booking_id
    returning * into v_booking;

  -- Free the seat
  update public.seats set is_available = true where id = v_booking.seat_id;

  return v_booking;
end;
$$;

-- =========================
-- RESCHEDULE BOOKING RPC
-- =========================
create or replace function public.reschedule_booking(
  p_booking_id uuid,
  p_new_flight_id uuid,
  p_new_seat_id uuid
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
  v_old_flight record;
  v_new_flight record;
  v_new_seat record;
  v_old_seat_id uuid;
  v_fee numeric(10,2) := 0;
  v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Authentication required'; end if;

  select * into v_booking from public.bookings
    where id = p_booking_id and user_id = v_user
    for update;
  if not found then raise exception 'Booking not found'; end if;
  if v_booking.status = 'cancelled' then raise exception 'Cannot reschedule a cancelled booking'; end if;

  select * into v_old_flight from public.flights where id = v_booking.flight_id;
  select * into v_new_flight from public.flights where id = p_new_flight_id for update;

  if v_old_flight.origin <> v_new_flight.origin or v_old_flight.destination <> v_new_flight.destination then
    raise exception 'New flight must be on the same route';
  end if;

  -- Lock new seat
  select * into v_new_seat from public.seats
    where id = p_new_seat_id and flight_id = p_new_flight_id
    for update;
  if not found then raise exception 'Seat not found'; end if;
  if not v_new_seat.is_available then raise exception 'Seat is no longer available'; end if;

  v_old_seat_id := v_booking.seat_id;

  -- Fee = positive price difference
  v_fee := greatest(0, (v_new_flight.base_price + v_new_seat.extra_fee) - v_booking.total_price);

  -- Free old seat, take new seat
  update public.seats set is_available = true where id = v_old_seat_id;
  update public.seats set is_available = false where id = p_new_seat_id;

  -- Update booking
  update public.bookings
  set flight_id = p_new_flight_id,
      seat_id = p_new_seat_id,
      total_price = v_new_flight.base_price + v_new_seat.extra_fee,
      status = 'rescheduled'
  where id = p_booking_id
  returning * into v_booking;

  insert into public.reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  values (p_booking_id, v_old_flight.id, p_new_flight_id, v_fee);

  return v_booking;
end;
$$;

-- =========================
-- RLS
-- =========================
alter table public.flights enable row level security;
alter table public.seats enable row level security;
alter table public.bookings enable row level security;
alter table public.passengers enable row level security;
alter table public.reschedules enable row level security;

-- Flights & seats: world-readable (catalogue)
create policy "Flights are viewable by everyone"
  on public.flights for select using (true);

create policy "Seats are viewable by everyone"
  on public.seats for select using (true);

-- Seats can only be updated through RPCs (security definer) — no direct UPDATE policy

-- Bookings: owner-only
create policy "Users view own bookings"
  on public.bookings for select using (auth.uid() = user_id);
create policy "Users insert own bookings"
  on public.bookings for insert with check (auth.uid() = user_id);
create policy "Users update own bookings"
  on public.bookings for update using (auth.uid() = user_id);

-- Passengers: owner-only via booking
create policy "Users view own passengers"
  on public.passengers for select using (
    exists (select 1 from public.bookings b where b.id = passengers.booking_id and b.user_id = auth.uid())
  );
create policy "Users insert own passengers"
  on public.passengers for insert with check (
    exists (select 1 from public.bookings b where b.id = passengers.booking_id and b.user_id = auth.uid())
  );

-- Reschedules: owner-only via booking
create policy "Users view own reschedules"
  on public.reschedules for select using (
    exists (select 1 from public.bookings b where b.id = reschedules.booking_id and b.user_id = auth.uid())
  );

-- =========================
-- REALTIME on seats
-- =========================
alter publication supabase_realtime add table public.seats;
alter table public.seats replica identity full;

-- =========================
-- SEED — 8 flights across 4 routes
-- =========================
with new_flights as (
  insert into public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, base_price)
  values
    ('LV101', 'NYC', 'LON', now() + interval '2 days',  now() + interval '2 days 7 hours',  'Boeing 777', 520.00),
    ('LV102', 'LON', 'NYC', now() + interval '3 days',  now() + interval '3 days 8 hours',  'Boeing 777', 540.00),
    ('LV201', 'DXB', 'SIN', now() + interval '1 day',   now() + interval '1 day 7 hours',   'Airbus A380', 480.00),
    ('LV202', 'SIN', 'DXB', now() + interval '4 days',  now() + interval '4 days 7 hours',  'Airbus A380', 490.00),
    ('LV301', 'LAX', 'TYO', now() + interval '5 days',  now() + interval '5 days 11 hours', 'Boeing 787', 610.00),
    ('LV302', 'TYO', 'LAX', now() + interval '6 days',  now() + interval '6 days 10 hours', 'Boeing 787', 620.00),
    ('LV401', 'PAR', 'FRA', now() + interval '12 hours',now() + interval '13 hours 30 minutes','Airbus A320', 180.00),
    ('LV402', 'FRA', 'PAR', now() + interval '2 days 4 hours', now() + interval '2 days 5 hours 30 minutes','Airbus A320', 175.00)
  returning id, base_price
)
insert into public.seats (flight_id, seat_number, class, extra_fee)
select
  f.id,
  r.row_num::text || c.col_letter,
  case
    when r.row_num <= 2 then 'first'::public.seat_class
    when r.row_num <= 5 then 'business'::public.seat_class
    else 'economy'::public.seat_class
  end,
  case
    when r.row_num <= 2 then 450.00
    when r.row_num <= 5 then 200.00
    else 0.00
  end
from new_flights f
cross join generate_series(1, 20) as r(row_num)
cross join (values ('A'),('B'),('C'),('D'),('E'),('F')) as c(col_letter);
