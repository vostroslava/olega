"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONTACTS, NAV_ITEMS } from "@/lib/site-data";

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
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="СтеклоСтройГрупп" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">С</span>
          <span className="brand-copy">
            <strong>СтеклоСтройГрупп</strong>
            <small>ПВХ, алюминий, фасады, витражи</small>
          </span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`site-nav ${menuOpen ? "is-open" : ""}`} id="site-nav">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          <a className="nav-phone" href={CONTACTS.phones[0].href} onClick={() => setMenuOpen(false)}>
            {CONTACTS.phones[0].label}
          </a>
          <Link className="nav-cta" href="/#request" onClick={() => setMenuOpen(false)}>
            Получить расчёт
          </Link>
        </nav>
      </div>
    </header>
  );
}
