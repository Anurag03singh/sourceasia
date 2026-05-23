"use client";

import Link from "next/link";
import { ArrowDown, Plane, ShieldCheck, Zap, MapPin } from "lucide-react";
import { HeroCanvas } from "@/components/chrome/HeroCanvas";
import { Magnetic } from "@/components/chrome/Magnetic";
import { RouteMarquee } from "@/components/chrome/RouteMarquee";
import { useHomeHeroAnimation } from "@/hooks/useHomeHeroAnimation";

export function HomeHero() {
  useHomeHeroAnimation();

  return (
    <>
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-20 md:px-6 md:pt-0">
        <HeroCanvas />
        <div className="hero-glow animate-pulse opacity-0" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1800px] flex-col items-center text-center">
          <div className="hero-fade-in mb-8 flex translate-y-4 items-center gap-3 rounded-full border border-white/20 bg-white/40 px-4 py-1.5 opacity-0 shadow-sm backdrop-blur-md md:mb-12">
            <div className="flex h-3 items-center gap-1">
              <span className="h-full w-1 animate-pulse rounded-full bg-accent" />
              <span className="h-2/3 w-1 animate-pulse rounded-full bg-accent [animation-delay:0.2s]" />
              <span className="h-full w-1 animate-pulse rounded-full bg-accent [animation-delay:0.4s]" />
            </div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-primary md:text-xs">
              Flight Management PWA
            </span>
          </div>

          <h1 className="flex flex-col items-center text-[13vw] font-semibold uppercase leading-[0.9] tracking-tighter text-primary mix-blend-darken md:text-[10vw]">
            <div className="overflow-hidden">
              <span className="hero-char">Fly with</span>
            </div>
            <div className="overflow-hidden">
              <span className="hero-char text-accent">Lovair</span>
            </div>
          </h1>

          <div className="hero-fade-in mx-auto mt-8 max-w-xl translate-y-4 opacity-0 md:mt-12">
            <p className="text-balance text-base leading-relaxed text-muted-foreground md:text-xl">
              Search routes, pick seats with{" "}
              <span className="font-medium text-primary">live availability</span>, and manage bookings — reschedule or
              cancel securely.
            </p>
          </div>

          <div className="hero-fade-in mt-10 flex translate-y-4 flex-wrap justify-center gap-4 opacity-0 md:mt-14">
            <Magnetic>
              <Link href="/search" className="btn-primary gap-2">
                Search flights <Plane className="h-4 w-4 -rotate-45" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/bookings" className="btn-outline">
                My bookings
              </Link>
            </Magnetic>
          </div>
        </div>

        <div className="hero-fade-in absolute bottom-8 left-1/2 -translate-x-1/2 translate-y-4 animate-bounce opacity-0">
          <ArrowDown className="h-5 w-5 text-muted-foreground/50" />
        </div>
      </section>

      <RouteMarquee />

      <section className="mx-auto max-w-[1800px] px-4 py-20 md:px-6 md:py-32">
        <div className="mb-12 flex flex-col items-end justify-between border-b border-black/10 pb-6 md:mb-16 md:flex-row">
          <h2 className="text-4xl font-semibold uppercase tracking-tighter md:text-6xl">Why Lovair</h2>
          <span className="mt-2 font-mono text-xs text-muted-foreground md:mt-0">Built for the assignment spec</span>
        </div>
        <div className="grid gap-8 md:grid-cols-3 md:gap-12">
          {[
            {
              icon: MapPin,
              title: "Global routes",
              body: "Eight live routes across NYC, London, Dubai, Singapore, LA, Tokyo, Paris and Frankfurt.",
            },
            {
              icon: Zap,
              title: "Live seat map",
              body: "Realtime seat updates — no double bookings via atomic RPC seat lock.",
            },
            {
              icon: ShieldCheck,
              title: "Flexible & safe",
              body: "Reschedule on the same route or cancel — 2-hour rule enforced in Postgres.",
            },
          ].map((f) => (
            <div key={f.title} className="card-surface p-6 md:p-8">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight md:text-3xl">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
