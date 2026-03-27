import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StructuredData } from "@/components/seo/structured-data";
import {
  MetricsBand,
  ProcessSection,
  RequestSection,
  SectionHeading,
} from "@/components/sections/home-sections";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { COMPANY_PILLARS, CONTACTS, STANDARDS } from "@/lib/site-data";
import { createBreadcrumbStructuredData } from "@/lib/seo";

export function AboutPage() {
  return (
    <div className="page-shell">
      <StructuredData
        data={createBreadcrumbStructuredData([
          { name: "Главная", path: "/" },
          { name: "О компании", path: "/o-kompanii/" },
        ])}
      />
      <SiteHeader />

      <main className="page-main">
        <section className="page-hero section">
          <div className="container page-hero-shell reveal" id="about-hero">
            <div className="page-hero-copy">
              <div className="page-breadcrumbs">
                <Link href="/">Главная</Link>
                <span>/</span>
                <span>О компании</span>
              </div>

              <p className="eyebrow">О компании</p>
              <h1>СтеклоСтройГрупп как инженерная компания, а не просто продавец конструкций</h1>
              <p className="hero-lead">
                Собственное производство, конструкторское бюро, монтажные бригады и сервис после
                сдачи. Эта страница должна объяснять, за счёт чего компания реально выполняет
                сложные объекты.
              </p>
              <p className="page-hero-text">
                Здесь важна не формальная история, а структура доверия: опыт, производство,
                проектирование, монтаж и сопровождение по всей Беларуси.
              </p>

              <div className="hero-actions">
                <Link className="button button-primary" href="/proekty/">
                  Смотреть проекты
                </Link>
                <Link className="button button-secondary" href="/kontakty/">
                  Контакты и реквизиты
                </Link>
              </div>
            </div>

            <aside className="page-hero-panel reveal reveal-delay">
              <strong>Корпоративные опоры</strong>
              <ul className="page-highlight-list">
                <li>Производство и проектирование в одной связке</li>
                <li>Монтаж любой сложности по всей Беларуси</li>
                <li>Гарантия и сервис после сдачи объекта</li>
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
              eyebrow="Что стоит за компанией"
              title="Базовые опоры, которые сайт должен объяснять без штампов"
              description="Эти блоки формируют доверие лучше, чем общие слова про качество и клиентоориентированность."
            />

            <div className="service-crosslinks">
              {COMPANY_PILLARS.map((item, index) => (
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

        <section className="section service-summary">
          <div className="container summary-shell reveal">
            <div className="summary-copy">
              <p className="eyebrow">Почему это важно</p>
              <h2>Компания должна читаться как понятный подрядчик полного цикла</h2>
              <p>
                Когда клиент смотрит корпоративную страницу, он должен понимать не только список
                услуг, но и то, как внутри устроено исполнение: кто проектирует, кто производит,
                кто монтирует и кто остаётся на связи после сдачи.
              </p>
            </div>

            <div className="summary-grid">
              {STANDARDS.slice(0, 3).map((item) => (
                <article key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ProcessSection />

        <section className="section contacts-layout">
          <div className="container contacts-grid">
            <div className="contact-card-grid">
              <article className="contact-card reveal">
                <h3>География работы</h3>
                <div>
                  <p>{CONTACTS.serviceArea}</p>
                  <p>{CONTACTS.responseTime}</p>
                </div>
              </article>

              <article className="contact-card reveal reveal-delay">
                <h3>Почтовый адрес</h3>
                <div>
                  <p>{CONTACTS.postalAddress}</p>
                </div>
              </article>

              <article className="contact-card reveal">
                <h3>Юридический адрес</h3>
                <div>
                  <p>{CONTACTS.legalAddress}</p>
                </div>
              </article>

              <article className="contact-card reveal reveal-delay">
                <h3>Реквизиты</h3>
                <div>
                  <p>{CONTACTS.bankDetails}</p>
                </div>
              </article>
            </div>

            <div className="contact-map-shell reveal">
              <div className="contact-map-footer">
                <strong>Следующий шаг после корпоративной страницы</strong>
                <p>Отсюда пользователь должен переходить либо в кейсы, либо в профильную услугу, либо сразу в контакт.</p>
                <div className="contact-actions">
                  <Link className="button button-secondary" href="/proekty/">
                    Смотреть проекты
                  </Link>
                  <Link className="button button-secondary" href="/uslugi/">
                    Перейти в услуги
                  </Link>
                  <Link className="button button-secondary" href="/kontakty/">
                    Открыть контакты
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <RequestSection
          eyebrow="Обсудить проект"
          title="Если вы уже понимаете масштаб задачи, перейдём к расчёту"
          description="После страницы компании пользователь обычно готов к следующему шагу: показать объект, получить консультацию или запросить расчёт."
        />
      </main>

      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="about-hero" requestId="request" href="#request" label="Обсудить проект" />
    </div>
  );
}
