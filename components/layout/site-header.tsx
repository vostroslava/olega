"use client";

import Link from "next/link";
import { useState } from "react";
import { CONTACTS, NAV_ITEMS } from "@/lib/site-data";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar-inner">
          <p>{CONTACTS.cityLine}</p>
          <div className="topbar-links">
            <a href={CONTACTS.phones[0].href}>{CONTACTS.phones[0].label}</a>
            <a href={`mailto:${CONTACTS.primaryEmail}`}>{CONTACTS.primaryEmail}</a>
          </div>
        </div>
      </div>

      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="СтеклоСтройГрупп" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">ССГ</span>
          <span className="brand-copy">
            <strong>СтеклоСтройГрупп</strong>
            <small>Окна, фасады, витражи, панорамное остекление</small>
          </span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
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
          <Link className="nav-cta" href="/#request" onClick={() => setMenuOpen(false)}>
            Получить расчёт
          </Link>
        </nav>
      </div>
    </header>
  );
}
