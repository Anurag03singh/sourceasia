"use client";

import { useRouter } from "next/navigation";
import { useFlightStore } from "@/stores/flightStore";
import { Button } from "@/components/Button";
import { Input, Label, Select } from "@/components/Field";
import { ALL_AIRPORTS, formatCity } from "@/lib/format";
import { ArrowRight, Plane } from "lucide-react";

export function SearchForm() {
  const router = useRouter();
  const { searchQuery, setSearchQuery, resetBooking } = useFlightStore();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.origin || !searchQuery.destination) return;
    resetBooking();
    const params = new URLSearchParams({
      origin: searchQuery.origin,
      destination: searchQuery.destination,
      passengers: String(searchQuery.passengers),
    });
    if (searchQuery.date) params.set("date", searchQuery.date);
    router.push(`/results?${params.toString()}`);
  }

  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={submit} className="rounded-lg border border-black/10 bg-white p-6">
      <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr]">
        <div>
          <Label htmlFor="origin">From</Label>
          <Select
            id="origin"
            required
            value={searchQuery.origin}
            onChange={(e) => setSearchQuery({ origin: e.target.value })}
          >
            <option value="">Pick origin</option>
            {ALL_AIRPORTS.map((a) => (
              <option key={a} value={a}>
                {formatCity(a)} ({a})
              </option>
            ))}
          </Select>
        </div>
        <div className="hidden items-end justify-center pb-2 md:flex">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <Label htmlFor="destination">To</Label>
          <Select
            id="destination"
            required
            value={searchQuery.destination}
            onChange={(e) => setSearchQuery({ destination: e.target.value })}
          >
            <option value="">Pick destination</option>
            {ALL_AIRPORTS.filter((a) => a !== searchQuery.origin).map((a) => (
              <option key={a} value={a}>
                {formatCity(a)} ({a})
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="date">Departure date</Label>
          <Input
            id="date"
            type="date"
            min={todayISO}
            value={searchQuery.date}
            onChange={(e) => setSearchQuery({ date: e.target.value })}
          />
          <p className="mt-1 text-xs text-muted-foreground">Optional — leave empty for all upcoming dates.</p>
        </div>
        <div>
          <Label htmlFor="passengers">Passengers</Label>
          <Input
            id="passengers"
            type="number"
            min={1}
            max={9}
            value={searchQuery.passengers}
            onChange={(e) => setSearchQuery({ passengers: Number(e.target.value) || 1 })}
          />
        </div>
      </div>

      <Button type="submit" disabled={!searchQuery.origin || !searchQuery.destination} className="mt-6">
        Search flights <Plane className="h-4 w-4 -rotate-45" />
      </Button>
    </form>
  );
}
