import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StructuredData } from "@/components/seo/structured-data";
import {
  MetricsBand,
  ProcessSection,
  ProductsSection,
  RequestSection,
  SectionHeading,
} from "@/components/sections/home-sections";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { PRODUCTS, SERVICE_SELECTION_STEPS } from "@/lib/site-data";
import { createBreadcrumbStructuredData, createItemListStructuredData } from "@/lib/seo";
import { assetPath } from "@/lib/site-utils";

export function ServicesCatalogPage() {
  return (
    <div className="page-shell">
      <StructuredData
        data={createBreadcrumbStructuredData([
          { name: "Главная", path: "/" },
          { name: "Услуги", path: "/uslugi/" },
        ])}
      />
      <StructuredData
        data={createItemListStructuredData(
          PRODUCTS.map((product) => ({
            name: product.title,
            path: `/uslugi/${product.slug}/`,
          })),
        )}
      />
      <SiteHeader />

      <main className="page-main">
        <section className="page-hero page-hero-dark section">
          <div className="page-hero-backdrop">
            <Image
              src={assetPath("/assets/photos/hero-company-facade.png")}
              alt="Фасадный коммерческий объект"
              fill
              priority
              sizes="100vw"
            />
          </div>

          <div className="container page-hero-shell reveal" id="services-catalog-hero">
            <div className="page-hero-copy">
              <div className="page-breadcrumbs">
                <Link href="/">Главная</Link>
                <span>/</span>
                <span>Услуги</span>
              </div>

              <p className="section-kicker">Каталог направлений</p>
              <h1>Услуги и направления по светопрозрачным конструкциям</h1>
              <p className="hero-lead">
                Окна ПВХ, алюминиевые системы, фасады, витражи, панорамное остекление,
                перегородки и нестандартные конструкции. Выберите нужное направление и перейдите к
                деталям по задаче.
              </p>
              <p className="page-hero-text">
                Каталог помогает быстро соотнести объект с подходящей системой, посмотреть кейсы и
                перейти к расчёту без лишних шагов.
              </p>

              <div className="hero-actions">
                <a className="button button-primary" href="#request">
                  Получить расчёт
                </a>
                <Link className="button button-secondary" href="/proekty/">
                  Смотреть проекты
                </Link>
              </div>
            </div>

            <aside className="page-hero-rail reveal reveal-delay">
              <strong>Что вы найдёте в каталоге</strong>
              <ul className="page-highlight-list">
                <li>Быстрый вход в нужное направление</li>
                <li>Понимание, какая система подходит под задачу</li>
                <li>Переход из каталога в кейсы и расчёт</li>
              </ul>
            </aside>
          </div>
        </section>

        <ProductsSection />

        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Как выбирать"
              title="Как быстро выбрать нужное направление"
              description="Сначала определите тип объекта, затем требования к конструкции и только после этого переходите к расчёту."
            />

            <div className="intro-list">
              {SERVICE_SELECTION_STEPS.map((item, index) => (
                <article
                  className={`intro-card reveal ${index === 1 ? "reveal-delay" : index === 2 ? "reveal-delay-2" : ""}`}
                  key={item.title}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section project-links">
          <div className="container">
            <MetricsBand />

            <div className="service-crosslinks">
              <article className="partner-card reveal">
                <h3>О компании</h3>
                <p>Если нужно понять, за счёт чего компания реализует такие проекты, переходите в корпоративную страницу.</p>
                <Link href="/o-kompanii/">Открыть страницу компании</Link>
              </article>
              <article className="partner-card reveal reveal-delay">
                <h3>Проекты</h3>
                <p>После каталога услуг логично посмотреть реальные объекты, где эти решения уже реализованы.</p>
                <Link href="/proekty/">Перейти в кейсы</Link>
              </article>
              <article className="partner-card reveal reveal-delay-2">
                <h3>Партнёрам</h3>
                <p>Для дилеров, архитекторов и застройщиков нужен отдельный сценарий, а не общая форма для всех.</p>
                <Link href="/partneram/">Открыть B2B-страницу</Link>
              </article>
            </div>
          </div>
        </section>

        <ProcessSection />
        <RequestSection />
      </main>

      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="services-catalog-hero" requestId="request" href="#request" label="Получить расчёт" />
    </div>
  );
}
