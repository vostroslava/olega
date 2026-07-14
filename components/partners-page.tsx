import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MonolithCta, MonolithFact, MonolithFactRail, MonolithSectionHeading } from "@/components/ui/monolith-content";
import { MonolithPageHero } from "@/components/ui/monolith-page-hero";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { PARTNER_AUDIENCES, PARTNER_BENEFITS, PARTNER_PROCESS, PRODUCTS } from "@/lib/site-data";
import { assetPath } from "@/lib/site-utils";

export function PartnersPage() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="page-main monolith-inner-page">
        <MonolithPageHero id="partners-hero" breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Партнёрам" }]} title="Проектный партнёр для сложного остекления" lead="Для застройщиков, архитекторов, генподрядчиков и дилеров: расчёты, производство, техподдержка, логистика и монтаж в одном контуре." image="/assets/photos/team-consultation.png" imageAlt="Техническая консультация с партнёрами" rail={["Форматы", "Преимущества", "Процесс", "Решения", "Запрос"]} primaryLabel="Отправить brief" />

        <section className="monolith-content-section" id="section-1">
          <div className="container partner-audience-layout">
            <MonolithSectionHeading label="ФОРМАТЫ" title="Подключаемся к проекту на нужной глубине" text="От производственной поставки по спецификации до полного контура с расчётом, проектированием и монтажом." />
            <div className="partner-audience-image reveal"><Image src={assetPath("/assets/photos/team-site-supervision.png")} alt="Технический контроль объекта" fill sizes="(max-width: 860px) 100vw, 58vw" /></div>
          </div>
          <div className="container partner-audience-rail">{PARTNER_AUDIENCES.map((item, index) => <article className="reveal" key={item}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item}</h3></article>)}</div>
        </section>

        <section className="monolith-content-section monolith-content-section-alt" id="section-2">
          <div className="container"><MonolithSectionHeading label="ПРЕИМУЩЕСТВА" title="Что получает партнёр" /><MonolithFactRail>{PARTNER_BENEFITS.map((item, index) => <MonolithFact key={item.title} index={String(index + 1).padStart(2, "0")} title={item.title} text={item.text} />)}</MonolithFactRail></div>
        </section>

        <section className="monolith-content-section" id="section-3">
          <div className="container"><MonolithSectionHeading label="ПРОЦЕСС" title="Понятная работа без лишних касаний" /><div className="monolith-process-line">{PARTNER_PROCESS.map((item) => <article className="reveal" key={item.step}><span>{item.step}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div>
        </section>

        <section className="monolith-content-section monolith-content-section-alt" id="section-4">
          <div className="container"><MonolithSectionHeading label="РЕШЕНИЯ" title="Ключевые направления для B2B" /><div className="partner-solution-links">{PRODUCTS.slice(1, 5).map((product, index) => <Link href={`/uslugi/${product.slug}/`} className="reveal" key={product.slug}><span>{String(index + 1).padStart(2, "0")}</span><strong>{product.title}</strong><p>{product.text}</p><ArrowUpRight size={28} weight="thin" /></Link>)}</div></div>
        </section>
        <MonolithCta title="Отправить партнёрский brief" text="Достаточно описания объекта, примерного объёма, сроков и формата сотрудничества. Технические детали доберём следующим касанием." action="Отправить запрос" />
      </main>
      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="partners-hero" requestId="request" href="/raschet/" label="Партнёрский запрос" />
    </div>
  );
}
