"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cancelBooking, rescheduleBooking } from "@/lib/supabase/rpc";
import type { Database } from "@/lib/database.types";

type FlightRow = Database["public"]["Tables"]["flights"]["Row"];
import { useUserStore } from "@/stores/userStore";
import { useFlightStore } from "@/stores/flightStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SeatMap } from "@/components/SeatMap";
import { toast } from "sonner";
import { formatCity, formatDate, formatTime, formatPrice } from "@/lib/format";
import { Plane, CalendarClock, X } from "lucide-react";

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
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Booking cancelled");
      useFlightStore.getState().resetBooking();
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    }
    setCancelTarget(null);
  }

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold uppercase tracking-tighter">My Bookings</h1>
        <p className="mt-2 text-muted-foreground">Sign in to view your trips.</p>
        <Link href="/login">
          <Button className="mt-6">Sign in</Button>
        </Link>
      </main>
    );
  }

  const bookings = data ?? [];
  const showingOffline = Boolean(error) && cached.length > 0;

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-16 md:px-6 md:py-24">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Your trips</p>
      <h1 className="mt-3 text-4xl font-semibold uppercase tracking-tighter md:text-6xl">My Bookings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {showingOffline ? "Showing last-cached data (offline)." : "Manage your trips."}
      </p>

      {isLoading && !cached.length ? (
        <div className="mt-8 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-secondary" />
          ))}
        </div>
      ) : !bookings.length && !cached.length ? (
        <div className="card-surface mt-12 border-dashed p-12 text-center">
          <Plane className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No bookings yet</p>
          <Link href="/search">
            <Button className="mt-4">Find a flight</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {(bookings.length
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
              })) as BookingWithRels[])
          ).map((b) => {
            const departed = new Date(b.flights.departs_at) < new Date();
            const within2h = new Date(b.flights.departs_at).getTime() - Date.now() < 2 * 3600 * 1000;
            const canModify = !departed && !within2h && b.status !== "cancelled" && !showingOffline;
            return (
              <article key={b.id} className="card-surface p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          b.status === "cancelled" ? "destructive" : b.status === "rescheduled" ? "secondary" : "default"
                        }
                        className="capitalize"
                      >
                        {b.status}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">PNR {b.pnr_code}</span>
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                      {formatCity(b.flights.origin)} → {formatCity(b.flights.destination)}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <Badge variant="outline" className="font-mono">
                        {b.flights.flight_no}
                      </Badge>{" "}
                      · {formatDate(b.flights.departs_at)} {formatTime(b.flights.departs_at)} · Seat{" "}
                      <span className="font-mono">{b.seats.seat_number}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-2xl font-medium">{formatPrice(b.total_price)}</p>
                    {canModify && (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setRescheduleTarget(b)}>
                          <CalendarClock className="mr-1 h-3.5 w-3.5" /> Reschedule
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setCancelTarget(b)}>
                          <X className="mr-1 h-3.5 w-3.5" /> Cancel
                        </Button>
                      </div>
                    )}
                    {!canModify && b.status !== "cancelled" && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {departed ? "Flight has departed" : within2h ? "Within 2h of departure — locked" : ""}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>Your seat will be released. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RescheduleDialog
        booking={rescheduleTarget}
        onClose={() => {
          setRescheduleTarget(null);
          queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        }}
      />
    </main>
  );
}

function RescheduleDialog({ booking, onClose }: { booking: BookingWithRels | null; onClose: () => void }) {
  const [chosenFlightId, setChosenFlightId] = useState<string | null>(null);
  const [chosenSeatId, setChosenSeatId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    setChosenFlightId(null);
    setChosenSeatId(null);
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
    if (!booking || !chosenFlightId || !chosenSeatId) return;
    setSubmitting(true);
    const { error } = await rescheduleBooking(supabase, {
      p_booking_id: booking.id,
      p_new_flight_id: chosenFlightId,
      p_new_seat_id: chosenSeatId,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Booking rescheduled");
      onClose();
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Reschedule booking</DialogTitle>
          <DialogDescription>
            Pick a different flight on the same route. Any price difference will be charged.
          </DialogDescription>
        </DialogHeader>

        {!chosenFlightId ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Available flights</p>
            {alternatives?.length ? (
              alternatives.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setChosenFlightId(f.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition hover:border-accent"
                >
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{f.flight_no}</p>
                    <p className="mt-1 font-medium">
                      {formatDate(f.departs_at)} · {formatTime(f.departs_at)} → {formatTime(f.arrives_at)}
                    </p>
                  </div>
                  <span className="font-mono text-xl font-medium">{formatPrice(f.base_price)}</span>
                </button>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No alternative flights available.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => { setChosenFlightId(null); setChosenSeatId(null); }}>
              ← Change flight
            </Button>
            <SeatMap flightId={chosenFlightId} selectedSeatId={chosenSeatId} onSelect={(s) => setChosenSeatId(s.id)} />
            <Button onClick={confirm} disabled={!chosenSeatId || submitting} className="w-full">
              {submitting ? "Rescheduling…" : "Confirm reschedule"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
