"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { List } from "@phosphor-icons/react/dist/csr/List";
import { Phone } from "@phosphor-icons/react/dist/csr/Phone";
import { SquareHalf } from "@phosphor-icons/react/dist/csr/SquareHalf";
import { X } from "@phosphor-icons/react/dist/csr/X";
import { CONTACTS, NAV_ITEMS } from "@/lib/site-data";
import { assetPath } from "@/lib/site-utils";
import { MagneticCtas } from "@/components/ui/magnetic-ctas";
import { AtmosphereMode } from "@/components/ui/atmosphere-mode";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const closeOnDesktop = () => {
      if (window.innerWidth > 860) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", closeOnDesktop);
    return () => window.removeEventListener("resize", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const shouldLockScroll = menuOpen && window.innerWidth <= 860;
    document.body.style.overflow = shouldLockScroll ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <MagneticCtas />
      <AtmosphereMode />
      <header className="site-header">
        <div className="container header-inner">
        <Link className="brand" href="/" aria-label="СтеклоСтройГрупп" onClick={() => setMenuOpen(false)}>
          <SquareHalf className="brand-mark" size={30} weight="thin" aria-hidden="true" />
          <strong>СтеклоСтройГрупп</strong>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? "Закрыть" : "Меню"}</span>
          {menuOpen ? <X size={28} weight="thin" /> : <List size={30} weight="thin" />}
        </button>

        <nav
          className={`site-nav ${menuOpen ? "is-open" : ""}`}
          id="site-nav"
          style={{ "--nav-scene": `url("${assetPath("/assets/visuals/hero-optical-monolith.png")}")` } as CSSProperties}
        >
          <div className="nav-primary-links">
            {NAV_ITEMS.map((item) => item.href === "/o-kompanii/" ? (
              <div className="nav-company-menu" key={item.href}>
                <Link href={item.href} onClick={() => setMenuOpen(false)}>
                  <span>{item.label}</span>
                  <ArrowUpRight size={19} weight="thin" aria-hidden="true" />
                </Link>
                <div className="nav-company-panel" aria-label="Разделы компании">
                  <Link href="/o-kompanii/">О компании</Link>
                  <Link href="/proizvodstvo/">Производство</Link>
                  <Link href="/partneram/">Партнёрам</Link>
                  <Link href="/novosti/">Новости</Link>
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                <span>{item.label}</span>
                <ArrowUpRight size={19} weight="thin" aria-hidden="true" />
              </Link>
            ))}
          </div>

          <div className="nav-mobile-extras">
            <Link href="/proizvodstvo/" onClick={() => setMenuOpen(false)}>Производство</Link>
            <Link href="/partneram/" onClick={() => setMenuOpen(false)}>Партнёрам</Link>
            <Link href="/novosti/" onClick={() => setMenuOpen(false)}>Новости</Link>
          </div>

          <div className="nav-mobile-contact">
            <Link className="nav-cta" href="/raschet/" onClick={() => setMenuOpen(false)}>
              <span>Рассчитать проект</span>
              <ArrowUpRight size={20} weight="thin" aria-hidden="true" />
            </Link>
            <a className="nav-phone" href={CONTACTS.phones[0].href} onClick={() => setMenuOpen(false)}>
              <Phone size={21} weight="thin" aria-hidden="true" />
              {CONTACTS.phones[0].label}
            </a>
            <a className="nav-phone nav-phone-secondary" href={CONTACTS.phones[1].href} onClick={() => setMenuOpen(false)}>
              {CONTACTS.phones[1].label}
            </a>
          </div>
        </nav>

        <Link className="header-cta" href="/raschet/" data-magnetic>
          <span>Рассчитать проект</span>
          <ArrowUpRight size={20} weight="thin" aria-hidden="true" />
        </Link>
        </div>
      </header>
    </>
  );
}
