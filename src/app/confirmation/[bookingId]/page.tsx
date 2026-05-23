import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCity, formatDate, formatTime, formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Plane } from "lucide-react";

type Props = { params: { bookingId: string } };

export const metadata = { title: "Booking confirmed — Lovair" };

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
    <main className="mx-auto max-w-2xl px-4 py-16 md:py-24">
      <div className="card-surface overflow-hidden">
        <div className="bg-primary p-8 text-primary-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            <span className="font-mono text-xs uppercase tracking-widest text-white/90">Confirmed</span>
          </div>
          <h1 className="mt-3 text-4xl font-semibold uppercase tracking-tighter md:text-5xl">You&apos;re booked.</h1>
          <p className="mt-2 text-white/75">Your PNR is your reference — save it.</p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-sm border border-white/10 bg-white/10 px-5 py-3 backdrop-blur">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/70">PNR</span>
            <span className="font-mono text-2xl tracking-[0.3em] text-accent">{booking.pnr_code}</span>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">From</p>
              <p className="mt-1 font-mono text-3xl font-medium">{booking.flights.origin}</p>
              <p className="text-sm text-muted-foreground">{formatCity(booking.flights.origin)}</p>
              <p className="mt-2 text-2xl">{formatTime(booking.flights.departs_at)}</p>
              <p className="text-xs text-muted-foreground">{formatDate(booking.flights.departs_at)}</p>
            </div>
            <div className="px-4 pt-8">
              <Plane className="h-6 w-6 -rotate-45 text-muted-foreground" />
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">To</p>
              <p className="mt-1 font-mono text-3xl font-medium">{booking.flights.destination}</p>
              <p className="text-sm text-muted-foreground">{formatCity(booking.flights.destination)}</p>
              <p className="mt-2 text-2xl">{formatTime(booking.flights.arrives_at)}</p>
              <p className="text-xs text-muted-foreground">{formatDate(booking.flights.arrives_at)}</p>
            </div>
          </div>

          <hr className="my-6 border-dashed border-border" />

          <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
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
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Passenger</p>
              {booking.passengers.map((p) => (
                <div key={p.id} className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary">{p.nationality}</Badge>
                  <span className="font-medium">{p.full_name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/bookings" className="flex-1">
              <Button className="w-full">View my bookings</Button>
            </Link>
            <Link href="/search" className="flex-1">
              <Button variant="outline" className="w-full">
                Book another trip
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
