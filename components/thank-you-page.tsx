"use client";

import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RevealInit } from "@/components/ui/reveal-init";
import { CONTACTS } from "@/lib/site-data";

export function ThankYouPage() {
  return (
    <div className="page-shell">
      <SiteHeader />

      <main className="page-main">
        <section className="page-hero section">
          <div className="container thanks-shell reveal">
            <p className="eyebrow">Заявка принята</p>
            <h1>Спасибо, запрос уже в работе</h1>
            <p className="hero-lead">
              Мы сохранили заявку и вернёмся в ближайшее рабочее время.
            </p>

            <div className="thanks-grid">
              <article className="partner-card">
                <h3>Что дальше</h3>
                <p>
                  Сначала уточним базовые вводные, затем предложим следующий шаг: замер, brief или
                  формат расчёта под объект.
                </p>
              </article>
              <article className="partner-card">
                <h3>Если вопрос срочный</h3>
                <p>Позвоните нам напрямую, чтобы не ждать обратного контакта через форму.</p>
                <a className="contact-link" href={CONTACTS.phones[0].href}>
                  {CONTACTS.phones[0].label}
                </a>
              </article>
              <article className="partner-card">
                <h3>Пока можно посмотреть</h3>
                <p>Кейсы и страницы услуг помогут уточнить, какой формат решения вам ближе.</p>
                <Link href="/proekty/">Перейти к проектам</Link>
              </article>
            </div>

            <div className="hero-actions">
              <Link className="button button-primary" href="/">
                Вернуться на главную
              </Link>
              <Link className="button button-secondary" href="/kontakty/">
                Открыть контакты
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <RevealInit />
    </div>
  );
}
