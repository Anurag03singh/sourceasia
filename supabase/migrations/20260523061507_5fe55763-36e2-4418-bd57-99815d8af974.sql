
-- Set search_path on remaining functions
alter function public.enforce_cancellation_window() set search_path = public;
alter function public.generate_pnr() set search_path = public;

-- Revoke public EXECUTE; only authenticated users can call booking RPCs
revoke execute on function public.book_seat(uuid, uuid, jsonb) from public, anon;
revoke execute on function public.cancel_booking(uuid) from public, anon;
revoke execute on function public.reschedule_booking(uuid, uuid, uuid) from public, anon;
revoke execute on function public.generate_pnr() from public, anon;

grant execute on function public.book_seat(uuid, uuid, jsonb) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
grant execute on function public.reschedule_booking(uuid, uuid, uuid) to authenticated;
