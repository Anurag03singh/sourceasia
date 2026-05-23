"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cancelBooking, rescheduleBooking } from "@/lib/supabase/rpc";
import type { Database } from "@/lib/database.types";
import { useUserStore } from "@/stores/userStore";
import { useFlightStore } from "@/stores/flightStore";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { SeatMap } from "@/components/SeatMap";
import { toast } from "sonner";
import { formatCity, formatDate, formatTime, formatPrice } from "@/lib/format";

type FlightRow = Database["public"]["Tables"]["flights"]["Row"];

type BookingWithRels = {
  id: string;
  pnr_code: string;
  status: "confirmed" | "rescheduled" | "cancelled";
  total_price: number;
  seat_id: string;
  flight_id: string;
  flights: {
    id: string;
    flight_no: string;
    origin: string;
    destination: string;
    departs_at: string;
    arrives_at: string;
    base_price: number;
  };
  seats: { seat_number: string; class: string };
};

export function BookingsView() {
  const userId = useUserStore((s) => s.userId);
  const cached = useUserStore((s) => s.cachedBookings);
  const setCached = useUserStore((s) => s.setCachedBookings);
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-bookings", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, flights(*), seats(seat_number, class)")
        .order("booked_at", { ascending: false });
      if (error) throw error;
      return data as unknown as BookingWithRels[];
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (data) {
      setCached(
        data.map((b) => ({
          id: b.id,
          pnr_code: b.pnr_code,
          status: b.status,
          flight_no: b.flights.flight_no,
          origin: b.flights.origin,
          destination: b.flights.destination,
          departs_at: b.flights.departs_at,
          seat_number: b.seats.seat_number,
          total_price: b.total_price,
        })),
      );
    }
  }, [data, setCached]);

  const [cancelTarget, setCancelTarget] = useState<BookingWithRels | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<BookingWithRels | null>(null);

  async function confirmCancel() {
    if (!cancelTarget) return;
    const { error } = await cancelBooking(supabase, cancelTarget.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Booking cancelled");
      useFlightStore.getState().resetBooking();
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    }
    setCancelTarget(null);
  }

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">My bookings</h1>
        <p className="mt-2 text-muted-foreground">Sign in to see your trips.</p>
        <Link href="/login" className="mt-6 inline-block">
          <Button>Sign in</Button>
        </Link>
      </main>
    );
  }

  const bookings = data ?? [];
  const showingOffline = Boolean(error) && cached.length > 0;
  const list = bookings.length
    ? bookings
    : (cached.map((c) => ({
        id: c.id,
        pnr_code: c.pnr_code,
        status: c.status as BookingWithRels["status"],
        total_price: c.total_price,
        seat_id: "",
        flight_id: "",
        flights: {
          id: "",
          flight_no: c.flight_no,
          origin: c.origin,
          destination: c.destination,
          departs_at: c.departs_at,
          arrives_at: c.departs_at,
          base_price: 0,
        },
        seats: { seat_number: c.seat_number, class: "" },
      })) as BookingWithRels[]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="text-2xl font-semibold">My bookings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {showingOffline ? "Offline — showing cached trips." : "Cancel or reschedule when allowed."}
      </p>

      {isLoading && !cached.length ? (
        <div className="mt-8 space-y-3">
          <div className="h-28 animate-pulse rounded-lg bg-secondary" />
          <div className="h-28 animate-pulse rounded-lg bg-secondary" />
        </div>
      ) : !list.length ? (
        <p className="mt-12 rounded-lg border border-dashed border-black/15 p-10 text-center text-muted-foreground">
          No bookings yet.{" "}
          <Link href="/search" className="text-accent hover:underline">
            Find a flight
          </Link>
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {list.map((b) => {
            const departed = new Date(b.flights.departs_at) < new Date();
            const within2h = new Date(b.flights.departs_at).getTime() - Date.now() < 2 * 3600 * 1000;
            const canModify = !departed && !within2h && b.status !== "cancelled" && !showingOffline;
            const badgeTone =
              b.status === "cancelled" ? "danger" : b.status === "rescheduled" ? "muted" : "default";

            return (
              <li key={b.id} className="rounded-lg border border-black/10 bg-white p-5">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={badgeTone}>{b.status}</StatusBadge>
                      <span className="font-mono text-xs text-muted-foreground">PNR {b.pnr_code}</span>
                    </div>
                    <p className="mt-2 text-lg font-medium">
                      {formatCity(b.flights.origin)} → {formatCity(b.flights.destination)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {b.flights.flight_no} · {formatDate(b.flights.departs_at)} {formatTime(b.flights.departs_at)} ·
                      Seat {b.seats.seat_number}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(b.total_price)}</p>
                    {canModify && (
                      <div className="mt-3 flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setRescheduleTarget(b)}>
                          Reschedule
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setCancelTarget(b)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                    {!canModify && b.status !== "cancelled" && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {departed ? "Already departed" : within2h ? "Less than 2 hours before departure" : null}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel booking?"
        description="Your seat will be released. This cannot be undone."
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setCancelTarget(null)}>
            Keep it
          </Button>
          <Button variant="danger" onClick={confirmCancel}>
            Cancel booking
          </Button>
        </div>
      </Modal>

      <RescheduleModal
        booking={rescheduleTarget}
        onClose={() => {
          setRescheduleTarget(null);
          queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        }}
      />
    </main>
  );
}

function RescheduleModal({ booking, onClose }: { booking: BookingWithRels | null; onClose: () => void }) {
  const [flightId, setFlightId] = useState<string | null>(null);
  const [seatId, setSeatId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    setFlightId(null);
    setSeatId(null);
  }, [booking?.id]);

  const { data: alternatives } = useQuery({
    queryKey: ["alt-flights", booking?.flights.origin, booking?.flights.destination, booking?.flight_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flights")
        .select("*")
        .eq("origin", booking!.flights.origin)
        .eq("destination", booking!.flights.destination)
        .neq("id", booking!.flight_id)
        .gt("departs_at", new Date(Date.now() + 2 * 3600 * 1000).toISOString())
        .eq("status", "scheduled")
        .order("departs_at");
      if (error) throw error;
      return data as FlightRow[];
    },
    enabled: !!booking,
  });

  async function confirm() {
    if (!booking || !flightId || !seatId) return;
    setSubmitting(true);
    const { error } = await rescheduleBooking(supabase, {
      p_booking_id: booking.id,
      p_new_flight_id: flightId,
      p_new_seat_id: seatId,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Rescheduled");
      onClose();
    }
    setSubmitting(false);
  }

  return (
    <Modal
      open={!!booking}
      onClose={onClose}
      title="Reschedule"
      description="Same route, different flight. You may pay a fare difference."
      className="w-[min(100%,48rem)]"
    >
      {!flightId ? (
        <ul className="space-y-2">
          {alternatives?.length ? (
            alternatives.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setFlightId(f.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-black/10 p-4 text-left hover:border-accent"
                >
                  <span>
                    <span className="font-mono text-xs text-muted-foreground">{f.flight_no}</span>
                    <br />
                    {formatDate(f.departs_at)} · {formatTime(f.departs_at)} → {formatTime(f.arrives_at)}
                  </span>
                  <span className="font-medium">{formatPrice(f.base_price)}</span>
                </button>
              </li>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">No other flights on this route.</p>
          )}
        </ul>
      ) : (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => { setFlightId(null); setSeatId(null); }}>
            ← Pick another flight
          </Button>
          <SeatMap flightId={flightId} selectedSeatId={seatId} onSelect={(s) => setSeatId(s.id)} />
          <Button onClick={confirm} disabled={!seatId || submitting} className="w-full">
            {submitting ? "Saving…" : "Confirm reschedule"}
          </Button>
        </div>
      )}
    </Modal>
  );
}
