import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StructuredData } from "@/components/seo/structured-data";
import { MonolithCta, MonolithFact, MonolithFactRail, MonolithSectionHeading } from "@/components/ui/monolith-content";
import { MonolithPageHero } from "@/components/ui/monolith-page-hero";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { PRODUCTS, SERVICE_SELECTION_STEPS } from "@/lib/site-data";
import { createBreadcrumbStructuredData, createItemListStructuredData } from "@/lib/seo";
import { assetPath } from "@/lib/site-utils";

export function ProductsCatalogPage() {
  return (
    <div className="page-shell">
      <StructuredData data={createBreadcrumbStructuredData([{ name: "Главная", path: "/" }, { name: "Продукция", path: "/produktsiya/" }])} />
      <StructuredData data={createItemListStructuredData(PRODUCTS.map((product) => ({ name: product.title, path: `/uslugi/${product.slug}/` })))} />
      <SiteHeader />
      <main className="page-main monolith-inner-page">
        <MonolithPageHero
          id="services-catalog-hero"
          breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Продукция" }]}
          title="Продукция из ПВХ, алюминия и стекла"
          lead="Окна, двери, фасады, витражи и нестандартные светопрозрачные конструкции собственного производства."
          image="/assets/photos/project-avenue.png"
          imageAlt="Реальный фасад объекта СтеклоСтройГрупп"
          rail={["Каталог", "Подбор", "Процесс", "Объекты", "Расчёт"]}
        />

        <section className="monolith-content-section" id="section-1">
          <div className="container">
            <MonolithSectionHeading label="КАТАЛОГ ПРОДУКЦИИ" title="Шесть направлений — одно производство" text="Каждое направление раскрыто на отдельной странице: применение, преимущества, комплектация и связанные объекты." />
            <div className="solution-catalog-list">
              {PRODUCTS.map((product, index) => (
                <Link className="solution-catalog-row reveal" href={`/uslugi/${product.slug}/`} key={product.slug}>
                  <span className="solution-catalog-index">{String(index + 1).padStart(2, "0")}</span>
                  <div className="solution-catalog-media">
                    <Image src={assetPath(product.image)} alt={product.alt} fill sizes="(max-width: 860px) 100vw, 38vw" />
                  </div>
                  <div className="solution-catalog-copy">
                    <small>{product.tag}</small>
                    <h2>{product.title}</h2>
                    <p>{product.text}</p>
                  </div>
                  <ArrowUpRight size={32} weight="thin" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="monolith-content-section monolith-content-section-alt" id="section-2">
          <div className="container">
            <MonolithSectionHeading label="ПОДБОР СИСТЕМЫ" title="Как быстро выбрать продукт" />
            <MonolithFactRail>
              {SERVICE_SELECTION_STEPS.map((item, index) => (
                <MonolithFact key={item.title} index={String(index + 1).padStart(2, "0")} title={item.title} text={item.text} />
              ))}
            </MonolithFactRail>
          </div>
        </section>

        <section className="monolith-route-band" id="section-3">
          <div className="container monolith-route-grid">
            <Link href="/dlya-doma/"><span>01</span><strong>Для дома</strong><small>Комфорт, свет и тепло</small><ArrowUpRight size={28} weight="thin" /></Link>
            <Link href="/dlya-biznesa/"><span>02</span><strong>Для бизнеса</strong><small>Фасады и коммерческие системы</small><ArrowUpRight size={28} weight="thin" /></Link>
            <Link href="/uslugi/"><span>03</span><strong>Услуги</strong><small>От замера до сервисного обслуживания</small><ArrowUpRight size={28} weight="thin" /></Link>
          </div>
        </section>

        <MonolithCta title="Не уверены, какая система нужна?" text="Опишите объект или приложите фото. Мы определим подходящее направление и подготовим вопросы для инженера." />
      </main>
      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="services-catalog-hero" requestId="request" href="/raschet/" label="Подобрать систему" />
    </div>
  );
}
