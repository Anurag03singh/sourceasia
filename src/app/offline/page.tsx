import Link from "next/link";

export const metadata = { title: "Offline — Lovair" };

export default function OfflinePage() {
  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">You&apos;re offline</h1>
      <p className="mt-2 text-muted-foreground">
        Search needs a connection. Cached bookings may still show under My bookings.
      </p>
      <div className="mt-8 flex justify-center gap-4 text-sm">
        <Link href="/bookings" className="font-medium text-accent hover:underline">
          My bookings
        </Link>
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Home
        </Link>
      </div>
    </main>
  );
}
