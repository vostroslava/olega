import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { StructuredData } from "@/components/seo/structured-data";
import { SiteHeader } from "@/components/layout/site-header";
import {
  FaqSection,
  ProcessSection,
  ProjectsGrid,
  RequestSection,
  SectionHeading,
} from "@/components/sections/home-sections";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import {
  getProjectsByIds,
  PROCESS_STEPS,
  ServicePageData,
} from "@/lib/site-data";
import {
  createBreadcrumbStructuredData,
  createFaqStructuredData,
  createServiceStructuredData,
} from "@/lib/seo";

type ServicePageProps = {
  service: ServicePageData;
};

export function ServicePage({ service }: ServicePageProps) {
  const relatedProjects = getProjectsByIds(service.relatedProjectIds);
  const servicePath = `/uslugi/${service.slug}/`;

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
        <section className="page-hero section">
          <div className="container page-hero-shell reveal" id="service-hero">
            <div className="page-hero-copy">
              <div className="page-breadcrumbs">
                <Link href="/">Главная</Link>
                <span>/</span>
                <span>{service.menuLabel}</span>
              </div>

              <p className="eyebrow">{service.heroEyebrow}</p>
              <h1>{service.title}</h1>
              <p className="hero-lead">{service.lead}</p>
              <p className="page-hero-text">{service.description}</p>

              <div className="hero-actions">
                <a className="button button-primary" href="#request">
                  Получить расчёт
                </a>
                <Link className="button button-secondary" href="/#projects">
                  Смотреть проекты
                </Link>
              </div>
            </div>

            <aside className="page-hero-panel reveal reveal-delay">
              <strong>Ключевые преимущества</strong>
              <ul className="page-highlight-list">
                {service.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-heading reveal">
              <p className="eyebrow">Преимущества</p>
              <h2>Почему это направление выбирают для сложных и типовых объектов</h2>
              <p>
                Здесь собраны ключевые преимущества направления: где оно работает лучше всего, за
                счёт чего выигрывает и что получает заказчик на объекте.
              </p>
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

        <section className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Что входит в работу"
              title="Что берём на себя по этому направлению"
              description="Формируем решение под ключ: от инженерной подготовки и расчёта до монтажа и сопровождения после сдачи."
            />

            <div className="service-crosslinks">
              {service.deliverables.map((item, index) => (
                <article
                  className={`partner-card reveal ${index === 1 ? "reveal-delay" : index === 2 ? "reveal-delay-2" : ""}`}
                  key={item}
                >
                  <h3>{String(index + 1).padStart(2, "0")}</h3>
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section service-applications">
          <div className="container service-application-shell">
            <div className="section-heading reveal">
              <p className="eyebrow">Где применимо</p>
              <h2>Типовые сценарии и объекты</h2>
            </div>

            <div className="service-application-grid">
              {service.applications.map((item, index) => (
                <article
                  className={`partner-card reveal ${index === 1 ? "reveal-delay" : index === 2 ? "reveal-delay-2" : ""}`}
                  key={item}
                >
                  <h3>{item}</h3>
                  <p>
                    Подбираем конструкцию и монтажный узел под особенности объекта, график работ и
                    ожидаемый результат.
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section projects">
          <div className="container">
            <div className="section-heading reveal">
              <p className="eyebrow">Связанные кейсы</p>
              <h2>Реальные объекты по этому направлению</h2>
            </div>

            <ProjectsGrid projects={relatedProjects} />
          </div>
        </section>

        <ProcessSection />

        <section className="section service-summary">
          <div className="container summary-shell reveal">
            <div className="summary-copy">
              <p className="eyebrow">Почему это работает</p>
              <h2>Что входит в работу помимо самой конструкции</h2>
              <p>
                Берём на себя не только подбор системы, но и проектирование, производство, монтаж и
                сопровождение после сдачи объекта.
              </p>
            </div>

            <div className="summary-grid">
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
          title={`Получить расчёт по направлению «${service.title}»`}
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
