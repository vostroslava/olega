import Image from "next/image";
import Link from "next/link";
import {
  CERTIFICATION_DOCUMENTS,
  CONTACTS,
  HERO_CLIENT_MARKS,
  HERO_PROOF,
  HOME_FAQ,
  OPERATIONS_GALLERY,
  PARTNER_BENEFITS,
  PROCESS_STEPS,
  PRODUCTS,
  PROJECTS,
  STANDARDS,
  TRUST_DOCUMENTS,
  TRUST_METRICS,
  TRUST_OBJECT_MARKS,
  TRUST_REASONS,
} from "@/lib/site-data";
import { assetPath } from "@/lib/site-utils";
import { RequestForm } from "@/components/ui/request-form";

type FaqItem = {
  question: string;
  answer: string;
};

type RequestSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  defaultProduct?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading reveal">
      <p className="section-kicker">{eyebrow}</p>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export function MetricsBand() {
  return (
    <div className="metrics-band reveal">
      {TRUST_METRICS.map(([value, label]) => (
        <article key={value} className="metric-card">
          <strong>{value}</strong>
          <span>{label}</span>
        </article>
      ))}
    </div>
  );
}

export function ProjectsGrid({
  projects = PROJECTS,
}: {
  projects?: typeof PROJECTS;
}) {
  return (
    <div className="project-grid">
      {projects.map((item, index) => (
        <article className="project-card reveal" key={item.id}>
          <div className="project-card-media">
            <span className="project-card-index">{String(index + 1).padStart(2, "0")}</span>
            <Image
              src={assetPath(item.image)}
              alt={item.alt}
              fill
              sizes="(max-width: 1180px) 100vw, 34vw"
            />
          </div>
          <div className="project-card-body">
            <p className="card-tag">{item.tag}</p>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <strong>{item.note}</strong>
            <div className="project-link-stack">
              <Link href={`/proekty/${item.slug}/`}>Подробнее о проекте</Link>
              <Link href={`/uslugi/${item.relatedServiceSlug}/`}>
                Похожая услуга: {item.relatedServiceLabel}
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="hero section">
      <div className="container">
        <div className="hero-shell reveal" id="hero-shell">
          <div className="hero-backdrop">
            <Image
              src={assetPath("/assets/photos/hero-company-facade.png")}
              alt="Современный коммерческий объект с фасадным остеклением"
              fill
              priority
              sizes="100vw"
            />
          </div>

          <div className="hero-stage">
            <div className="hero-copy">
              <p className="section-kicker">Инженерный монолит</p>
              <h1>
                СтеклоСтройГрупп: <span>архитектурная мощь</span> и точность
              </h1>
              <p className="hero-lead">
                Производим и монтируем окна ПВХ, алюминиевые системы, фасады, витражи и
                панорамное остекление для объектов по всей Беларуси.
              </p>

              <div className="hero-actions">
                <a className="button button-primary" href="#request">
                  Получить расчёт
                </a>
                <a className="button button-secondary" href="#projects">
                  Смотреть проекты
                </a>
              </div>

              <ul className="hero-proof">
                {HERO_PROOF.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="hero-client-strip">
                {HERO_CLIENT_MARKS.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>

            <aside className="hero-rail">
              {TRUST_METRICS.slice(0, 3).map(([value, label]) => (
                <article key={value}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </article>
              ))}
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductsSection() {
  const [feature, secondary, ...rest] = PRODUCTS;

  return (
    <section className="section systems" id="products">
      <div className="container">
        <div className="systems-header reveal">
          <div>
            <p className="section-kicker">Системные решения</p>
            <h2>Окна, фасады и светопрозрачные конструкции под масштаб объекта</h2>
            <p>
              Не каталог ради каталога, а набор инженерных направлений, из которых собирается
              решение под частный или коммерческий объект.
            </p>
          </div>
          <span className="systems-note">Архитектурный стандарт производителя</span>
        </div>

        <div className="systems-layout">
          <article className="system-feature reveal">
            <div className="system-feature-image">
              <Image
                src={assetPath(feature.image)}
                alt={feature.alt}
                fill
                sizes="(max-width: 1180px) 100vw, 58vw"
              />
            </div>
            <div className="system-feature-copy">
              <p className="card-tag">{feature.tag}</p>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <Link href={`/uslugi/${feature.slug}/`}>{feature.linkLabel}</Link>
            </div>
          </article>

          <article className="system-secondary reveal reveal-delay">
            <div className="system-secondary-image">
              <Image
                src={assetPath(secondary.image)}
                alt={secondary.alt}
                fill
                sizes="(max-width: 1180px) 100vw, 38vw"
              />
            </div>
            <div className="system-secondary-copy">
              <p className="card-tag">{secondary.tag}</p>
              <h3>{secondary.title}</h3>
              <p>{secondary.text}</p>
              <Link href={`/uslugi/${secondary.slug}/`}>{secondary.linkLabel}</Link>
            </div>
          </article>

          <div className="system-mini-grid">
            {rest.map((item, index) => (
              <article
                className={`system-mini-card reveal ${index % 3 === 1 ? "reveal-delay" : index % 3 === 2 ? "reveal-delay-2" : ""}`}
                key={item.slug}
              >
                <p className="card-tag">{item.tag}</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Link href={`/uslugi/${item.slug}/`}>{item.linkLabel}</Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function StandardsSection() {
  return (
    <section className="section editorial-band">
      <div className="container editorial-shell reveal">
        <div className="editorial-copy">
          <p className="section-kicker">Производственный контур</p>
          <h2>Собственное производство, проектирование и монтаж в одном контуре ответственности</h2>
          <p>
            Это не набор подрядчиков по цепочке. Компания держит в одной системе расчёт, узлы,
            изготовление, монтаж и дальнейшее сервисное сопровождение.
          </p>
        </div>

        <div className="editorial-media">
          <div className="editorial-image">
            <Image
              src={assetPath("/assets/photos/company-production.png")}
              alt="Производственный цех СтеклоСтройГрупп"
              fill
              sizes="(max-width: 1180px) 100vw, 42vw"
            />
          </div>
          <div className="editorial-grid">
            {STANDARDS.map((item) => (
              <article key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section className="section trust-proof">
      <div className="container trust-shell">
        <div className="trust-copy reveal">
          <p className="section-kicker">Доверие и подтверждения</p>
          <h2>Не обещания, а факты: сертификация, объекты, гарантия и инженерный контроль</h2>
          <p>
            На этой части сайта всё должно работать на одно решение: пользователь видит не
            рекламные тезисы, а доказательства, что компания умеет доводить проект до результата.
          </p>

          <div className="trust-chip-strip">
            {TRUST_OBJECT_MARKS.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="trust-column">
          <div className="trust-stack">
            {TRUST_DOCUMENTS.map((item, index) => (
              <article
                className={`trust-card reveal ${index === 1 ? "reveal-delay" : index === 2 ? "reveal-delay-2" : ""}`}
                key={item.title}
              >
                <p className="card-tag">{item.meta}</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className="reason-grid">
            {TRUST_REASONS.map((item, index) => (
              <article
                className={`reason-card reveal ${index === 1 ? "reveal-delay" : index === 2 ? "reveal-delay-2" : ""}`}
                key={item.title}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className="document-summary-banner reveal">
            <div>
              <p className="card-tag">Публичные документы</p>
              <h3>ISO 9001, техкомпетентность и сертификаты по системам уже собраны</h3>
              <p>
                Документальный слой вынесен отдельно, чтобы у заказчика был быстрый путь от
                доверия к проверке.
              </p>
            </div>
            <Link href="/o-kompanii/#documents">К документам</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DocumentsSection() {
  return (
    <section className="section documents-proof" id="documents">
      <div className="container">
        <SectionHeading
          eyebrow="Сертификация и документы"
          title="Публичные документы, которые были опубликованы на исходном сайте"
          description="Собрали названия и ссылки на документы, подтверждающие процессы, компетентность и основные системы."
        />

        <div className="document-proof-grid">
          {CERTIFICATION_DOCUMENTS.map((item, index) => (
            <article
              className={`document-proof-card reveal ${index % 3 === 1 ? "reveal-delay" : index % 3 === 2 ? "reveal-delay-2" : ""}`}
              key={item.title}
            >
              <p className="card-tag">PDF-документ</p>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
              <a href={item.href} target="_blank" rel="noreferrer">
                Открыть документ
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OperationsSection({
  eyebrow = "Как выглядит работа",
  title = "Производство, выезд, логистика и сопровождение проекта",
  description = "Показываем не абстрактный сервис, а реальные рабочие процессы и визуальный материал, который удалось собрать со старого сайта.",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <section className="section operations-proof">
      <div className="container">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />

        <div className="operations-grid">
          {OPERATIONS_GALLERY.map((item, index) => (
            <article
              className={`operation-card reveal ${index % 3 === 1 ? "reveal-delay" : index % 3 === 2 ? "reveal-delay-2" : ""}`}
              key={item.title}
            >
              <div className="operation-image">
                <Image
                  src={assetPath(item.image)}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 1180px) 100vw, 33vw"
                />
              </div>
              <div className="operation-copy">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectsSection() {
  return (
    <section className="section projects" id="projects">
      <div className="container">
        <div className="objects-header reveal">
          <div>
            <p className="section-kicker">Объекты</p>
            <h2>Реальные проекты, по которым видно масштаб, контур и дисциплину исполнения</h2>
          </div>
        </div>

        <div className="objects-list">
          {PROJECTS.map((item, index) => (
            <article className="object-row reveal" key={item.id}>
              <div className="object-meta">
                <span className="object-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.note}</p>
                </div>
              </div>

              <div className="object-copy">
                <p>{item.text}</p>
                <div className="object-links">
                  <Link href={`/proekty/${item.slug}/`}>О проекте</Link>
                  <Link href={`/uslugi/${item.relatedServiceSlug}/`}>{item.relatedServiceLabel}</Link>
                </div>
              </div>

              <div className="object-thumb">
                <Image
                  src={assetPath(item.image)}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 1180px) 100vw, 20vw"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProcessSection() {
  return (
    <section className="section process-section" id="services">
      <div className="container">
        <div className="process-heading reveal">
          <p className="section-kicker">Технологический цикл</p>
        </div>

        <div className="process-grid">
          {PROCESS_STEPS.map((item) => (
            <article className="process-card reveal" key={item.step}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PartnersSection() {
  return (
    <section className="section partners" id="partners">
      <div className="container partners-shell">
        <div className="partners-copy reveal">
          <p className="section-kicker">Партнёрам</p>
          <h2>Для застройщиков, дилеров, архитекторов и подрядчиков — отдельный рабочий контур</h2>
          <p>
            Партнёрская работа должна выглядеть не как общий маркетинговый блок, а как отдельный
            сценарий с понятной техподдержкой, расчётами и координацией.
          </p>
        </div>

        <div className="partners-grid">
          {PARTNER_BENEFITS.map((item, index) => (
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
  );
}

export function FaqSection({ items = HOME_FAQ }: { items?: FaqItem[] }) {
  return (
    <section className="section faq">
      <div className="container faq-shell">
        <div className="section-heading reveal">
          <p className="section-kicker">FAQ</p>
          <h2>Частые вопросы перед расчётом и выездом на объект</h2>
        </div>

        <div className="faq-list">
          {items.map((item, index) => (
            <details
              className={`faq-item reveal ${index % 3 === 1 ? "reveal-delay" : index % 3 === 2 ? "reveal-delay-2" : ""}`}
              key={item.question}
            >
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RequestSection({
  eyebrow = "Получить расчёт",
  title = "Запросить расчёт сметы по объекту",
  description = "Оставьте базовые данные по объекту, а технический специалист вернётся с понятным следующим шагом и форматом расчёта.",
  defaultProduct,
}: RequestSectionProps) {
  return (
    <section className="section request" id="request">
      <div className="container">
        <div className="request-shell">
          <div className="request-copy reveal">
            <p className="section-kicker">{eyebrow}</p>
            <h2>{title}</h2>
            <p>{description}</p>

            <div className="contact-stack">
              {CONTACTS.phones.map((phone) => (
                <a key={phone.href} href={phone.href}>
                  {phone.label}
                </a>
              ))}
              <a href={`mailto:${CONTACTS.primaryEmail}`}>{CONTACTS.primaryEmail}</a>
            </div>

            <div className="request-facts">
              <span>{CONTACTS.serviceArea}</span>
              <span>Замер за 24 часа</span>
              <span>Сертификация ISO 9001:2015</span>
            </div>
          </div>

          <RequestForm defaultProduct={defaultProduct} />
        </div>
      </div>
    </section>
  );
}
