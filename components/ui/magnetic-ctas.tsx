"use client";

import { useEffect } from "react";

export function MagneticCtas() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 861px)");
    if (reducedMotion.matches || !desktop.matches) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const controllers = targets.map((target) => {
      let frame: number | null = null;
      const move = (event: PointerEvent) => {
        const rect = target.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 5;
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          target.style.setProperty("--magnetic-x", `${x}px`);
          target.style.setProperty("--magnetic-y", `${y}px`);
          frame = null;
        });
      };
      const leave = () => {
        target.style.setProperty("--magnetic-x", "0px");
        target.style.setProperty("--magnetic-y", "0px");
      };
      target.addEventListener("pointermove", move);
      target.addEventListener("pointerleave", leave);
      return () => {
        if (frame) cancelAnimationFrame(frame);
        target.removeEventListener("pointermove", move);
        target.removeEventListener("pointerleave", leave);
      };
    });
    return () => controllers.forEach((dispose) => dispose());
  }, []);

  return null;
}
