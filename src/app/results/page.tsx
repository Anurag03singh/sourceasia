import Link from "next/link";
import { searchFlights } from "@/lib/flights";
import { ResultsList } from "./results-list";
import { formatCity } from "@/lib/format";
import { PageShell } from "@/components/layout/PageShell";

type Props = {
  searchParams: {
    origin?: string;
    destination?: string;
    date?: string;
    passengers?: string;
  };
};

export const metadata = { title: "Flight results — Lovair" };

export default async function ResultsPage({ searchParams }: Props) {
  const { origin, destination, date, passengers = "1" } = searchParams;

  if (!origin || !destination) {
    return (
      <PageShell title="Results" description="Start with a search to see available flights.">
        <Link href="/search" className="btn-primary inline-flex">
          Search flights
        </Link>
      </PageShell>
    );
  }

  const flights = await searchFlights({ origin, destination, date });

  return (
    <PageShell
      eyebrow="Step 2 of 4"
      title={
        <>
          {formatCity(origin)} <span className="text-muted-foreground">→</span> {formatCity(destination)}
        </>
      }
      description={`${date || "All upcoming dates"} · ${passengers} passenger${Number(passengers) > 1 ? "s" : ""}`}
    >
      <div className="mb-8 flex justify-end">
        <Link href="/search" className="btn-outline !px-5 !py-2">
          Edit search
        </Link>
      </div>
      <ResultsList flights={flights} origin={origin} destination={destination} date={date} passengers={passengers} />
    </PageShell>
  );
}
