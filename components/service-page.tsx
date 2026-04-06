import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { StructuredData } from "@/components/seo/structured-data";
import { SiteHeader } from "@/components/layout/site-header";
import {
  FaqSection,
  ProcessSection,
  ProjectsGrid,
  RequestSection,
} from "@/components/sections/home-sections";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { getProjectsByIds, PROCESS_STEPS, ServicePageData } from "@/lib/site-data";
import {
  createBreadcrumbStructuredData,
  createFaqStructuredData,
  createServiceStructuredData,
} from "@/lib/seo";
import { assetPath } from "@/lib/site-utils";

type ServicePageProps = {
  service: ServicePageData;
};

export function ServicePage({ service }: ServicePageProps) {
  const relatedProjects = getProjectsByIds(service.relatedProjectIds);
  const servicePath = `/uslugi/${service.slug}/`;
  const heroImage = relatedProjects[0]?.image ?? "/assets/photos/hero-company-facade.png";

  return (
    <div className="page-shell">
      <StructuredData
        data={createBreadcrumbStructuredData([
          { name: "Главная", path: "/" },
          { name: "Услуги", path: "/uslugi/" },
          { name: service.title, path: servicePath },
        ])}
      />
      <StructuredData
        data={createServiceStructuredData({
          name: service.title,
          description: service.lead,
          path: servicePath,
        })}
      />
      <StructuredData data={createFaqStructuredData(service.faq)} />
      <SiteHeader />

      <main className="page-main">
        <section className="page-hero page-hero-dark section">
          <div className="page-hero-backdrop">
            <Image src={assetPath(heroImage)} alt={service.title} fill priority sizes="100vw" />
          </div>

          <div className="container page-hero-shell reveal" id="service-hero">
            <div className="page-hero-copy">
              <div className="page-breadcrumbs">
                <Link href="/">Главная</Link>
                <span>/</span>
                <Link href="/uslugi/">Услуги</Link>
                <span>/</span>
                <span>{service.menuLabel}</span>
              </div>

              <p className="section-kicker">{service.heroEyebrow}</p>
              <h1>{service.title}</h1>
              <p className="hero-lead">{service.lead}</p>
              <p className="page-hero-text">{service.description}</p>

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
              <strong>Ключевые преимущества</strong>
              <ul className="page-highlight-list">
                {service.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="section page-content-band">
          <div className="container">
            <div className="content-split reveal">
              <div className="content-split-copy">
                <p className="section-kicker">Инженерная логика</p>
                <h2>Почему это направление выбирают для сложных и типовых объектов</h2>
                <p>
                  Здесь важен не просто внешний вид конструкции. Решение должно одновременно
                  работать по геометрии, эксплуатационному сценарию, монтажному узлу и визуальной
                  подаче объекта.
                </p>
              </div>

              <div className="content-split-panel">
                <strong>Что берём в рабочий контур</strong>
                <ul className="page-highlight-list">
                  {service.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="intro-list">
              {service.benefits.map((item, index) => (
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

        <section className="section service-applications">
          <div className="container service-application-shell">
            <div className="section-heading reveal">
              <p className="section-kicker">Применение</p>
              <h2>Где и как это направление работает на объекте</h2>
              <p>
                Сценарии ниже нужны не ради заполнения страницы, а чтобы заказчик быстро соотнёс
                свою задачу с типовым контуром применения.
              </p>
            </div>

            <div className="service-application-list">
              {service.applications.map((item, index) => (
                <article
                  className={`service-application-item reveal ${index === 1 ? "reveal-delay" : index === 3 ? "reveal-delay-2" : ""}`}
                  key={item}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item}</h3>
                  <p>
                    Подбираем систему, стеклопакет, профиль и монтажный узел под конкретный режим
                    использования объекта.
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section projects projects-on-light">
          <div className="container">
            <div className="objects-header reveal">
              <div>
                <p className="section-kicker">Связанные проекты</p>
                <h2>Объекты, по которым видно, как направление работает в реальной эксплуатации</h2>
              </div>
            </div>

            <ProjectsGrid projects={relatedProjects} />
          </div>
        </section>

        <ProcessSection />

        <section className="section editorial-band">
          <div className="container editorial-shell reveal">
            <div className="editorial-copy">
              <p className="section-kicker">Почему это работает</p>
              <h2>Что входит в работу помимо самой конструкции</h2>
              <p>
                Услуга работает только тогда, когда решение связано с расчётом, производством,
                монтажом и сервисом. Поэтому на объекте важна не только система, но и весь контур
                исполнения.
              </p>
            </div>

            <div className="editorial-grid">
              {PROCESS_STEPS.slice(0, 3).map((step) => (
                <article key={step.step}>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <FaqSection items={service.faq} />
        <RequestSection
          eyebrow="Запрос по услуге"
          title={`Запросить консультацию по направлению «${service.title}»`}
          description="Оставьте базовые данные по объекту, а все технические детали мы доберём уже на следующем касании."
          defaultProduct={service.menuLabel}
        />
      </main>

      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="service-hero" requestId="request" href="#request" label="Получить расчёт" />
    </div>
  );
}
