"use client";

import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useFlightStore } from "@/stores/flightStore";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Seat = {
  id: string;
  flight_id: string;
  seat_number: string;
  class: "economy" | "business" | "first";
  is_available: boolean;
  extra_fee: number;
};

type Props = {
  flightId: string;
  selectedSeatId: string | null;
  ownSeatIds?: string[]; // seats already booked by current user (for reschedule context)
  onSelect: (seat: Seat) => void;
};

const COLS = ["A", "B", "C", "D", "E", "F"];

export function SeatMap({ flightId, selectedSeatId, ownSeatIds = [], onSelect }: Props) {
  const queryClient = useQueryClient();
  const optimisticSeatIds = useFlightStore((s) => s.optimisticSeatIds);
  const supabase = getSupabaseBrowserClient();

  const { data: seats = [], isLoading } = useQuery({
    queryKey: ["seats", flightId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seats")
        .select("*")
        .eq("flight_id", flightId)
        .order("seat_number");
      if (error) throw error;
      return data as Seat[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`seats:${flightId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "seats", filter: `flight_id=eq.${flightId}` },
        (payload) => {
          queryClient.setQueryData<Seat[]>(["seats", flightId], (prev) =>
            (prev ?? []).map((s) => (s.id === (payload.new as Seat).id ? (payload.new as Seat) : s)),
          );
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [flightId, queryClient]);

  const rows = useMemo(() => {
    const map = new Map<number, Seat[]>();
    for (const s of seats) {
      const row = parseInt(s.seat_number.match(/^\d+/)?.[0] ?? "0", 10);
      if (!map.has(row)) map.set(row, []);
      map.get(row)!.push(s);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.seat_number.localeCompare(b.seat_number));
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [seats]);

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-secondary" />;
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="overflow-x-auto">
        <div className="mx-auto min-w-[340px] max-w-md rounded-2xl border border-border bg-gradient-to-b from-secondary/40 to-card p-4 shadow-sm md:p-6">
          {/* Cockpit nose */}
          <div className="mx-auto mb-4 h-8 w-20 rounded-t-full border-x border-t border-border bg-card" />

          {/* Column headers */}
          <div className="ml-7 grid grid-cols-[repeat(3,1fr)_0.5rem_repeat(3,1fr)] gap-1.5 px-1 text-center text-[10px] font-medium text-muted-foreground">
            {COLS.slice(0, 3).map((c) => <div key={c}>{c}</div>)}
            <div />
            {COLS.slice(3).map((c) => <div key={c}>{c}</div>)}
          </div>

          {rows.map(([rowNum, rowSeats], idx) => {
            const cls = rowSeats[0]?.class;
            const prevCls = idx > 0 ? rows[idx - 1][1][0]?.class : null;
            const showDivider = prevCls && prevCls !== cls;
            return (
              <div key={rowNum}>
                {showDivider && (
                  <div className="my-2 flex items-center gap-2 px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    {cls} class
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}
                {idx === 0 && (
                  <div className="my-2 flex items-center gap-2 px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    {cls} class
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}
                <div className="mt-1 grid grid-cols-[1.25rem_repeat(3,1fr)_0.5rem_repeat(3,1fr)] items-center gap-1.5 px-1">
                  <span className="text-center text-[10px] text-muted-foreground">{rowNum}</span>
                  {COLS.map((col, ci) => {
                    const seat = rowSeats.find((s) => s.seat_number.endsWith(col));
                    const cells: React.ReactNode[] = [];
                    if (ci === 3) cells.push(<div key={`aisle-${rowNum}`} />);
                    if (seat) {
                      cells.push(
                        <SeatButton
                          key={seat.id}
                          seat={seat}
                          selectedSeatId={selectedSeatId}
                          optimisticSeatIds={optimisticSeatIds}
                          ownSeatIds={ownSeatIds}
                          onSelect={onSelect}
                        />,
                      );
                    }
                    return cells;
                  })}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="mt-5 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground md:grid-cols-4">
            <Legend swatch="bg-seat-available border" label="Available" />
            <Legend swatch="bg-seat-selected" label="Selected" />
            <Legend swatch="bg-seat-occupied opacity-60" label="Occupied" />
            <Legend swatch="bg-seat-own" label="Your seat" />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded-sm", swatch)} />
      {label}
    </div>
  );
}

function SeatButton({
  seat, selectedSeatId, optimisticSeatIds, ownSeatIds, onSelect,
}: {
  seat: Seat;
  selectedSeatId: string | null;
  optimisticSeatIds: string[];
  ownSeatIds: string[];
  onSelect: (s: Seat) => void;
}) {
  const isOwn = ownSeatIds.includes(seat.id);
  const isOptimistic = optimisticSeatIds.includes(seat.id);
  const isSelected = selectedSeatId === seat.id || isOptimistic;
  const occupied = !seat.is_available && !isOwn && !isOptimistic;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          disabled={occupied}
          onClick={() => onSelect(seat)}
          className={cn(
            "h-8 w-full rounded-md text-[10px] font-medium transition active:scale-95 disabled:cursor-not-allowed",
            isOwn && "bg-seat-own text-white",
            !isOwn && isSelected && "bg-seat-selected text-accent-foreground ring-2 ring-offset-1 ring-accent",
            !isOwn && !isSelected && seat.is_available && "bg-seat-available text-foreground hover:bg-accent/30",
            occupied && "bg-seat-occupied text-muted-foreground opacity-60",
          )}
        >
          {seat.seat_number.replace(/^\d+/, "")}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="capitalize">{seat.class} · {seat.seat_number}</p>
        {seat.extra_fee > 0 && <p className="text-xs">+{formatPrice(seat.extra_fee)}</p>}
        {occupied && <p className="text-xs text-muted-foreground">Occupied</p>}
      </TooltipContent>
    </Tooltip>
  );
}
