"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function HomeMotion() {
  useGSAP(() => {
    const scope = document.querySelector<HTMLElement>(".home-main");
    if (!scope || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const media = gsap.matchMedia();
    media.add("(min-width: 861px)", () => {
      gsap.fromTo(
        ".glass-scroll-scene-media",
        { scale: 1.03, xPercent: 0, clipPath: "inset(0 44% 0 0)" },
        {
          scale: 1.12,
          xPercent: -3,
          clipPath: "inset(0 0% 0 0)",
          ease: "none",
          scrollTrigger: {
            trigger: "#glass-scene",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        }
      );

      gsap.fromTo(
        ".glass-scroll-blueprint-path",
        { strokeDashoffset: 1, opacity: 0.9 },
        {
          strokeDashoffset: 0,
          opacity: 0,
          stagger: 0.15,
          ease: "none",
          scrollTrigger: {
            trigger: "#glass-scene",
            start: "top 74%",
            end: "bottom 45%",
            scrub: 0.7,
          },
        }
      );

      gsap.fromTo(
        ".glass-scroll-scene-pane",
        { xPercent: -18, rotation: -2 },
        {
          xPercent: 10,
          rotation: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "#glass-scene",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.9,
          },
        }
      );

      gsap.fromTo(
        ".glass-thread",
        { scaleY: 0, transformOrigin: "top center" },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "#audiences",
            start: "top 84%",
            endTrigger: "#production",
            end: "bottom 58%",
            scrub: 0.7,
          },
        }
      );

      gsap.fromTo(
        ".audience-panel",
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 1.25,
          ease: "power3.out",
          stagger: 0.14,
          scrollTrigger: { trigger: "#audiences", start: "top 72%", once: true },
        }
      );

      gsap.fromTo(
        ".project-optic-frame",
        { autoAlpha: 0, scale: 0.94 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 1.15,
          ease: "power3.out",
          scrollTrigger: { trigger: "#projects", start: "top 67%", once: true },
        }
      );

      gsap.fromTo(
        ".production-scan-line",
        { yPercent: -120 },
        {
          yPercent: 120,
          duration: 1.7,
          ease: "power2.inOut",
          scrollTrigger: { trigger: "#production", start: "top 68%", once: true },
        }
      );
    });

    return () => media.revert();
  });

  return null;
}
