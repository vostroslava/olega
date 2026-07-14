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
import type { Project } from "@/lib/site-data";
import { assetPath } from "@/lib/site-utils";
import { createBreadcrumbStructuredData } from "@/lib/seo";

export function ProjectPage({ project }: { project: Project }) {
  return (
    <div className="page-shell">
      <StructuredData data={createBreadcrumbStructuredData([{ name: "Главная", path: "/" }, { name: "Проекты", path: "/proekty/" }, { name: project.title, path: `/proekty/${project.slug}/` }])} />
      <SiteHeader />
      <main className="page-main monolith-inner-page">
        <MonolithPageHero id="project-hero" breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Проекты", href: "/proekty/" }, { label: project.title }]} title={project.title} lead={project.text} image={project.image} imageAlt={project.alt} rail={["Объект", "Задача", "Решение", "Результат", "Расчёт"]} secondaryLabel="Все проекты" secondaryHref="/proekty/" />

        <section className="monolith-content-section" id="section-1">
          <div className="container">
            <MonolithSectionHeading label="ОБЪЕКТ" title={`${project.location} · ${project.note}`} />
            <MonolithFactRail>
              <MonolithFact index="01" title="Масштаб" text={project.area} />
              <MonolithFact index="02" title="Срок" text={project.timeline ?? "По графику объекта"} />
              <MonolithFact index="03" title="Направление" text={project.relatedServiceLabel} />
            </MonolithFactRail>
          </div>
        </section>

        <section className="project-story-section" id="section-2">
          <div className="container project-story-grid">
            <div className="project-story-copy reveal"><p className="optical-label">ЗАДАЧА</p><h2>{project.challenge}</h2><ul>{project.scope.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div className="project-story-image reveal"><Image src={assetPath(project.image)} alt={project.alt} fill sizes="(max-width: 860px) 100vw, 55vw" /></div>
          </div>
        </section>

        <section className="monolith-content-section monolith-content-section-alt" id="section-3">
          <div className="container project-solution-grid">
            <div><p className="optical-label">РЕШЕНИЕ</p><h2>{project.solution}</h2></div>
            <div className="project-highlight-list">{project.highlights.map((item, index) => <article className="reveal" key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></article>)}</div>
          </div>
        </section>

        <section className="monolith-content-section" id="section-4">
          <div className="container">
            <MonolithSectionHeading label="РЕЗУЛЬТАТ" title={project.result} />
            <div className="monolith-fact-rail">{project.proofPoints.map((item, index) => <MonolithFact key={item.title} index={String(index + 1).padStart(2, "0")} title={item.title} text={item.text} />)}</div>
            <Link className="project-related-link" href={`/uslugi/${project.relatedServiceSlug}/`}><span>Связанное решение</span><strong>{project.relatedServiceLabel}</strong><ArrowUpRight size={28} weight="thin" /></Link>
          </div>
        </section>
        <MonolithCta title="Рассчитать похожий проект" text="Покажите объект и желаемый результат — инженер предложит технический контур и следующий шаг." />
      </main>
      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="project-hero" requestId="request" href="/raschet/" label="Рассчитать проект" />
    </div>
  );
}
