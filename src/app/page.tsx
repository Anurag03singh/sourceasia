import Link from "next/link";
import { Plane, MapPin, Zap, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main>
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-24 md:px-6 md:py-32">
          <p className="text-sm font-medium text-accent">Flight booking</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Search flights, pick a seat, manage your trips.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Lovair is a small demo app for searching routes, booking with a live seat map, and cancelling or rescheduling
            when the rules allow it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-accent"
            >
              Search flights <Plane className="h-4 w-4 -rotate-45" />
            </Link>
            <Link
              href="/bookings"
              className="inline-flex items-center rounded-lg border border-black/15 px-5 py-2.5 text-sm font-medium hover:border-accent hover:text-accent"
            >
              My bookings
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 md:px-6">
        <ul className="grid gap-6 md:grid-cols-3">
          {[
            { icon: MapPin, title: "Eight routes", text: "NYC, London, Dubai, Singapore, LA, Tokyo, Paris, Frankfurt." },
            { icon: Zap, title: "Live seats", text: "Seat availability updates while you browse the map." },
            { icon: ShieldCheck, title: "Change rules", text: "Cancel or reschedule until two hours before departure." },
          ].map((item) => (
            <li key={item.title} className="rounded-lg border border-black/10 bg-white p-5">
              <item.icon className="h-5 w-5 text-accent" />
              <h2 className="mt-3 font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
