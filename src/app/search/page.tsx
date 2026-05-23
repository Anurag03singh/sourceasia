import { PageShell } from "@/components/layout/PageShell";
import { SearchForm } from "./search-form";

export const metadata = { title: "Search flights — Lovair" };

export default function SearchPage() {
  return (
    <PageShell
      eyebrow="Step 1 of 4"
      title="Where to next?"
      description="Pick an origin and destination from our network."
    >
      <SearchForm />
    </PageShell>
  );
}
