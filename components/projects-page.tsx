import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StructuredData } from "@/components/seo/structured-data";
import { MonolithCta, MonolithSectionHeading } from "@/components/ui/monolith-content";
import { MonolithPageHero } from "@/components/ui/monolith-page-hero";
import { MobileCta } from "@/components/ui/mobile-cta";
import { ProjectGallery } from "@/components/ui/project-gallery";
import { ProjectReveal } from "@/components/ui/project-reveal";
import { RevealInit } from "@/components/ui/reveal-init";
import { PROJECTS } from "@/lib/site-data";
import { createBreadcrumbStructuredData, createItemListStructuredData } from "@/lib/seo";

export function ProjectsPage() {
  return (
    <div className="page-shell">
      <StructuredData data={createBreadcrumbStructuredData([{ name: "Главная", path: "/" }, { name: "Проекты", path: "/proekty/" }])} />
      <StructuredData data={createItemListStructuredData(PROJECTS.map((project) => ({ name: project.title, path: `/proekty/${project.slug}/` })))} />
      <SiteHeader />
      <main className="page-main monolith-inner-page">
        <MonolithPageHero id="projects-hero" breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Проекты" }]} title="Реализованные объекты" lead="Фасады, витражи и светопрозрачные конструкции, где архитектурная идея стала точным инженерным результатом." image="/assets/photos/facade-evening.jpg" imageAlt="Реализованный фасадный объект" rail={["Объекты", "Масштаб", "Решения", "Подход", "Расчёт"]} />
        <section className="monolith-content-section" id="section-1">
          <div className="container">
            <MonolithSectionHeading label="ПОРТФОЛИО" title="Архитектура в реальной эксплуатации" text="Показываем не абстрактные обещания, а объекты с понятным типом работ, местом и инженерной задачей." />
            <ProjectReveal />
            <ProjectGallery />
          </div>
        </section>
        <MonolithCta title="Есть похожий объект?" text="Пришлите фото, план или техническое задание. Подберём релевантное решение и покажем близкие по задаче проекты." />
      </main>
      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="projects-hero" requestId="request" href="/raschet/" label="Обсудить объект" />
    </div>
  );
}
