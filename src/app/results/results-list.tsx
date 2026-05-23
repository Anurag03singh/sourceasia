"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFlightStore } from "@/stores/flightStore";
import type { FlightWithClasses } from "@/lib/flights";
import { formatDate, formatTime, formatDuration, formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Plane, Clock, ArrowRight } from "lucide-react";

const CLASS_LABELS: Record<string, string> = {
  economy: "Economy",
  business: "Business",
  first: "First",
};

export function ResultsList({
  flights,
  origin,
  destination,
  date,
  passengers,
}: {
  flights: FlightWithClasses[];
  origin: string;
  destination: string;
  date?: string;
  passengers: string;
}) {
  const router = useRouter();
  const { setSelectedFlight, setStep, setSearchQuery } = useFlightStore();

  useEffect(() => {
    setSearchQuery({
      origin,
      destination,
      date: date ?? "",
      passengers: Number(passengers) || 1,
    });
  }, [origin, destination, date, passengers, setSearchQuery]);

  if (!flights.length) {
    return (
      <div className="card-surface border-dashed p-12 text-center">
        <Plane className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 font-medium">No flights match your search</p>
        <p className="mt-1 text-sm text-muted-foreground">Try a different date or route.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {flights.map((f) => (
        <article
          key={f.id}
          className="hover-card group card-surface p-6 transition hover:border-accent"
        >
          <div className="flex flex-wrap items-center gap-6">
            <div className="shrink-0">
              <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs">{f.flight_no}</span>
              <p className="mt-2 text-xs text-muted-foreground">{f.aircraft_type}</p>
            </div>
            <div className="flex flex-1 items-center gap-4">
              <div>
                <p className="font-mono text-2xl font-medium">{formatTime(f.departs_at)}</p>
                <p className="text-xs text-muted-foreground">
                  {f.origin} · {formatDate(f.departs_at)}
                </p>
              </div>
              <div className="flex flex-1 items-center gap-2 text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" /> {formatDuration(f.departs_at, f.arrives_at)}
                </span>
                <div className="h-px flex-1 bg-border" />
                <Plane className="h-4 w-4 -rotate-45" />
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-medium">{formatTime(f.arrives_at)}</p>
                <p className="text-xs text-muted-foreground">{f.destination}</p>
              </div>
            </div>
            <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:items-end">
              <div className="flex flex-wrap gap-2">
                {f.classFares.map((cf) => (
                  <span key={cf.class} className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                    {CLASS_LABELS[cf.class]} from {formatPrice(cf.fromPrice)}
                    {cf.availableCount === 0 ? " · sold out" : ` · ${cf.availableCount} left`}
                  </span>
                ))}
              </div>
              <p className="text-right text-xs text-muted-foreground">Base {formatPrice(f.base_price)}</p>
              <Button
                onClick={() => {
                  setSelectedFlight(f.id);
                  setStep("seat");
                  router.push(`/book/${f.id}`);
                }}
                className="gap-1"
              >
                Select <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
