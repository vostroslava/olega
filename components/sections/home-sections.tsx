import Image from "next/image";
import Link from "next/link";
import {
  CERTIFICATION_DOCUMENTS,
  CONTACTS,
  HERO_PROOF,
  HERO_CLIENT_MARKS,
  HOME_FAQ,
  PARTNER_BENEFITS,
  OPERATIONS_GALLERY,
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
import { QuickEstimate } from "@/components/ui/quick-estimate";
import { WindowAssemblySequence } from "@/components/ui/window-assembly-sequence";

type FaqItem = {
  question: string;
  answer: string;
};

type RequestSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  defaultProduct?: string;
  showEstimate?: boolean;
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
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export function MetricsBand() {
  return (
    <div className="trust-bar reveal reveal-delay">
      {TRUST_METRICS.map(([value, label]) => (
        <article key={value}>
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
      {projects.map((item) => (
        <article className="project-card reveal" key={item.id}>
          <div className="project-image">
            <Image
              src={assetPath(item.image)}
              alt={item.alt}
              fill
              sizes="(max-width: 1180px) 100vw, 33vw"
            />
          </div>
          <div className="project-body">
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
          <div className="hero-copy">
            <p className="eyebrow">Собственное производство ПВХ и алюминиевых систем</p>
            <h1>Фасады и окна, которые работают десятилетиями</h1>
            <p className="hero-lead">
              Проектируем, производим и монтируем светопрозрачные конструкции под ключ: окна ПВХ,
              алюминиевые системы, фасады, витражи и панорамное остекление для частных и
              коммерческих объектов.
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

            <div className="hero-social-proof">
              <span>Уже работали с объектами такого уровня</span>
              <div className="hero-chip-strip">
                {HERO_CLIENT_MARKS.map((item) => (
                  <strong key={item}>{item}</strong>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-media">
            <Image
              src={assetPath("/assets/photos/hero-company-facade.png")}
              alt="Современный коммерческий объект с фасадным остеклением"
              fill
              priority
              sizes="(max-width: 860px) 100vw, 56vw"
            />
            <article className="hero-note">
              <span>Производство и монтаж по всей Беларуси</span>
              <strong>Окна, двери, витражи, фасады и зимние сады</strong>
            </article>
          </div>
        </div>

        <MetricsBand />
      </div>
    </section>
  );
}

export function ProductsSection() {
  return (
    <section className="section products" id="products">
      <div className="container">
        <SectionHeading
          eyebrow="Продукция"
          title="Ключевые направления для частных и коммерческих объектов"
          description="Быстро выберите нужное направление, сравните задачи и перейдите к детальной странице услуги."
        />

        <div className="product-grid">
          {PRODUCTS.map((item) => (
            <article className="product-card reveal" key={item.slug}>
              <div className="product-visual">
                <Image
                  src={assetPath(item.image)}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 1180px) 100vw, 33vw"
                />
              </div>
              <p className="card-tag">{item.tag}</p>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <Link href={`/uslugi/${item.slug}/`}>{item.linkLabel}</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StandardsSection() {
  return (
    <section className="section standards">
      <div className="container standards-shell reveal">
        <div className="standards-copy">
          <p className="eyebrow">Почему выбирают нас</p>
          <h2>Полный цикл с инженерным контролем, а не просто изготовление конструкций</h2>
          <p>
            Собственное производство, конструкторское бюро, монтажные бригады и сервис после сдачи
            объекта. Заказчик получает один понятный контур ответственности на всех этапах.
          </p>

          <div className="standards-photo">
            <Image
              src={assetPath("/assets/photos/company-production.png")}
              alt="Производственный цех СтеклоСтройГрупп"
              fill
              sizes="(max-width: 1180px) 100vw, 42vw"
            />
          </div>
        </div>

        <div className="standards-grid">
          {STANDARDS.map((item) => (
            <article key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section className="section trust-proof">
      <div className="container trust-proof-shell">
        <SectionHeading
          eyebrow="Доверие и подтверждения"
          title="Факты, документы и объекты, которые усиливают решение о заявке"
          description="Показываем не абстрактное качество, а конкретные сигналы доверия: сертификацию, гарантию, скорость запуска и типы объектов, где компания уже работала."
        />

        <div className="document-grid">
          {TRUST_DOCUMENTS.map((item, index) => (
            <article
              className={`document-card reveal ${index === 1 ? "reveal-delay" : index === 2 ? "reveal-delay-2" : ""}`}
              key={item.title}
            >
              <p className="card-tag">{item.meta}</p>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="logo-strip reveal">
          {TRUST_OBJECT_MARKS.map((item) => (
            <span className="logo-chip" key={item}>
              {item}
            </span>
          ))}
        </div>

        <div className="testimonial-grid">
          {TRUST_REASONS.map((item, index) => (
            <article
              className={`testimonial-card reveal ${index === 1 ? "reveal-delay" : index === 2 ? "reveal-delay-2" : ""}`}
              key={item.title}
            >
              <span className="testimonial-mark">Почему это важно</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="document-summary-banner reveal">
          <div>
            <p className="card-tag">Документы со старого сайта</p>
            <h3>Нашли и сохранили 6 подтверждающих документов</h3>
            <p>
              В старом сайте опубликованы ISO 9001:2015, техническая компетентность и
              сертификаты по дверям, окнам, стеклопакетам и элементам остекления.
            </p>
          </div>
          <Link href="/o-kompanii/#documents">Перейти к документам</Link>
        </div>
      </div>
    </section>
  );
}

export function WindowAssemblySection() {
  return (
    <section className="section assembly-section" id="window-assembly">
      <div className="container assembly-shell">
        <div className="assembly-copy reveal">
          <p className="eyebrow">Окно как система</p>
          <h2>Показываем конструкцию по слоям, а не обещаем абстрактное качество</h2>
          <p>
            В этой сцене окно собирается на одной оси: профиль, стеклопакет, прижим и фурнитура
            сходятся без смены ракурса. Это не декоративный эффект, а визуальное объяснение того,
            что именно делает систему стабильной и собранной.
          </p>

          <div className="assembly-facts">
            <article className="assembly-fact">
              <strong>Одна ось сборки</strong>
              <p>Все слои сходятся строго по горизонтали без вращения и случайного разлёта.</p>
            </article>
            <article className="assembly-fact">
              <strong>Читается состав</strong>
              <p>Отдельно видны профиль, стеклопакет, прижимные слои и узел ручки с фурнитурой.</p>
            </article>
            <article className="assembly-fact">
              <strong>Финал без трюков</strong>
              <p>Сцена заканчивается собранным окном в том же положении, в котором она начиналась.</p>
            </article>
          </div>

          <div className="hero-actions">
            <a className="button button-primary" href="#request">
              Обсудить конфигурацию
            </a>
            <Link className="button button-secondary" href="/uslugi/okna-pvh/">
              Смотреть систему ПВХ
            </Link>
          </div>

          <p className="assembly-scroll-note">Прокрутите секцию: окно собирается по слоям.</p>
        </div>

        <div className="assembly-stage reveal reveal-delay">
          <WindowAssemblySequence rootId="window-assembly" />
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
          title="Публичные документы, которые были опубликованы на старом сайте"
          description="Собрали названия и ссылки из страницы «О компании». Это самый конкретный trust-слой, который удалось добрать из legacy-сайта."
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
  description = "Показываем не абстрактный сервис, а реальные рабочие процессы, которые удалось достать со старого сайта: объект, команда, комплектующие, доставка и внутренняя стеклянная архитектура.",
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
        <SectionHeading
          eyebrow="Проекты"
          title="Реальные объекты, по которым видно масштаб и опыт компании"
          description="Показываем коммерческие и общественные объекты, чтобы было понятно, с какими задачами компания уже работала."
        />

        <ProjectsGrid />

        <div className="quote-banner reveal">
          <p>
            Посмотрите реализованные объекты, чтобы оценить уровень задач, качество фасадного
            контура и опыт работы с коммерческими проектами.
          </p>
          <Link href="/proekty/">Открыть все проекты</Link>
        </div>
      </div>
    </section>
  );
}

export function ProcessSection() {
  return (
    <section className="section services" id="services">
      <div className="container process-shell">
        <SectionHeading
          eyebrow="Как работаем"
          title="Понятный процесс от замера до монтажа"
        />

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
        <SectionHeading
          eyebrow="Партнёрам"
          title="Формат работы для застройщиков, дилеров, архитекторов и подрядчиков"
          description="Отдельно показываем расчёты, техподдержку и формат взаимодействия для B2B-проектов."
        />

        <div className="partners-grid">
          {PARTNER_BENEFITS.map((item) => (
            <article className="partner-card reveal" key={item.title}>
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
          <p className="eyebrow">FAQ</p>
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
  title = "Получить расчёт и консультацию по объекту",
  description = "Оставьте имя, телефон, тип запроса и короткое описание объекта. Технические детали уточним уже на следующем касании.",
  defaultProduct,
  showEstimate = false,
}: RequestSectionProps) {
  return (
    <section className="section request" id="request">
      <div className={`container request-shell ${showEstimate ? "request-shell-extended" : ""}`}>
        <div className="request-copy reveal">
          <p className="eyebrow">{eyebrow}</p>
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
            <span>{CONTACTS.postalAddress}</span>
            <span>Замер за 24 часа</span>
          </div>
        </div>

        {showEstimate ? (
          <div className="request-tools">
            <div className="request-estimate">
              <div className="request-estimate-copy reveal">
                <p className="eyebrow">Быстрый ориентир</p>
                <h3>Сначала быстро поймите формат задачи</h3>
                <p>
                  Это не коммерческое предложение, а короткий ориентир перед отправкой формы:
                  насколько запрос типовой, нужен ли выезд и как лучше зайти в расчёт.
                </p>
              </div>
              <QuickEstimate />
            </div>

            <RequestForm defaultProduct={defaultProduct} />
          </div>
        ) : (
          <RequestForm defaultProduct={defaultProduct} />
        )}
      </div>
    </section>
  );
}
