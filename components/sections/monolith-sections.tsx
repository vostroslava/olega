"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { Factory } from "@phosphor-icons/react/dist/csr/Factory";
import { Buildings } from "@phosphor-icons/react/dist/csr/Buildings";
import { HouseLine } from "@phosphor-icons/react/dist/csr/HouseLine";
import { SealCheck } from "@phosphor-icons/react/dist/csr/SealCheck";
import { ShieldCheck } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { PROJECTS, PRODUCTS } from "@/lib/site-data";
import { assetPath } from "@/lib/site-utils";
import { QuoteWizard } from "@/components/ui/quote-wizard";

export function AudiencePathways() {
  return (
    <section className="monolith-section audience-section" id="audiences">
      <div className="container">
        <div className="monolith-section-title reveal">
          <h2>Выберите формат проекта</h2>
          <p>Два сценария — одна инженерная дисциплина.</p>
        </div>
        <div className="audience-split">
          <Link className="audience-panel reveal" href="/dlya-doma/">
            <Image src={assetPath("/assets/photos/product-winter-garden.png")} alt="Панорамное остекление частного дома" fill sizes="(max-width: 860px) 100vw, 50vw" />
            <span className="audience-shade" />
            <span className="audience-index">01</span>
            <HouseLine className="audience-icon" size={42} weight="thin" aria-hidden="true" />
            <span className="audience-copy">
              <strong>Для дома</strong>
              <small>Окна, террасы и панорамное остекление для вашего пространства</small>
            </span>
            <ArrowUpRight size={34} weight="thin" aria-hidden="true" />
          </Link>
          <Link className="audience-panel reveal reveal-delay" href="/dlya-biznesa/">
            <Image src={assetPath("/assets/photos/facade-evening.jpg")} alt="Коммерческий фасад из стекла и алюминия" fill sizes="(max-width: 860px) 100vw, 50vw" />
            <span className="audience-shade" />
            <span className="audience-index">02</span>
            <Buildings className="audience-icon" size={42} weight="thin" aria-hidden="true" />
            <span className="audience-copy">
              <strong><span className="audience-label-desktop">Для коммерческого объекта</span><span className="audience-label-mobile">Для бизнеса</span></strong>
              <small>Фасады, входные группы и алюминиевые системы для бизнеса</small>
            </span>
            <ArrowUpRight size={34} weight="thin" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SolutionsShowcase() {
  const [active, setActive] = useState(0);
  const product = PRODUCTS[active];

  return (
    <section className="monolith-section solutions-section" id="solutions">
      <div className="container">
        <div className="monolith-section-title monolith-title-row reveal">
          <h2>Решения из стекла и алюминия</h2>
          <Link href="/produktsiya/">Вся продукция <ArrowUpRight size={19} weight="thin" /></Link>
        </div>
        <div className="solution-tabs" role="tablist" aria-label="Направления">
          {PRODUCTS.slice(0, 5).map((item, index) => (
            <button
              key={item.slug}
              type="button"
              className={active === index ? "is-active" : ""}
              onClick={() => setActive(index)}
              role="tab"
              aria-selected={active === index}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </div>
        <div className="solution-stage" key={product.slug}>
          <div className="solution-copy reveal is-visible">
            <span className="optical-label">{product.tag}</span>
            <h3>{product.title}</h3>
            <p>{product.text}</p>
            <Link className="button button-secondary button-on-dark" href={`/uslugi/${product.slug}/`}>
              Смотреть решение <ArrowUpRight size={19} weight="thin" />
            </Link>
          </div>
          <div className="solution-media">
            <Image src={assetPath(product.image)} alt={product.alt} fill sizes="(max-width: 860px) 100vw, 70vw" />
            <span className="solution-spec" aria-hidden="true">ИНЖЕНЕРНОЕ СТЕКЛО</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProjectShowcase() {
  const [active, setActive] = useState(0);
  const project = PROJECTS[active];
  const previous = () => setActive((value) => (value - 1 + PROJECTS.length) % PROJECTS.length);
  const next = () => setActive((value) => (value + 1) % PROJECTS.length);

  return (
    <section className="project-showcase" id="projects">
      <div className="project-showcase-media" key={project.id}>
        <Image src={assetPath(project.image)} alt={project.alt} fill sizes="100vw" />
      </div>
      <div className="project-showcase-shade" />
      <div className="project-optic-frame" aria-hidden="true">
        <span className="project-optic-edge project-optic-edge-top" />
        <span className="project-optic-edge project-optic-edge-side" />
        <span className="project-optic-marker project-optic-marker-one">ТЕПЛОВОЙ УЗЕЛ</span>
        <span className="project-optic-marker project-optic-marker-two">АРХИТЕКТУРНОЕ СТЕКЛО</span>
      </div>
      <div className="container project-showcase-inner">
        <div className="project-heading reveal">
          <p className="optical-label">РЕАЛИЗОВАННЫЕ ОБЪЕКТЫ</p>
          <h2>Архитектура,<br />которую можно увидеть</h2>
        </div>
        <div className="project-active-card">
          <div className="project-number"><strong>{String(active + 1).padStart(2, "0")}</strong><span>/ {String(PROJECTS.length).padStart(2, "0")}</span></div>
          <h3>{project.title}</h3>
          <p>{project.location} · {project.note}</p>
          <small>{project.relatedServiceLabel} · {project.area}</small>
        </div>
        <div className="project-controls">
          <button type="button" onClick={previous}><ArrowLeft size={22} weight="thin" /> Предыдущий</button>
          <button type="button" onClick={next}>Следующий <ArrowRight size={22} weight="thin" /></button>
          <Link href="/proekty/">Все проекты <ArrowUpRight size={22} weight="thin" /></Link>
        </div>
      </div>
    </section>
  );
}

export function ProductionStory() {
  return (
    <section className="production-story" id="production">
      <div className="container production-story-grid">
        <div className="production-copy reveal">
          <p className="optical-label">СОБСТВЕННОЕ ПРОИЗВОДСТВО</p>
          <h2>Точность начинается на производстве</h2>
          <p>Проектируем, изготавливаем и монтируем конструкции силами одной команды. Так архитектурная идея не теряется между чертежом и монтажом.</p>
          <ul>
            <li>Собственное производство</li>
            <li>Контроль на каждом этапе</li>
            <li>Гарантия 3 года</li>
          </ul>
          <Link className="button button-primary" href="/proizvodstvo/">Как мы работаем <ArrowUpRight size={20} weight="thin" /></Link>
        </div>
        <div className="production-media reveal reveal-delay">
          <Image src={assetPath("/assets/photos/company-production.png")} alt="Производство окон и алюминиевых конструкций" fill sizes="(max-width: 860px) 100vw, 55vw" />
          <div className="production-scan" aria-hidden="true">
            <span className="production-scan-line" />
            <span className="production-scan-point production-scan-point-one" />
            <span className="production-scan-point production-scan-point-two" />
          </div>
          <div className="production-spec" aria-hidden="true">
            <span>ДОПУСКИ</span><strong>ПО УЗЛАМ</strong>
            <span>КОНТРОЛЬ</span><strong>НА ЭТАПАХ</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProofBand() {
  const items = [
    { value: "15+", label: "лет опыта в остеклении", icon: ShieldCheck },
    { value: "ISO", label: "9001:2015 — контроль качества", icon: SealCheck },
    { value: "24", label: "часа до замера", icon: Factory },
    { value: "BY", label: "работаем по всей Беларуси", icon: ArrowUpRight },
  ];
  return (
    <section className="proof-band">
      <div className="container proof-band-grid">
        {items.map(({ value, label, icon: Icon }) => (
          <article className="reveal" key={value}>
            <Icon size={24} weight="thin" aria-hidden="true" />
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HomeQuoteSection() {
  return (
    <section className="home-quote-section" id="request">
      <div className="container home-quote-grid">
        <div className="home-quote-intro reveal">
          <p className="optical-label">РАСЧЁТ ПРОЕКТА</p>
          <h2>Рассчитаем ваш проект</h2>
          <p>Ответьте на четыре коротких вопроса — это поможет собрать исходные данные для инженера.</p>
          <small>Фото, чертёж или PDF можно приложить прямо к заявке.</small>
        </div>
        <QuoteWizard compact />
      </div>
    </section>
  );
}
