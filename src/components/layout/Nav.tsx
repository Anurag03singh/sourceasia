"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { useFlightStore } from "@/stores/flightStore";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Magnetic } from "@/components/chrome/Magnetic";

export function Nav() {
  const pathname = usePathname();
  const email = useUserStore((s) => s.email);
  const reset = useUserStore((s) => s.reset);
  const isHome = pathname === "/";

  async function signOut() {
    await getSupabaseBrowserClient().auth.signOut();
    reset();
    useFlightStore.getState().resetBooking();
  }

  if (isHome) {
    return (
      <nav className="pointer-events-none fixed top-0 left-0 z-50 flex w-full items-center justify-between px-4 py-5 mix-blend-difference text-white md:px-6">
        <Link
          href="/"
          className="pointer-events-auto font-mono text-sm font-semibold uppercase tracking-widest transition-colors hover:text-accent"
        >
          Lovair
          <br />
          Flights
        </Link>
        <div className="pointer-events-auto flex items-center gap-4 md:gap-10">
          <div className="hidden gap-8 rounded-full border border-white/10 bg-white/10 px-6 py-2 backdrop-blur-md md:flex">
            <Link href="/search" className="font-mono text-xs uppercase tracking-widest transition-colors hover:text-accent">
              Search
            </Link>
            <Link href="/bookings" className="font-mono text-xs uppercase tracking-widest transition-colors hover:text-accent">
              Bookings
            </Link>
          </div>
          <Magnetic>
            {email ? (
              <button
                type="button"
                onClick={signOut}
                className="rounded-full bg-white px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black shadow-lg transition-colors duration-200 hover:bg-accent hover:text-white"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-white px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black shadow-lg transition-colors duration-200 hover:bg-accent hover:text-white"
              >
                Sign in
              </Link>
            )}
          </Magnetic>
        </div>
      </nav>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="font-mono text-sm font-semibold uppercase tracking-widest text-primary hover:text-accent">
          Lovair
        </Link>
        <nav className="flex items-center gap-2 md:gap-6">
          <Link href="/search" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-accent">
            Search
          </Link>
          <Link href="/bookings" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-accent">
            Bookings
          </Link>
          {email ? (
            <button
              type="button"
              onClick={signOut}
              className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 font-mono text-xs uppercase tracking-widest hover:border-accent hover:text-accent"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Out</span>
            </button>
          ) : (
            <Magnetic>
              <Link href="/login" className="btn-primary !px-5 !py-2">
                Sign in
              </Link>
            </Magnetic>
          )}
        </nav>
      </div>
    </header>
  );
}
