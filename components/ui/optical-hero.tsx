"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowDown } from "@phosphor-icons/react/dist/csr/ArrowDown";
import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { ArrowsHorizontal } from "@phosphor-icons/react/dist/csr/ArrowsHorizontal";
import { Factory } from "@phosphor-icons/react/dist/csr/Factory";
import { SealCheck } from "@phosphor-icons/react/dist/csr/SealCheck";
import { ShieldCheck } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { assetPath } from "@/lib/site-utils";

export function OpticalHero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const glassZoneRef = useRef<HTMLDivElement | null>(null);
  const pointerFrame = useRef<number | null>(null);
  const glassDragging = useRef(false);
  const glassPosition = useRef(42);

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
    if (window.innerWidth <= 860) return;
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
      hero.style.setProperty("--desktop-glass-x", `${Math.min(80, Math.max(46, (x + 0.5) * 100))}%`);
      pointerFrame.current = null;
    });
  };

  const resetPointer = () => {
    heroRef.current?.style.setProperty("--hero-x", "0px");
    heroRef.current?.style.setProperty("--hero-y", "0px");
    heroRef.current?.style.setProperty("--light-x", "72%");
    heroRef.current?.style.setProperty("--light-y", "34%");
    heroRef.current?.style.setProperty("--desktop-glass-x", "65%");
  };

  const setGlassPosition = (position: number) => {
    const clampedPosition = Math.min(68, Math.max(18, position));
    glassPosition.current = clampedPosition;
    heroRef.current?.style.setProperty("--mobile-glass-x", `${clampedPosition}%`);
    glassZoneRef.current?.setAttribute("aria-valuenow", `${Math.round(clampedPosition)}`);
  };

  const updateGlassFromPointer = (clientX: number) => {
    const hero = heroRef.current;
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    setGlassPosition(((clientX - rect.left) / rect.width) * 100);
  };

  const handleGlassPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    glassDragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateGlassFromPointer(event.clientX);
  };

  const handleGlassPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!glassDragging.current) return;
    event.stopPropagation();
    updateGlassFromPointer(event.clientX);
  };

  const handleGlassPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    glassDragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleGlassKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    setGlassPosition(glassPosition.current + (event.key === "ArrowRight" ? 4 : -4));
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
          src={assetPath("/assets/visuals/hero-desktop-before.webp")}
          alt=""
          fill
          loading="lazy"
          sizes="100vw"
        />
      </div>
      <div className="desktop-glass-reveal" aria-hidden="true">
        <Image
          src={assetPath("/assets/visuals/hero-desktop-after.webp")}
          alt=""
          fill
          loading="lazy"
          sizes="100vw"
        />
      </div>
      <Image
        className="desktop-glass-edge"
        src={assetPath("/assets/visuals/hero-desktop-glass-edge.webp")}
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
      />
      <div className="mobile-glass-scene" aria-hidden="true">
        <div className="mobile-glass-base">
          <Image
            src={assetPath("/assets/visuals/hero-mobile-house-before.webp")}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="mobile-glass-reveal">
          <Image
            src={assetPath("/assets/visuals/hero-mobile-house.webp")}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <Image
          className="mobile-glass-edge"
          src={assetPath("/assets/visuals/hero-mobile-glass-edge.webp")}
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
            <span className="hero-lead-desktop">Окна, фасады и панорамное остекление — от замера и проектирования до производства и монтажа по всей Беларуси.</span>
            <span className="hero-lead-mobile">От замера до монтажа<br />по всей Беларуси.</span>
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

      <div
        className="mobile-glass-gesture-zone"
        ref={glassZoneRef}
        role="slider"
        tabIndex={0}
        aria-label="Положение стеклянной кромки"
        aria-valuemin={18}
        aria-valuemax={68}
        aria-valuenow={42}
        onPointerDown={handleGlassPointerDown}
        onPointerMove={handleGlassPointerMove}
        onPointerUp={handleGlassPointerEnd}
        onPointerCancel={handleGlassPointerEnd}
        onKeyDown={handleGlassKeyDown}
      >
        <div className="mobile-glass-control" aria-hidden="true">
          <span className="mobile-glass-knob" />
          <span className="mobile-glass-hint">Проведите<br />по стеклу</span>
          <ArrowsHorizontal className="mobile-glass-direction" size={46} weight="thin" />
        </div>
      </div>
    </section>
  );
}
