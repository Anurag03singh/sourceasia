import type { Json } from "@/lib/database.types";
import type { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Client = ReturnType<typeof getSupabaseBrowserClient>;

type RpcResult<T> = Promise<{ data: T | null; error: { message: string } | null }>;

type RpcCall = <T>(fn: string, args: Record<string, unknown>) => RpcResult<T>;

function rpc<T>(client: Client, fn: string, args: Record<string, unknown>): RpcResult<T> {
  const call = client.rpc.bind(client) as unknown as RpcCall;
  return call<T>(fn, args);
}

type PassengerPayload = {
  full_name: string;
  passport_no: string;
  nationality: string;
  dob: string;
};

type BookingRow = { id: string; pnr_code: string };

export function bookSeat(
  client: Client,
  args: { p_flight_id: string; p_seat_id: string; p_passengers: PassengerPayload[] },
) {
  return rpc<BookingRow>(client, "book_seat", {
    p_flight_id: args.p_flight_id,
    p_seat_id: args.p_seat_id,
    p_passengers: args.p_passengers as Json,
  });
}

export function cancelBooking(client: Client, p_booking_id: string) {
  return rpc<BookingRow>(client, "cancel_booking", { p_booking_id });
}

export function rescheduleBooking(
  client: Client,
  args: { p_booking_id: string; p_new_flight_id: string; p_new_seat_id: string },
) {
  return rpc<BookingRow>(client, "reschedule_booking", args);
}
