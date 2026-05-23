import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Offline — Lovair" };

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <WifiOff className="h-7 w-7" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold uppercase tracking-tighter">You&apos;re offline</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Flight search needs a connection. Your last saved bookings are still available on My Bookings.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/bookings">
          <Button>My bookings</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Home</Button>
        </Link>
      </div>
    </main>
  );
}
