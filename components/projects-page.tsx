"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StructuredData } from "@/components/seo/structured-data";
import {
  MetricsBand,
  ProjectsGrid,
  RequestSection,
  SectionHeading,
} from "@/components/sections/home-sections";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { PROJECTS } from "@/lib/site-data";
import { createBreadcrumbStructuredData, createItemListStructuredData } from "@/lib/seo";
import { assetPath } from "@/lib/site-utils";

const projectFilters = [
  { key: "all", label: "Все проекты" },
  { key: "retail", label: "Торговые" },
  { key: "medical", label: "Медицинские" },
  { key: "commercial", label: "Коммерческие" },
] as const;

export function ProjectsPage() {
  const [filter, setFilter] = useState<(typeof projectFilters)[number]["key"]>("all");

  const filteredProjects = useMemo(() => {
    if (filter === "all") return PROJECTS;
    return PROJECTS.filter((project) => project.category === filter);
  }, [filter]);

  return (
    <div className="page-shell">
      <StructuredData
        data={createBreadcrumbStructuredData([
          { name: "Главная", path: "/" },
          { name: "Проекты", path: "/proekty/" },
        ])}
      />
      <StructuredData
        data={createItemListStructuredData(
          PROJECTS.map((project) => ({
            name: project.title,
            path: `/proekty/${project.slug}/`,
          })),
        )}
      />
      <SiteHeader />

      <main className="page-main">
        <section className="page-hero page-hero-dark section">
          <div className="page-hero-backdrop">
            <Image
              src={assetPath("/assets/photos/facade-evening.jpg")}
              alt="Коммерческий фасадный объект"
              fill
              priority
              sizes="100vw"
            />
          </div>

          <div className="container page-hero-shell reveal" id="projects-hero">
            <div className="page-hero-copy">
              <div className="page-breadcrumbs">
                <Link href="/">Главная</Link>
                <span>/</span>
                <span>Проекты</span>
              </div>

              <p className="section-kicker">Реализованные объекты</p>
              <h1>Реализованные объекты СтеклоСтройГрупп</h1>
              <p className="hero-lead">
                От торговых и медицинских комплексов до объектов со сложной внутренней
                стеклянной архитектурой. Показываем кейсы, по которым видно масштаб, состав работ и
                уровень исполнения.
              </p>
              <p className="page-hero-text">
                Это реальные объекты, где можно оценить фасадный контур, внутренние решения и
                опыт компании в работе с коммерческими и общественными проектами.
              </p>

              <div className="hero-actions">
                <a className="button button-primary" href="#request">
                  Обсудить проект
                </a>
                <Link className="button button-secondary" href="/kontakty/">
                  Связаться с нами
                </Link>
              </div>
            </div>

            <aside className="page-hero-rail reveal reveal-delay">
              <strong>Что дают кейсы</strong>
              <ul className="page-highlight-list">
                <li>Понимание масштаба и состава работ</li>
                <li>Связь объекта с конкретной услугой</li>
                <li>Быстрый переход к расчёту похожей задачи</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="section projects-overview">
          <div className="container">
            <SectionHeading
              eyebrow="Подборка кейсов"
              title="Отфильтруйте тип объекта и посмотрите релевантные решения"
              description="Так проще сравнить похожие объекты и понять, какой опыт компании ближе всего к вашей задаче."
            />

            <div className="project-filter-bar reveal">
              {projectFilters.map((item) => (
                <button
                  key={item.key}
                  className={`filter-chip ${filter === item.key ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setFilter(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <ProjectsGrid projects={filteredProjects} />
          </div>
        </section>

        <section className="section project-links">
          <div className="container">
            <MetricsBand />

            <div className="service-crosslinks">
              <article className="partner-card reveal">
                <h3>Фасады и витражи</h3>
                <p>Если вы смотрите коммерческие кейсы, следующий логичный шаг — перейти в услугу.</p>
                <Link href="/uslugi/fasady-i-vitrazhi/">Открыть страницу услуги</Link>
              </article>
              <article className="partner-card reveal reveal-delay">
                <h3>Алюминиевые системы</h3>
                <p>Подходит для сложной геометрии, входных групп и объектов с высокой нагрузкой.</p>
                <Link href="/uslugi/alyuminievye-sistemy/">Посмотреть решение</Link>
              </article>
              <article className="partner-card reveal reveal-delay-2">
                <h3>Перегородки и входные группы</h3>
                <p>Если важна внутренняя стеклянная архитектура и логика потоков, переходите сюда.</p>
                <Link href="/uslugi/peregorodki-i-vkhodnye-gruppy/">Смотреть направление</Link>
              </article>
            </div>
          </div>
        </section>

        <RequestSection
          eyebrow="Хотите такой же объект?"
          title="Отправьте задачу, и мы предложим формат решения под ваш объект"
          description="Для коммерческих и частных проектов нам достаточно базовой вводной, чтобы быстро вернуться с понятным следующим шагом."
          defaultProduct="Партнёрский запрос"
        />
      </main>

      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="projects-hero" requestId="request" href="#request" label="Обсудить проект" />
    </div>
  );
}
