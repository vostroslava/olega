"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowDown } from "@phosphor-icons/react/dist/csr/ArrowDown";
import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { Factory } from "@phosphor-icons/react/dist/csr/Factory";
import { SealCheck } from "@phosphor-icons/react/dist/csr/SealCheck";
import { ShieldCheck } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { assetPath } from "@/lib/site-utils";

export function OpticalHero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const pointerFrame = useRef<number | null>(null);

  useGSAP(
    () => {
      const hero = heroRef.current;
      if (!hero) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const hasSeenIntro = window.sessionStorage.getItem("stg-glass-intro") === "seen";
      const targets = hero.querySelectorAll<HTMLElement>("[data-hero-reveal]");
      const proof = hero.querySelector<HTMLElement>("[data-hero-proof]");
      const shutter = hero.querySelector<HTMLElement>(".optical-hero-intro-shutter");
      const revealTargets = Array.from(targets);
      if (proof) revealTargets.push(proof);

      if (reducedMotion || hasSeenIntro) {
        gsap.set(targets, { autoAlpha: 1, y: 0 });
        gsap.set(proof, { autoAlpha: 1, x: 0 });
        gsap.set(shutter, { autoAlpha: 0, xPercent: 130 });
        return;
      }

      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .set(revealTargets, { autoAlpha: 0 })
        .to(shutter, { xPercent: 130, duration: 1.15, ease: "expo.inOut" }, 0.08)
        .to(targets, { autoAlpha: 1, y: 0, duration: 0.82, stagger: 0.1 }, 0.46)
        .call(() => window.sessionStorage.setItem("stg-glass-intro", "seen"));

      if (proof) {
        timeline.to(proof, { autoAlpha: 1, x: 0, duration: 0.72 }, 0.75);
      }
    },
    { scope: heroRef }
  );

  useEffect(
    () => () => {
      if (pointerFrame.current) window.cancelAnimationFrame(pointerFrame.current);
    },
    []
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const hero = event.currentTarget;

    if (pointerFrame.current) window.cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = window.requestAnimationFrame(() => {
      hero.style.setProperty("--hero-x", `${x * 16}px`);
      hero.style.setProperty("--hero-y", `${y * 10}px`);
      hero.style.setProperty("--light-x", `${(x + 0.5) * 100}%`);
      hero.style.setProperty("--light-y", `${(y + 0.5) * 100}%`);
      pointerFrame.current = null;
    });
  };

  const resetPointer = () => {
    heroRef.current?.style.setProperty("--hero-x", "0px");
    heroRef.current?.style.setProperty("--hero-y", "0px");
    heroRef.current?.style.setProperty("--light-x", "72%");
    heroRef.current?.style.setProperty("--light-y", "34%");
  };

  return (
    <section
      className="optical-hero"
      id="hero-shell"
      ref={heroRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <div className="optical-hero-media" aria-hidden="true">
        <Image
          src={assetPath("/assets/visuals/hero-optical-monolith.png")}
          alt=""
          fill
          priority
          sizes="100vw"
        />
      </div>
      <div className="optical-hero-shade" aria-hidden="true" />
      <div className="optical-light-caustic" aria-hidden="true" />
      <div className="optical-hero-intro-shutter" aria-hidden="true" />
      <div className="optical-ruler optical-ruler-left" aria-hidden="true" />
      <div className="optical-ruler optical-ruler-bottom" aria-hidden="true" />

      <div className="container optical-hero-inner">
        <div className="optical-hero-copy reveal is-visible" data-hero-reveal>
          <h1>Стекло,<br />которое<span className="hero-mobile-break"><br /></span> меняет<br />архитектуру</h1>
          <p className="optical-hero-lead">
            Окна, фасады и панорамное остекление — от замера и проектирования до производства и монтажа по всей Беларуси.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/raschet/" data-magnetic>
              <span>Рассчитать проект</span>
              <ArrowUpRight size={20} weight="thin" aria-hidden="true" />
            </Link>
            <Link className="button button-secondary button-on-dark" href="/proekty/" data-magnetic>
              <span>Смотреть объекты</span>
              <ArrowUpRight size={20} weight="thin" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <aside className="optical-proof" data-hero-proof aria-label="Преимущества компании">
          <div>
            <ShieldCheck size={30} weight="thin" aria-hidden="true" />
            <span><strong>15+</strong> лет опыта</span>
          </div>
          <div>
            <Factory size={30} weight="thin" aria-hidden="true" />
            <span>Собственное<br />производство</span>
          </div>
          <div>
            <SealCheck size={30} weight="thin" aria-hidden="true" />
            <span>ISO 9001:2015</span>
          </div>
        </aside>

        <a className="hero-scroll" href="#audiences" aria-label="Перейти к следующему разделу">
          <span>Прокрутите вниз</span>
          <ArrowDown size={20} weight="thin" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
