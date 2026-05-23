-- =========================
-- Seed Data for Testing
-- =========================

-- Insert test flights
insert into public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) 
values 
  ('LV101', 'New York', 'London', now() + interval '2 days', now() + interval '2 days 8 hours', 'Boeing 777', 'scheduled', 450.00),
  ('LV102', 'New York', 'Paris', now() + interval '3 days', now() + interval '3 days 8 hours', 'Airbus A380', 'scheduled', 500.00),
  ('LV103', 'London', 'Dubai', now() + interval '1 day', now() + interval '1 day 8 hours', 'Boeing 787', 'scheduled', 600.00),
  ('LV104', 'Paris', 'Tokyo', now() + interval '4 days', now() + interval '4 days 12 hours', 'Boeing 777', 'scheduled', 900.00),
  ('LV105', 'New York', 'Los Angeles', now() + interval '5 hours', now() + interval '5 hours 6 hours', 'Boeing 737', 'scheduled', 300.00)
on conflict (flight_no) do nothing;

-- Insert seats for each flight (28 economy, 8 business, 4 first class per flight)
-- Flight LV101
insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select f.id, seat_no, 'economy', true, 0
from public.flights f, generate_series(1, 28) seat_no
where f.flight_no = 'LV101'
on conflict (flight_id, seat_number) do nothing;

insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select f.id, 'B' || i::text, 'business', true, 150.00
from public.flights f, generate_series(1, 8) i
where f.flight_no = 'LV101'
on conflict (flight_id, seat_number) do nothing;

insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select f.id, 'F' || i::text, 'first', true, 300.00
from public.flights f, generate_series(1, 4) i
where f.flight_no = 'LV101'
on conflict (flight_id, seat_number) do nothing;

-- Flight LV102
insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select f.id, seat_no, 'economy', true, 0
from public.flights f, generate_series(1, 28) seat_no
where f.flight_no = 'LV102'
on conflict (flight_id, seat_number) do nothing;

insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select f.id, 'B' || i::text, 'business', true, 150.00
from public.flights f, generate_series(1, 8) i
where f.flight_no = 'LV102'
on conflict (flight_id, seat_number) do nothing;

insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select f.id, 'F' || i::text, 'first', true, 300.00
from public.flights f, generate_series(1, 4) i
where f.flight_no = 'LV102'
on conflict (flight_id, seat_number) do nothing;

-- Flight LV103
insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select f.id, seat_no, 'economy', true, 0
from public.flights f, generate_series(1, 28) seat_no
where f.flight_no = 'LV103'
on conflict (flight_id, seat_number) do nothing;

insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select f.id, 'B' || i::text, 'business', true, 150.00
from public.flights f, generate_series(1, 8) i
where f.flight_no = 'LV103'
on conflict (flight_id, seat_number) do nothing;

insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select f.id, 'F' || i::text, 'first', true, 300.00
from public.flights f, generate_series(1, 4) i
where f.flight_no = 'LV103'
on conflict (flight_id, seat_number) do nothing;

-- Flight LV104
insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select f.id, seat_no, 'economy', true, 0
from public.flights f, generate_series(1, 28) seat_no
where f.flight_no = 'LV104'
on conflict (flight_id, seat_number) do nothing;

insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select f.id, 'B' || i::text, 'business', true, 150.00
from public.flights f, generate_series(1, 8) i
where f.flight_no = 'LV104'
on conflict (flight_id, seat_number) do nothing;

insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select f.id, 'F' || i::text, 'first', true, 300.00
from public.flights f, generate_series(1, 4) i
where f.flight_no = 'LV104'
on conflict (flight_id, seat_number) do nothing;

-- Flight LV105
insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select f.id, seat_no, 'economy', true, 0
from public.flights f, generate_series(1, 28) seat_no
where f.flight_no = 'LV105'
on conflict (flight_id, seat_number) do nothing;

insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select f.id, 'B' || i::text, 'business', true, 150.00
from public.flights f, generate_series(1, 8) i
where f.flight_no = 'LV105'
on conflict (flight_id, seat_number) do nothing;

insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select f.id, 'F' || i::text, 'first', true, 300.00
from public.flights f, generate_series(1, 4) i
where f.flight_no = 'LV105'
on conflict (flight_id, seat_number) do nothing;
