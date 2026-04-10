import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StructuredData } from "@/components/seo/structured-data";
import { ProjectsGrid, RequestSection } from "@/components/sections/home-sections";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { PROJECTS, Project } from "@/lib/site-data";
import { createBreadcrumbStructuredData, createItemListStructuredData } from "@/lib/seo";
import { assetPath } from "@/lib/site-utils";

type ProjectPageProps = {
  project: Project;
};

export function ProjectPage({ project }: ProjectPageProps) {
  const relatedProjects = PROJECTS.filter((item) => item.id !== project.id).slice(0, 2);
  const projectPath = `/proekty/${project.slug}/`;
  const keyFacts = [project.location, project.timeline, project.area].filter(Boolean) as string[];
  const currentIndex = PROJECTS.findIndex((item) => item.id === project.id);
  const previousProject = currentIndex > 0 ? PROJECTS[currentIndex - 1] : null;
  const nextProject =
    currentIndex >= 0 && currentIndex < PROJECTS.length - 1 ? PROJECTS[currentIndex + 1] : null;
  const factCards = [
    { label: "Локация", value: project.location },
    { label: "Период", value: project.timeline ?? "Поэтапная реализация" },
    { label: "Масштаб", value: project.area },
    { label: "Направление", value: project.relatedServiceLabel },
  ];

  return (
    <div className="page-shell">
      <StructuredData
        data={createBreadcrumbStructuredData([
          { name: "Главная", path: "/" },
          { name: "Проекты", path: "/proekty/" },
          { name: project.title, path: projectPath },
        ])}
      />
      <StructuredData
        data={createItemListStructuredData([
          { name: `${project.title} — объект`, path: projectPath },
          { name: project.relatedServiceLabel, path: `/uslugi/${project.relatedServiceSlug}/` },
        ])}
      />
      <SiteHeader />

      <main className="page-main">
        <section className="page-hero page-hero-dark section">
          <div className="page-hero-backdrop">
            <Image src={assetPath(project.image)} alt={project.alt} fill priority sizes="100vw" />
          </div>

          <div className="container page-hero-shell reveal" id="project-hero">
            <div className="page-hero-copy">
              <div className="page-breadcrumbs">
                <Link href="/">Главная</Link>
                <span>/</span>
                <Link href="/proekty/">Проекты</Link>
                <span>/</span>
                <span>{project.title}</span>
              </div>

              <p className="section-kicker">{project.tag}</p>
              <h1>{project.title}</h1>
              <p className="hero-lead">{project.text}</p>
              <p className="page-hero-text">
                Объект целиком: фасадный контур, стеклянная архитектура, состав работ и итоговая
                логика решения для заказчика.
              </p>

              <div className="hero-actions">
                <a className="button button-primary" href="#request">
                  Обсудить похожий проект
                </a>
                <Link className="button button-secondary" href={`/uslugi/${project.relatedServiceSlug}/`}>
                  Перейти в услугу
                </Link>
              </div>
            </div>

            <aside className="page-hero-rail reveal reveal-delay">
              <strong>Ключевые параметры</strong>
              <ul className="page-highlight-list">
                {keyFacts.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="section project-overview-band">
          <div className="container">
            <div className="project-detail-grid">
              <div className="project-detail-image reveal">
                <Image
                  src={assetPath(project.image)}
                  alt={project.alt}
                  fill
                  sizes="(max-width: 1180px) 100vw, 52vw"
                />
              </div>

              <div className="content-split-panel reveal reveal-delay">
                <strong>Что входило в проект</strong>
                <ul className="page-highlight-list">
                  {project.scope.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="project-facts-grid">
              {factCards.map((item, index) => (
                <article
                  className={`project-fact-card reveal ${index === 1 ? "reveal-delay" : index === 2 ? "reveal-delay-2" : ""}`}
                  key={item.label}
                >
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section editorial-band">
          <div className="container editorial-shell reveal">
            <div className="editorial-copy">
              <p className="section-kicker">Контекст проекта</p>
              <h2>Задача, решение и итог должны читаться как единый инженерный сценарий</h2>
              <p>{project.challenge}</p>
            </div>

            <div className="editorial-grid">
              <article>
                <strong>Решение</strong>
                <p>{project.solution}</p>
              </article>
              <article>
                <strong>Результат</strong>
                <p>{project.result}</p>
              </article>
              <article>
                <strong>Связанная услуга</strong>
                <p>
                  Этот объект можно использовать как быстрый вход в профильное направление, если
                  нужна похожая задача по масштабу и типу системы.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section project-proof-band">
          <div className="container">
            <div className="project-proof-shell reveal">
              <div className="project-proof-copy">
                <p className="section-kicker">Почему этот кейс усиливает доверие</p>
                <h2>У объекта должен быть не только красивый фасад, но и понятный доказательный вес</h2>
                <p>
                  Ниже — не повтор описания объекта, а три сигнала, которые помогают следующему
                  заказчику быстро понять, почему этот кейс релевантен по масштабу, дисциплине и
                  типу решения.
                </p>

                <div className="hero-actions">
                  <Link className="button button-primary" href={`/uslugi/${project.relatedServiceSlug}/`}>
                    Перейти в услугу
                  </Link>
                  <a className="button button-secondary" href="#request">
                    Обсудить похожий проект
                  </a>
                </div>
              </div>

              <div className="project-proof-stack">
                {project.proofPoints.map((item, index) => (
                  <article
                    className={index === 1 ? "reveal-delay" : index === 2 ? "reveal-delay-2" : ""}
                    key={item.title}
                  >
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section project-links">
          <div className="container">
            <div className="project-navigation reveal">
              <Link href="/proekty/">Назад ко всем кейсам</Link>
              <div className="project-navigation-links">
                {previousProject ? (
                  <Link href={`/proekty/${previousProject.slug}/`}>
                    Предыдущий: {previousProject.title}
                  </Link>
                ) : null}
                {nextProject ? (
                  <Link href={`/proekty/${nextProject.slug}/`}>
                    Следующий: {nextProject.title}
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="service-crosslinks">
              <article className="partner-card reveal">
                <h3>Связанная услуга</h3>
                <p>
                  Если вас интересует похожая задача, следующий шаг — открыть профильную страницу
                  услуги и посмотреть систему целиком.
                </p>
                <Link href={`/uslugi/${project.relatedServiceSlug}/`}>
                  {project.relatedServiceLabel}
                </Link>
              </article>
              <article className="partner-card reveal reveal-delay">
                <h3>Все проекты</h3>
                <p>Посмотрите остальные объекты, чтобы сравнить масштаб, тип задач и подачу кейсов.</p>
                <Link href="/proekty/">Открыть список кейсов</Link>
              </article>
              <article className="partner-card reveal reveal-delay-2">
                <h3>Быстрый вход в заявку</h3>
                <p>Если объект похож по масштабу и задаче, следующий шаг лучше сделать сразу через заявку ниже.</p>
                <a href="#request">Перейти к заявке</a>
              </article>
            </div>
          </div>
        </section>

        {relatedProjects.length ? (
          <section className="section projects projects-on-light">
            <div className="container">
              <div className="objects-header reveal">
                <div>
                  <p className="section-kicker">Другие кейсы</p>
                  <h2>Ещё проекты, которые логично открыть после этого объекта</h2>
                </div>
              </div>
              <ProjectsGrid projects={relatedProjects} />
            </div>
          </section>
        ) : null}

        <RequestSection
          eyebrow="Обсудить похожую задачу"
          title={`Нужен проект уровня «${project.title}»?`}
          description="Оставьте базовые вводные, и мы предложим формат решения, релевантный по масштабу и типу объекта."
          defaultProduct={project.relatedServiceLabel}
        />
      </main>

      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="project-hero" requestId="request" href="#request" label="Обсудить проект" />
    </div>
  );
}
