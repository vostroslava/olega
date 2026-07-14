import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { FilePdf } from "@phosphor-icons/react/dist/ssr/FilePdf";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MonolithCta, MonolithFact, MonolithFactRail, MonolithSectionHeading } from "@/components/ui/monolith-content";
import { MonolithPageHero } from "@/components/ui/monolith-page-hero";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { CERTIFICATION_DOCUMENTS, COMPANY_PILLARS, OPERATIONS_GALLERY, STANDARDS } from "@/lib/site-data";
import { assetPath } from "@/lib/site-utils";

export function AboutPage() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="page-main monolith-inner-page">
        <MonolithPageHero id="about-hero" breadcrumbs={[{ label: "Главная", href: "/" }, { label: "О компании" }]} title="СтеклоСтройГрупп — инженерия прозрачности" lead="Более 15 лет проектируем, производим и монтируем светопрозрачные конструкции для частных и коммерческих объектов по всей Беларуси." image="/assets/photos/hero-company-facade.png" imageAlt="Реализованный объект СтеклоСтройГрупп" rail={["Компания", "Компетенции", "Производство", "Документы", "Контакты"]} />

        <section className="monolith-content-section" id="section-1">
          <div className="container about-manifest-grid">
            <MonolithSectionHeading label="КОМПАНИЯ" title="Архитектурная идея должна пережить производство и монтаж" text="Поэтому проектирование, комплектация, изготовление, логистика и установка работают как один контур — с понятной ответственностью на каждом этапе." />
            <div className="about-manifest-image reveal"><Image src={assetPath("/assets/photos/team-site-supervision.png")} alt="Команда на объекте" fill sizes="(max-width: 860px) 100vw, 58vw" /></div>
          </div>
          <div className="container"><MonolithFactRail>{COMPANY_PILLARS.map((item, index) => <MonolithFact key={item.title} index={String(index + 1).padStart(2, "0")} title={item.title} text={item.text} />)}</MonolithFactRail></div>
        </section>

        <section className="monolith-content-section monolith-content-section-alt" id="section-2">
          <div className="container">
            <MonolithSectionHeading label="КОМПЕТЕНЦИИ" title="Дисциплина сложного объекта" />
            <div className="monolith-spec-grid">{STANDARDS.map((item, index) => <article className="reveal" key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
          </div>
        </section>

        <section className="monolith-content-section" id="section-3">
          <div className="container">
            <MonolithSectionHeading label="РАБОЧАЯ СРЕДА" title="Производство, объект и техническая консультация" />
            <div className="operations-editorial-grid">
              {OPERATIONS_GALLERY.slice(0, 5).map((item, index) => <article className={`reveal ${index === 0 ? "is-featured" : ""}`} key={item.title}><div><Image src={assetPath(item.image)} alt={item.alt} fill sizes="(max-width: 860px) 100vw, 40vw" /></div><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
            </div>
          </div>
        </section>

        <section className="monolith-content-section monolith-content-section-alt" id="section-4">
          <div className="container">
            <MonolithSectionHeading label="ДОКУМЕНТЫ" title="Сертификаты и подтверждение компетенций" text="Сохраняем документы старого сайта в новой структуре, чтобы заказчик мог проверить их без поиска по внешним страницам." />
            <div className="document-list">
              {CERTIFICATION_DOCUMENTS.map((document, index) => <a className="document-row reveal" href={document.href} target="_blank" rel="noreferrer" key={document.title}><span>{String(index + 1).padStart(2, "0")}</span><FilePdf size={28} weight="thin" /><div><strong>{document.title}</strong><small>{document.note}</small></div><ArrowUpRight size={24} weight="thin" /></a>)}
            </div>
          </div>
        </section>
        <MonolithCta title="Познакомимся на вашем объекте" text="Расскажите о задаче — команда подключит инженера и определит следующий шаг: brief, замер или техническую консультацию." />
      </main>
      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="about-hero" requestId="request" href="/raschet/" label="Обсудить проект" />
    </div>
  );
}
