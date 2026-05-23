"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";

const STORAGE_KEY = "lovair-loader-seen";

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      setVisible(false);
      return;
    }

    document.body.classList.add("overflow-hidden");
    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setVisible(false);
        document.body.classList.remove("overflow-hidden");
        window.dispatchEvent(new CustomEvent("lovair:loader-done"));
      },
    });

    tl.to(
      {},
      {
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: function () {
          setPct(Math.round(this.progress() * 100));
        },
      },
    ).to("#lovair-loader", { yPercent: -100, duration: 0.6, ease: "power4.inOut" });

    return () => {
      tl.kill();
      document.body.classList.remove("overflow-hidden");
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div id="lovair-loader" className="page-loader">
      <div className="flex flex-col items-center gap-4">
        <div className="font-mono text-6xl font-bold tracking-tighter md:text-8xl">{pct}%</div>
        <div className="relative h-px w-32 overflow-hidden bg-gray-800">
          <div className="absolute inset-y-0 left-0 bg-accent transition-all duration-100" style={{ width: `${pct}%` }} />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">Lovair</p>
      </div>
    </div>
  );
}
