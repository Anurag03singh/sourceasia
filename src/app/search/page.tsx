import { PageShell } from "@/components/layout/PageShell";
import { SearchForm } from "./search-form";

export const metadata = { title: "Search — Lovair" };

export default function SearchPage() {
  return (
    <PageShell title="Search flights" description="Choose where you're flying from and to.">
      <SearchForm />
    </PageShell>
  );
}
