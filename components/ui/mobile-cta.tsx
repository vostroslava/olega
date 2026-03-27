"use client";

import { useEffect, useState } from "react";

type MobileCtaProps = {
  heroId: string;
  requestId: string;
  href: string;
  label: string;
};

export function MobileCta({ heroId, requestId, href, label }: MobileCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    const request = document.getElementById(requestId);

    if (!hero || !request) return;

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        if (window.innerWidth > 860) return;
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.18 }
    );

    const requestObserver = new IntersectionObserver(
      ([entry]) => {
        if (window.innerWidth > 860) return;
        if (entry.isIntersecting) setVisible(false);
      },
      { threshold: 0.2 }
    );

    heroObserver.observe(hero);
    requestObserver.observe(request);

    return () => {
      heroObserver.disconnect();
      requestObserver.disconnect();
    };
  }, [heroId, requestId]);

  return (
    <div className={`mobile-cta ${visible ? "is-visible" : ""}`} id="mobile-cta">
      <a className="button button-primary button-full" href={href}>
        {label}
      </a>
    </div>
  );
}
