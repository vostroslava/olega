"use client";

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CONTACTS } from "@/lib/site-data";

export function ThankYouPage() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="status-page-main">
        <div className="container status-page-card">
          <Check size={54} weight="thin" aria-hidden="true" />
          <p className="optical-label">ЗАЯВКА ПРИНЯТА</p>
          <h1>Спасибо.<br />Проект уже в работе</h1>
          <p>Инженер проверит исходные данные и вернётся с понятным следующим шагом. Если вопрос срочный — {CONTACTS.phones[0].label}.</p>
          <div className="hero-actions"><Link className="button button-primary" href="/">На главную <ArrowUpRight size={20} weight="thin" /></Link><Link className="button button-secondary button-on-dark" href="/proekty/">Смотреть проекты <ArrowUpRight size={20} weight="thin" /></Link></div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
