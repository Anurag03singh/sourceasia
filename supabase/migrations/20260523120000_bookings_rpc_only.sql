-- Bookings must be created only via book_seat() RPC (atomic seat lock).
drop policy if exists "Users insert own bookings" on public.bookings;
