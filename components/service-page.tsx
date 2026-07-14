import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StructuredData } from "@/components/seo/structured-data";
import {
  MonolithCta,
  MonolithFact,
  MonolithFactRail,
  MonolithImagePair,
  MonolithSectionHeading,
} from "@/components/ui/monolith-content";
import { MonolithPageHero } from "@/components/ui/monolith-page-hero";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { getProjectsByIds, PROCESS_STEPS, type ServicePageData } from "@/lib/site-data";
import { assetPath } from "@/lib/site-utils";
import {
  createBreadcrumbStructuredData,
  createFaqStructuredData,
  createServiceStructuredData,
} from "@/lib/seo";

export function ServicePage({ service }: { service: ServicePageData }) {
  const relatedProjects = getProjectsByIds(service.relatedProjectIds);
  const heroImage = relatedProjects[0]?.image ?? "/assets/photos/product-facade-closeup.jpg";
  const secondaryImage = relatedProjects[1]?.image ?? "/assets/photos/interior-gallery.png";
  const servicePath = `/uslugi/${service.slug}/`;

  return (
    <div className="page-shell">
      <StructuredData data={createBreadcrumbStructuredData([
        { name: "Главная", path: "/" },
        { name: "Продукция", path: "/produktsiya/" },
        { name: service.title, path: servicePath },
      ])} />
      <StructuredData data={createServiceStructuredData({ name: service.title, description: service.lead, path: servicePath })} />
      <StructuredData data={createFaqStructuredData(service.faq)} />
      <SiteHeader />

      <main className="page-main monolith-inner-page">
        <MonolithPageHero
          id="service-hero"
          breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Продукция", href: "/produktsiya/" }, { label: service.menuLabel }]}
          title={service.title}
          lead={service.lead}
          image={heroImage}
          imageAlt={service.title}
        />

        <section className="monolith-content-section" id="section-1">
          <div className="container monolith-editorial-grid">
            <MonolithSectionHeading title={service.description} text="Инженерная проработка связывает архитектуру, энергоэффективность, безопасность и монтажный узел в одной системе." />
            <MonolithImagePair primary={heroImage} primaryAlt={service.title} secondary={secondaryImage} secondaryAlt={`Деталь решения: ${service.title}`} />
          </div>
          <div className="container">
            <MonolithFactRail>
              {service.benefits.slice(0, 3).map((item, index) => (
                <MonolithFact key={item.title} index={String(index + 1).padStart(2, "0")} title={item.title} text={item.text} />
              ))}
            </MonolithFactRail>
          </div>
        </section>

        <section className="monolith-content-section monolith-content-section-alt" id="section-2">
          <div className="container">
            <MonolithSectionHeading label="СИСТЕМЫ И КОМПЛЕКТАЦИЯ" title="Что входит в рабочий контур" text="Состав решения уточняется после замера и технического задания. Здесь — честная структура без фиктивной цены до обследования объекта." />
            <div className="monolith-spec-grid">
              {service.deliverables.map((item, index) => (
                <article className="reveal" key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item}</h3>
                  <p>{service.highlights[index % service.highlights.length]}</p>
                </article>
              ))}
              <Link className="monolith-spec-action" href="/raschet/">
                <span>Получить консультацию</span>
                <ArrowUpRight size={28} weight="thin" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="monolith-content-section" id="section-3">
          <div className="container">
            <MonolithSectionHeading label="ПРОЦЕСС" title="От замера до точного монтажа" />
            <div className="monolith-process-line">
              {PROCESS_STEPS.slice(0, 4).map((step) => (
                <article className="reveal" key={step.step}>
                  <span>{step.step}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="monolith-content-section monolith-content-section-alt" id="section-4">
          <div className="container">
            <MonolithSectionHeading label="ОБЪЕКТЫ" title="Решение в реализованных проектах" />
            <div className="monolith-project-row">
              {relatedProjects.map((project, index) => (
                <Link className="monolith-project-link reveal" href={`/proekty/${project.slug}/`} key={project.id}>
                  <Image src={assetPath(project.image)} alt={project.alt} fill sizes="(max-width: 860px) 100vw, 50vw" />
                  <span className="monolith-project-overlay" />
                  <span className="monolith-project-meta">{String(index + 1).padStart(2, "0")} · {project.location}</span>
                  <strong>{project.title}</strong>
                  <ArrowUpRight size={28} weight="thin" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="monolith-content-section" id="section-5">
          <div className="container monolith-faq-layout">
            <MonolithSectionHeading label="ВОПРОСЫ" title="Что важно уточнить до расчёта" />
            <div className="monolith-faq-list">
              {service.faq.map((item, index) => (
                <details className="reveal" key={item.question} open={index === 0}>
                  <summary><span>{String(index + 1).padStart(2, "0")}</span>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <MonolithCta title={`Рассчитать направление «${service.title}»`} text="Приложите фото или чертёж. Инженер изучит материалы и уточнит только недостающие данные." />
      </main>

      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="service-hero" requestId="request" href="/raschet/" label="Рассчитать проект" />
    </div>
  );
}
