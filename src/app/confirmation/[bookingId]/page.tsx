import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCity, formatDate, formatTime, formatPrice } from "@/lib/format";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle2, Plane } from "lucide-react";

type Props = { params: { bookingId: string } };

export const metadata = { title: "Confirmed — Lovair" };

export default async function ConfirmationPage({ params }: Props) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, flights(*), seats(*), passengers(*)")
    .eq("id", params.bookingId)
    .single();

  if (error || !data) notFound();

  type BookingDetail = {
    pnr_code: string;
    total_price: number;
    flights: { flight_no: string; origin: string; destination: string; departs_at: string; arrives_at: string };
    seats: { seat_number: string; class: string };
    passengers: { id: string; full_name: string; nationality: string }[];
  };
  const booking = data as unknown as BookingDetail;

  return (
    <main className="mx-auto max-w-lg px-4 py-10 md:py-14">
      <div className="rounded-lg border border-black/10 bg-white overflow-hidden">
        <div className="bg-primary p-6 text-primary-foreground">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            Confirmed
          </div>
          <h1 className="mt-2 text-2xl font-semibold">You&apos;re booked</h1>
          <p className="mt-2 text-sm text-white/80">Save your PNR for check-in.</p>
          <p className="mt-4 font-mono text-2xl tracking-widest text-accent">{booking.pnr_code}</p>
        </div>

        <div className="p-6">
          <div className="flex justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-xl font-medium">{booking.flights.origin}</p>
              <p className="text-sm text-muted-foreground">{formatCity(booking.flights.origin)}</p>
              <p className="mt-2">{formatTime(booking.flights.departs_at)}</p>
              <p className="text-xs text-muted-foreground">{formatDate(booking.flights.departs_at)}</p>
            </div>
            <Plane className="mt-6 h-5 w-5 shrink-0 -rotate-45 text-muted-foreground" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">To</p>
              <p className="text-xl font-medium">{booking.flights.destination}</p>
              <p className="text-sm text-muted-foreground">{formatCity(booking.flights.destination)}</p>
              <p className="mt-2">{formatTime(booking.flights.arrives_at)}</p>
              <p className="text-xs text-muted-foreground">{formatDate(booking.flights.arrives_at)}</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Flight</dt>
              <dd className="font-mono">{booking.flights.flight_no}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Seat</dt>
              <dd className="font-mono">{booking.seats.seat_number}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Class</dt>
              <dd className="capitalize">{booking.seats.class}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Total</dt>
              <dd>{formatPrice(booking.total_price)}</dd>
            </div>
          </dl>

          {booking.passengers?.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-muted-foreground">Passenger</p>
              {booking.passengers.map((p) => (
                <p key={p.id} className="mt-1 font-medium">
                  {p.full_name}{" "}
                  <StatusBadge tone="muted" className="ml-1">
                    {p.nationality}
                  </StatusBadge>
                </p>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <Link href="/bookings" className="flex-1">
              <Button className="w-full">My bookings</Button>
            </Link>
            <Link href="/search" className="flex-1">
              <Button variant="outline" className="w-full">
                Book another
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
