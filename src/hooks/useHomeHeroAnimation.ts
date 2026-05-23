"use client";

import { useEffect } from "react";
import gsap from "gsap";

export function useHomeHeroAnimation() {
  useEffect(() => {
    function run() {
      gsap.to(".hero-glow", { opacity: 1, duration: 1.5, ease: "power2.out" });
      gsap.to(".hero-char", {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.2,
        stagger: 0.08,
        ease: "power3.out",
      });
      gsap.to(".hero-fade-in", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.3,
      });
    }

    if (sessionStorage.getItem("lovair-loader-seen") === "1") {
      run();
    } else {
      window.addEventListener("lovair:loader-done", run, { once: true });
      return () => window.removeEventListener("lovair:loader-done", run);
    }
  }, []);
}
