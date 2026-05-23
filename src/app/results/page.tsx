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

export const metadata = { title: "Results — Lovair" };

export default async function ResultsPage({ searchParams }: Props) {
  const { origin, destination, date, passengers = "1" } = searchParams;

  if (!origin || !destination) {
    return (
      <PageShell title="Results" description="Run a search first.">
        <Link href="/search" className="text-sm font-medium text-accent hover:underline">
          Back to search
        </Link>
      </PageShell>
    );
  }

  const flights = await searchFlights({ origin, destination, date });

  return (
    <PageShell
      title={`${formatCity(origin)} → ${formatCity(destination)}`}
      description={`${date || "Any date"} · ${passengers} passenger${Number(passengers) > 1 ? "s" : ""}`}
    >
      <p className="mb-6">
        <Link href="/search" className="text-sm text-muted-foreground hover:text-accent">
          Change search
        </Link>
      </p>
      <ResultsList flights={flights} origin={origin} destination={destination} date={date} passengers={passengers} />
    </PageShell>
  );
}
