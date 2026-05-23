import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export type FlightRow = Database["public"]["Tables"]["flights"]["Row"];

export type ClassFare = {
  class: "economy" | "business" | "first";
  fromPrice: number;
  availableCount: number;
};

export type FlightWithClasses = FlightRow & { classFares: ClassFare[] };

export type FlightSearchInput = {
  origin: string;
  destination: string;
  date?: string;
};

/** Server-side flight search for Server Components — anon key, RLS-safe catalogue reads. */
export async function searchFlights(input: FlightSearchInput): Promise<FlightWithClasses[]> {
  const supabase = await createSupabaseServerClient();

  let q = supabase
    .from("flights")
    .select("*")
    .eq("status", "scheduled")
    .order("departs_at", { ascending: true });

  if (input.origin) q = q.eq("origin", input.origin);
  if (input.destination) q = q.eq("destination", input.destination);
  if (input.date) {
    const start = new Date(`${input.date}T00:00:00`).toISOString();
    const end = new Date(new Date(`${input.date}T00:00:00`).getTime() + 24 * 3_600_000).toISOString();
    q = q.gte("departs_at", start).lt("departs_at", end);
  }

  const { data: flightsRaw, error } = await q;
  if (error) throw error;
  const flights = (flightsRaw ?? []) as FlightRow[];
  if (!flights.length) return [];

  const flightIds = flights.map((f) => f.id);
  const { data: seatsRaw, error: seatsError } = await supabase
    .from("seats")
    .select("flight_id, class, extra_fee, is_available")
    .in("flight_id", flightIds);
  if (seatsError) throw seatsError;

  const seats = (seatsRaw ?? []) as Array<{
    flight_id: string;
    class: "economy" | "business" | "first";
    extra_fee: number;
    is_available: boolean;
  }>;

  return flights.map((flight) => {
    const flightSeats = seats.filter((s) => s.flight_id === flight.id);
    const classes: Array<"economy" | "business" | "first"> = ["economy", "business", "first"];
    const classFares: ClassFare[] = classes.map((cls) => {
      const inClass = flightSeats.filter((s) => s.class === cls);
      const available = inClass.filter((s) => s.is_available);
      const minExtra =
        available.length > 0
          ? Math.min(...available.map((s) => Number(s.extra_fee)))
          : inClass.length > 0
            ? Math.min(...inClass.map((s) => Number(s.extra_fee)))
            : 0;
      return {
        class: cls,
        fromPrice: Number(flight.base_price) + minExtra,
        availableCount: available.length,
      };
    });
    return { ...flight, classFares };
  });
}
