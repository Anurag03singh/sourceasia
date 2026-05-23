"use client";

import Link from "next/link";
import { LogOut, Plane } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { useFlightStore } from "@/stores/flightStore";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function Nav() {
  const email = useUserStore((s) => s.email);
  const reset = useUserStore((s) => s.reset);

  async function signOut() {
    await getSupabaseBrowserClient().auth.signOut();
    reset();
    useFlightStore.getState().resetBooking();
  }

  const linkClass = "text-sm text-muted-foreground hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="h-4 w-4 -rotate-45" />
          </span>
          Lovair
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/search" className={linkClass}>
            Search
          </Link>
          <Link href="/bookings" className={linkClass}>
            Bookings
          </Link>
          {email ? (
            <button type="button" onClick={signOut} className={`inline-flex items-center gap-1 ${linkClass}`}>
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-accent"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
