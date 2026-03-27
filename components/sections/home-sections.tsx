import Image from "next/image";
import Link from "next/link";
import {
  CONTACTS,
  HERO_PROOF,
  HOME_FAQ,
  INTRO_ITEMS,
  PARTNER_BENEFITS,
  PROCESS_STEPS,
  PRODUCTS,
  PROJECTS,
  STANDARDS,
  TRUST_METRICS,
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
          </div>

          <div className="hero-media">
            <Image
              src={assetPath("/assets/hero-architecture.svg")}
              alt="Современный дом с панорамным остеклением и алюминиевыми фасадными системами"
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

export function IntroSection() {
  return (
    <section className="section intro">
      <div className="container intro-grid">
        <div className="section-heading reveal">
          <p className="eyebrow">Что делает новый макет сильнее</p>
          <h2>Сайт выглядит как уверенный производитель, а не как шаблонный каталог</h2>
        </div>

        <div className="intro-list">
          {INTRO_ITEMS.map((item, index) => (
            <article
              className={`intro-card reveal ${index === 1 ? "reveal-delay" : index === 2 ? "reveal-delay-2" : ""}`}
              key={item.number}
            >
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
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
          title="Ключевые направления, с которых начинается знакомство с компанией"
          description="На первом уровне клиент должен быстро найти нужное направление, понять его задачу и перейти к конкретной услуге."
        />

        <div className="product-grid">
          {PRODUCTS.map((item) => (
            <article className="product-card reveal" key={item.slug}>
              <div className={`product-visual ${item.visual}`} />
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
            объекта. Именно это и должен показывать сайт.
          </p>
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

export function ProjectsSection() {
  return (
    <section className="section projects" id="projects">
      <div className="container">
        <SectionHeading
          eyebrow="Проекты"
          title="Кейсы, которые дают ощущение масштаба и реальной компетенции"
          description="В макете кейсы показаны как крупные объектные карточки, а не как мелкий список без визуальной ценности."
        />

        <ProjectsGrid />

        <div className="quote-banner reveal">
          <p>
            Сайт должен показывать не просто конструкции, а масштаб объектов и то, как компания
            справляется с ними под ключ.
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
          title="Процесс должен выглядеть простым и управляемым для клиента"
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
          title="Отдельная B2B-подача для застройщиков, дилеров, архитекторов и подрядчиков"
          description="Этот блок нужен, чтобы сайт не говорил только с частным клиентом. Он должен быть понятен и для бизнеса."
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
          <h2>В макете сразу закрываем главные вопросы до звонка менеджеру</h2>
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
  title = "Форма должна быть короткой, понятной и не пугать количеством полей",
  description = "Для первой версии достаточно получить имя, телефон, тип запроса и короткое описание объекта. Всё лишнее добирает менеджер в следующем касании.",
  defaultProduct,
}: RequestSectionProps) {
  return (
    <section className="section request" id="request">
      <div className="container request-shell">
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

        <RequestForm defaultProduct={defaultProduct} />
      </div>
    </section>
  );
}
