"use client";

import { useEffect } from "react";

export function AtmosphereMode() {
  useEffect(() => {
    const sync = () => {
      const hour = new Date().getHours();
      document.documentElement.dataset.atmosphere = hour >= 18 || hour < 7 ? "night" : "day";
    };
    sync();
    const interval = window.setInterval(sync, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return null;
}
