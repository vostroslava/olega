import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { StructuredData } from "@/components/seo/structured-data";
import { SiteHeader } from "@/components/layout/site-header";
import { FaqSection, ProcessSection, RequestSection } from "@/components/sections/home-sections";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import {
  getProjectsByIds,
  PROCESS_STEPS,
  ServicePageData,
} from "@/lib/site-data";
import {
  createBreadcrumbStructuredData,
  createServiceStructuredData,
} from "@/lib/seo";
import { assetPath } from "@/lib/site-utils";

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
              <strong>Что важно на этой странице</strong>
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
              <h2>Что клиент должен понять за первый экран и ближайшие блоки</h2>
              <p>
                На странице услуги важна конкретика: где решение применимо, за счёт чего оно
                выигрывает и почему проект стоит доверить одному подрядчику.
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
              <h2>Примеры объектов, которые помогают считывать компетенцию</h2>
            </div>

            <div className="project-grid">
              {relatedProjects.map((project) => (
                <article className="project-card reveal" key={project.id}>
                  <div className="project-image">
                    <Image
                      src={assetPath(project.image)}
                      alt={project.alt}
                      fill
                      sizes="(max-width: 1180px) 100vw, 33vw"
                    />
                  </div>
                  <div className="project-body">
                    <p className="card-tag">{project.tag}</p>
                    <h3>{project.title}</h3>
                    <p>{project.text}</p>
                    <strong>{project.note}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ProcessSection />

        <section className="section service-summary">
          <div className="container summary-shell reveal">
            <div className="summary-copy">
              <p className="eyebrow">Почему это работает</p>
              <h2>Решение не заканчивается на продаже конструкции</h2>
              <p>
                Для сильной страницы услуги важно показать связку: проектирование, производство,
                монтаж и постпроектное сопровождение.
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
