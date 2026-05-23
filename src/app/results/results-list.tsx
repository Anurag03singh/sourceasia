"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFlightStore } from "@/stores/flightStore";
import type { FlightWithClasses } from "@/lib/flights";
import { formatDate, formatTime, formatDuration, formatPrice } from "@/lib/format";
import { Button } from "@/components/Button";
import { Clock, Plane } from "lucide-react";

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
      <p className="rounded-lg border border-dashed border-black/15 bg-white p-10 text-center text-muted-foreground">
        No flights found. Try another date or route.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {flights.map((f) => (
        <li key={f.id} className="rounded-lg border border-black/10 bg-white p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="font-mono text-xs text-muted-foreground">{f.flight_no}</p>
              <p className="text-xs text-muted-foreground">{f.aircraft_type}</p>
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-4">
              <div>
                <p className="text-xl font-medium">{formatTime(f.departs_at)}</p>
                <p className="text-xs text-muted-foreground">
                  {f.origin} · {formatDate(f.departs_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDuration(f.departs_at, f.arrives_at)}
                <Plane className="h-4 w-4 -rotate-45" />
              </div>
              <div>
                <p className="text-xl font-medium">{formatTime(f.arrives_at)}</p>
                <p className="text-xs text-muted-foreground">{f.destination}</p>
              </div>
            </div>
            <div className="w-full md:w-auto md:text-right">
              <div className="flex flex-wrap gap-2">
                {f.classFares.map((cf) => (
                  <span key={cf.class} className="rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
                    {CLASS_LABELS[cf.class]} from {formatPrice(cf.fromPrice)}
                    {cf.availableCount === 0 ? " (full)" : ` · ${cf.availableCount} seats`}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Base fare {formatPrice(f.base_price)}</p>
              <Button
                className="mt-3"
                onClick={() => {
                  setSelectedFlight(f.id);
                  setStep("seat");
                  router.push(`/book/${f.id}`);
                }}
              >
                Select flight
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
