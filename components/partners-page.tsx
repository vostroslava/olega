import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StructuredData } from "@/components/seo/structured-data";
import {
  MetricsBand,
  OperationsSection,
  RequestSection,
  SectionHeading,
} from "@/components/sections/home-sections";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import {
  PARTNER_AUDIENCES,
  PARTNER_BENEFITS,
  PARTNER_PROCESS,
  PRODUCTS,
} from "@/lib/site-data";
import { createBreadcrumbStructuredData } from "@/lib/seo";
import { assetPath } from "@/lib/site-utils";

export function PartnersPage() {
  return (
    <div className="page-shell">
      <StructuredData
        data={createBreadcrumbStructuredData([
          { name: "Главная", path: "/" },
          { name: "Партнёрам", path: "/partneram/" },
        ])}
      />
      <SiteHeader />

      <main className="page-main">
        <section className="page-hero page-hero-dark section">
          <div className="page-hero-backdrop">
            <Image
              src={assetPath("/assets/photos/team-consultation.png")}
              alt="Партнёрская и техническая консультация"
              fill
              priority
              sizes="100vw"
            />
          </div>

          <div className="container page-hero-shell reveal" id="partners-hero">
            <div className="page-hero-copy">
              <div className="page-breadcrumbs">
                <Link href="/">Главная</Link>
                <span>/</span>
                <span>Партнёрам</span>
              </div>

              <p className="section-kicker">B2B-направление</p>
              <h1>Решения для застройщиков, дилеров, архитекторов и подрядчиков</h1>
              <p className="hero-lead">
                Берём в работу коммерческие и партнёрские задачи, где важны расчёты, техническая
                поддержка, сроки и понятная коммуникация по объекту.
              </p>
              <p className="page-hero-text">
                Подключаемся как производитель и подрядчик к объектам разного масштаба: от
                дилерских поставок до комплексного фасадного и витражного контура.
              </p>

              <div className="hero-actions">
                <a className="button button-primary" href="#request">
                  Отправить партнёрский запрос
                </a>
                <Link className="button button-secondary" href="/proekty/">
                  Посмотреть кейсы
                </Link>
              </div>
            </div>

            <aside className="page-hero-rail reveal reveal-delay">
              <strong>Кому подходит формат</strong>
              <ul className="page-highlight-list">
                {PARTNER_AUDIENCES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="section project-links">
          <div className="container">
            <MetricsBand />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Что получает партнёр"
              title="Что получает партнёр в работе с нами"
            />

            <div className="service-crosslinks">
              {PARTNER_BENEFITS.map((item, index) => (
                <article
                  className={`partner-card reveal ${index === 1 ? "reveal-delay" : index === 2 ? "reveal-delay-2" : ""}`}
                  key={item.title}
                >
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section services" id="partner-process">
          <div className="container process-shell">
            <SectionHeading
              eyebrow="Как строится работа"
              title="Понятный партнёрский процесс без лишних касаний"
            />

            <div className="process-grid process-grid-partner">
              {PARTNER_PROCESS.map((item) => (
                <article className="process-card reveal" key={item.step}>
                  <span>{item.step}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <OperationsSection
          eyebrow="Как выглядит сопровождение"
          title="То, что партнёр получает помимо коммерческого предложения"
          description="Со старого сайта добрали рабочие материалы: выезд на объект, консультации, комплектующие, логистику и реальные зоны применения. Это лучше показывает зрелость подрядчика, чем придуманные отзывы."
        />

        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Куда вести дальше"
              title="Ключевые направления и кейсы для B2B-задач"
            />

            <div className="service-crosslinks">
              {PRODUCTS.slice(0, 3).map((product, index) => (
                <article
                  className={`partner-card reveal ${index === 1 ? "reveal-delay" : index === 2 ? "reveal-delay-2" : ""}`}
                  key={product.slug}
                >
                  <h3>{product.title}</h3>
                  <p>{product.text}</p>
                  <Link href={`/uslugi/${product.slug}/`}>Открыть направление</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <RequestSection
          eyebrow="Партнёрский запрос"
          title="Оставьте brief, и мы вернёмся с понятным следующим шагом"
          description="Для старта достаточно базового описания проекта, объёма работ и формата сотрудничества. Дальше уже подключаем расчёт и техпроработку."
          defaultProduct="Партнёрский запрос"
        />
      </main>

      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="partners-hero" requestId="request" href="#request" label="Партнёрский запрос" />
    </div>
  );
}
