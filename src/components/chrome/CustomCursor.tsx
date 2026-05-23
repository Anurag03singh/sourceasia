"use client";

import { useEffect } from "react";
import gsap from "gsap";

export function CustomCursor() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.body.classList.add("has-custom-cursor");

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    const circle = document.createElement("div");
    circle.className = "cursor-circle";
    document.body.append(dot, circle);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.set(dot, { x: mouseX, y: mouseY });
    };

    const ticker = () => {
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      circle.style.left = `${cursorX}px`;
      circle.style.top = `${cursorY}px`;
    };

    const onEnter = () => document.body.classList.add("cursor-hover");
    const onLeave = () => document.body.classList.remove("cursor-hover");

    document.addEventListener("mousemove", onMove);
    gsap.ticker.add(ticker);

    const bind = (el: Element) => {
      if ((el as HTMLElement).dataset.cursorBound) return;
      (el as HTMLElement).dataset.cursorBound = "1";
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    };

    document.querySelectorAll("a, button, [data-magnetic], input, select, textarea, label").forEach(bind);

    const observer = new MutationObserver(() => {
      document.querySelectorAll("a, button, [data-magnetic]").forEach(bind);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      gsap.ticker.remove(ticker);
      observer.disconnect();
      dot.remove();
      circle.remove();
      document.body.classList.remove("has-custom-cursor", "cursor-hover");
    };
  }, []);

  return null;
}
