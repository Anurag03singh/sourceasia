"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { bookSeat } from "@/lib/supabase/rpc";
import type { Database } from "@/lib/database.types";

type FlightRow = Database["public"]["Tables"]["flights"]["Row"];
import { useFlightStore } from "@/stores/flightStore";
import { useUserStore } from "@/stores/userStore";
import { SeatMap } from "@/components/SeatMap";
import { Button } from "@/components/Button";
import { Input, Label } from "@/components/Field";
import { toast } from "sonner";
import { formatCity, formatDate, formatTime, formatPrice } from "@/lib/format";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function BookFlow({ flightId }: { flightId: string }) {
  const router = useRouter();
  const userId = useUserStore((s) => s.userId);
  const supabase = getSupabaseBrowserClient();
  const {
    selectedSeatId,
    setSelectedSeat,
    markSeatOptimistic,
    clearSeatOptimistic,
    passengerForm,
    setPassengerForm,
    resetBooking,
  } = useFlightStore();
  const [stage, setStage] = useState<"seat" | "passenger">("seat");
  const [submitting, setSubmitting] = useState(false);

  const { data: flight } = useQuery({
    queryKey: ["flight", flightId],
    queryFn: async () => {
      const { data, error } = await supabase.from("flights").select("*").eq("id", flightId).single();
      if (error) throw error;
      return data as FlightRow;
    },
  });

  const { data: selectedSeat } = useQuery({
    queryKey: ["seat", selectedSeatId],
    queryFn: async () => {
      if (!selectedSeatId) return null;
      const { data, error } = await supabase.from("seats").select("*").eq("id", selectedSeatId).maybeSingle();
      if (error) throw error;
      return data as { flight_id: string; seat_number: string; class: string; extra_fee: number } | null;
    },
    enabled: !!selectedSeatId,
  });

  useEffect(() => {
    if (selectedSeat && selectedSeat.flight_id !== flightId) {
      setSelectedSeat(null);
    }
  }, [selectedSeat, flightId, setSelectedSeat]);

  async function handleBook() {
    if (!userId) {
      toast.error("Please sign in to book");
      router.push("/login");
      return;
    }
    if (!selectedSeatId) return;
    setSubmitting(true);
    try {
      const { data, error } = await bookSeat(supabase, {
        p_flight_id: flightId,
        p_seat_id: selectedSeatId,
        p_passengers: [
          {
            full_name: passengerForm.full_name,
            passport_no: passengerForm.passport_no,
            nationality: passengerForm.nationality,
            dob: passengerForm.dob,
          },
        ],
      });
      if (error) throw error;
      const booking = (Array.isArray(data) ? data[0] : data) as { id: string; pnr_code: string };
      toast.success(`Booked! PNR ${booking.pnr_code}`);
      resetBooking();
      router.push(`/confirmation/${booking.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!flight) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="h-32 animate-pulse rounded-2xl bg-secondary" />
      </main>
    );
  }

  const totalPrice = flight.base_price + (selectedSeat?.extra_fee ?? 0);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
      <Link href="/results" className="text-sm text-muted-foreground hover:text-accent">
        ← Back to results
      </Link>

      <div className="mt-6 border-b border-black/10 pb-6">
        <h1 className="text-2xl font-semibold">{stage === "seat" ? "Pick a seat" : "Passenger details"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-mono">{flight.flight_no}</span> · {formatCity(flight.origin)} →{" "}
            {formatCity(flight.destination)} · {formatDate(flight.departs_at)} {formatTime(flight.departs_at)}
          </p>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <section>
          {stage === "seat" ? (
            <SeatMap
              flightId={flightId}
              selectedSeatId={selectedSeatId}
              onSelect={(s) => {
                if (selectedSeatId) clearSeatOptimistic(selectedSeatId);
                setSelectedSeat(s.id);
                markSeatOptimistic(s.id);
              }}
            />
          ) : (
            <div className="rounded-lg border border-black/10 bg-white p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full name (as on passport)</Label>
                  <Input
                    id="name"
                    required
                    value={passengerForm.full_name}
                    onChange={(e) => setPassengerForm({ full_name: e.target.value })}
                    className="mt-1 h-11"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="passport">Passport number</Label>
                    <Input
                      id="passport"
                      required
                      value={passengerForm.passport_no}
                      onChange={(e) => setPassengerForm({ passport_no: e.target.value })}
                      className="mt-1 h-11"
                      maxLength={20}
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">Not saved to your browser.</p>
                  </div>
                  <div>
                    <Label htmlFor="nat">Nationality</Label>
                    <Input
                      id="nat"
                      required
                      value={passengerForm.nationality}
                      onChange={(e) => setPassengerForm({ nationality: e.target.value })}
                      className="mt-1 h-11"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    required
                    value={passengerForm.dob}
                    onChange={(e) => setPassengerForm({ dob: e.target.value })}
                    className="mt-1 h-11"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="h-fit rounded-lg border border-black/10 bg-white p-6 md:sticky md:top-24">
          <h3 className="font-semibold">Summary</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Flight</dt>
              <dd className="font-mono">{flight.flight_no}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Route</dt>
              <dd>
                {flight.origin} → {flight.destination}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Date</dt>
              <dd>{formatDate(flight.departs_at)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Seat</dt>
              <dd className="font-mono">{selectedSeat?.seat_number ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Class</dt>
              <dd className="capitalize">{selectedSeat?.class ?? "—"}</dd>
            </div>
          </dl>
          <hr className="my-4 border-border" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base fare</span>
            <span>{formatPrice(flight.base_price)}</span>
          </div>
          {selectedSeat && selectedSeat.extra_fee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Seat upgrade</span>
              <span>+{formatPrice(selectedSeat.extra_fee)}</span>
            </div>
          )}
          <div className="mt-3 flex items-end justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-mono text-2xl font-medium">{formatPrice(totalPrice)}</span>
          </div>

          {stage === "seat" ? (
            <Button disabled={!selectedSeatId} onClick={() => setStage("passenger")} className="mt-6 w-full gap-1">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="mt-6 space-y-2">
              <Button
                onClick={handleBook}
                disabled={
                  submitting ||
                  !passengerForm.full_name ||
                  !passengerForm.passport_no ||
                  !passengerForm.nationality ||
                  !passengerForm.dob
                }
                className="w-full"
              >
                {submitting ? "Booking…" : "Confirm booking"}
              </Button>
              <Button variant="ghost" onClick={() => setStage("seat")} className="w-full">
                Back to seat
              </Button>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
