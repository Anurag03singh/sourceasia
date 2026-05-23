"use client";

import { useRouter } from "next/navigation";
import { useFlightStore } from "@/stores/flightStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <form onSubmit={submit} className="card-surface p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr]">
        <div>
          <Label>From</Label>
          <Select value={searchQuery.origin} onValueChange={(v) => setSearchQuery({ origin: v })}>
            <SelectTrigger className="mt-1 h-12">
              <SelectValue placeholder="Origin city" />
            </SelectTrigger>
            <SelectContent>
              {ALL_AIRPORTS.map((a) => (
                <SelectItem key={a} value={a}>
                  {formatCity(a)} ({a})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="hidden items-end justify-center pb-3 md:flex">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
        <div>
          <Label>To</Label>
          <Select value={searchQuery.destination} onValueChange={(v) => setSearchQuery({ destination: v })}>
            <SelectTrigger className="mt-1 h-12">
              <SelectValue placeholder="Destination city" />
            </SelectTrigger>
            <SelectContent>
              {ALL_AIRPORTS.filter((a) => a !== searchQuery.origin).map((a) => (
                <SelectItem key={a} value={a}>
                  {formatCity(a)} ({a})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="date">Departure date</Label>
          <Input
            id="date"
            type="date"
            className="mt-1 h-12"
            min={todayISO}
            value={searchQuery.date}
            onChange={(e) => setSearchQuery({ date: e.target.value })}
          />
          <p className="mt-1 text-xs text-muted-foreground">Leave blank to see all upcoming dates.</p>
        </div>
        <div>
          <Label htmlFor="passengers">Passengers</Label>
          <Input
            id="passengers"
            type="number"
            min={1}
            max={9}
            className="mt-1 h-12"
            value={searchQuery.passengers}
            onChange={(e) => setSearchQuery({ passengers: Number(e.target.value) || 1 })}
          />
        </div>
      </div>

      <Button type="submit" disabled={!searchQuery.origin || !searchQuery.destination} className="mt-6 h-12 w-full md:w-auto md:px-8">
        Search flights <Plane className="ml-2 h-4 w-4 -rotate-45" />
      </Button>
    </form>
  );
}
