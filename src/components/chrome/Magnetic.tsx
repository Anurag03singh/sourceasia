"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      data-magnetic
      className={`magnetic-wrap ${className ?? ""}`}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - rect.left - rect.width / 2) * 0.2,
          y: (e.clientY - rect.top - rect.height / 2) * 0.2,
          duration: 0.2,
        });
      }}
      onMouseLeave={() => {
        gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
      }}
    >
      {children}
    </div>
  );
}
