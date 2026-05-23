"use client";

import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useFlightStore } from "@/stores/flightStore";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

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
  ownSeatIds?: string[];
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
    return () => {
      supabase.removeChannel(channel);
    };
  }, [flightId, queryClient, supabase]);

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
    return <div className="h-80 animate-pulse rounded-lg bg-secondary" />;
  }

  return (
    <div className="overflow-x-auto">
      <div className="mx-auto min-w-[320px] max-w-md rounded-lg border border-black/10 bg-white p-4">
        <div className="mx-auto mb-4 h-6 w-16 rounded-t-full border border-b-0 border-black/10" />

        <div className="ml-6 grid grid-cols-[repeat(3,1fr)_0.5rem_repeat(3,1fr)] gap-1 text-center text-[10px] text-muted-foreground">
          {COLS.slice(0, 3).map((c) => (
            <div key={c}>{c}</div>
          ))}
          <div />
          {COLS.slice(3).map((c) => (
            <div key={c}>{c}</div>
          ))}
        </div>

        {rows.map(([rowNum, rowSeats], idx) => {
          const cabin = rowSeats[0]?.class;
          const prevCabin = idx > 0 ? rows[idx - 1][1][0]?.class : null;
          return (
            <div key={rowNum}>
              {(idx === 0 || prevCabin !== cabin) && (
                <p className="my-2 text-center text-[10px] uppercase text-muted-foreground">{cabin}</p>
              )}
              <div className="grid grid-cols-[1rem_repeat(3,1fr)_0.5rem_repeat(3,1fr)] items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{rowNum}</span>
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

        <ul className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <li className="flex items-center gap-1">
            <span className="h-3 w-3 rounded border bg-seat-available" /> Available
          </li>
          <li className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-seat-selected" /> Selected
          </li>
          <li className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-seat-occupied" /> Taken
          </li>
        </ul>
      </div>
    </div>
  );
}

function SeatButton({
  seat,
  selectedSeatId,
  optimisticSeatIds,
  ownSeatIds,
  onSelect,
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
  const taken = !seat.is_available && !isOwn && !isOptimistic;

  const label = `${seat.seat_number} (${seat.class}${seat.extra_fee ? `, +${formatPrice(seat.extra_fee)}` : ""})`;

  return (
    <button
      type="button"
      title={label}
      disabled={taken}
      onClick={() => onSelect(seat)}
      className={cn(
        "h-7 w-full rounded text-[10px] font-medium",
        isOwn && "bg-seat-own text-white",
        !isOwn && isSelected && "bg-seat-selected text-white ring-2 ring-accent",
        !isOwn && !isSelected && seat.is_available && "border border-black/10 bg-seat-available hover:bg-accent/20",
        taken && "bg-seat-occupied text-muted-foreground",
      )}
    >
      {seat.seat_number.replace(/^\d+/, "")}
    </button>
  );
}
