import Image from "next/image";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MonolithCta, MonolithFact, MonolithFactRail, MonolithSectionHeading } from "@/components/ui/monolith-content";
import { MonolithPageHero } from "@/components/ui/monolith-page-hero";
import { ArchitecturalIcon } from "@/components/ui/architectural-icons";
import { ProductionRoute } from "@/components/ui/production-route";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { OPERATIONS_GALLERY, PROCESS_STEPS } from "@/lib/site-data";
import { assetPath } from "@/lib/site-utils";

export function ProductionPage() {
  const principles = [
    ["Собственный контур", "Проектирование, изготовление и контроль качества связаны одной командой."],
    ["Точная геометрия", "Проверяем размеры, узлы и допуски до передачи конструкции на монтаж."],
    ["Документированный контроль", "Комплектация и ключевые этапы фиксируются в рабочем процессе."],
  ];
  const icons = ["draft", "profile", "quality", "install"] as const;

  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="page-main monolith-inner-page">
        <MonolithPageHero id="production-hero" breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Производство" }]} title="Точность начинается на производстве" lead="Собственный производственный контур помогает сохранить архитектурную идею, геометрию конструкции и качество монтажа." image="/assets/photos/company-production.png" imageAlt="Производство СтеклоСтройГрупп" rail={["Контур", "Этапы", "Контроль", "Команда", "Расчёт"]} />

        <section className="monolith-content-section" id="section-1">
          <div className="container production-page-intro">
            <MonolithSectionHeading label="ПРОИЗВОДСТВЕННЫЙ КОНТУР" title="От технической идеи до готовой конструкции" text="Мы не отделяем красивую картинку от производства. Система, стеклопакет, профиль, фурнитура и монтажный узел рассматриваются как единое изделие." />
            <div className="production-page-media reveal"><Image src={assetPath("/assets/photos/company-production.png")} alt="Производственная линия" fill sizes="(max-width: 860px) 100vw, 58vw" /></div>
          </div>
          <div className="container"><MonolithFactRail>{principles.map(([title, text], index) => <MonolithFact key={title} index={String(index + 1).padStart(2, "0")} title={title} text={text} />)}</MonolithFactRail></div>
        </section>

        <section className="monolith-content-section monolith-content-section-alt" id="section-2">
          <div className="container">
            <MonolithSectionHeading label="ЭТАПЫ" title="Как проект проходит производство" />
            <div className="monolith-process-line">
              {PROCESS_STEPS.slice(0, 5).map((step) => <article className="reveal" key={step.step}><span>{step.step}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}
            </div>
            <ProductionRoute />
          </div>
        </section>

        <section className="monolith-content-section" id="section-3">
          <div className="container">
            <MonolithSectionHeading label="КОНТРОЛЬ" title="Качество видно в деталях" />
            <div className="production-detail-grid">
              {OPERATIONS_GALLERY.slice(0, 4).map((item, index) => {
                const icon = icons[index % icons.length];
                return <article className="reveal" key={item.title}><div><Image src={assetPath(item.image)} alt={item.alt} fill sizes="(max-width: 860px) 100vw, 50vw" /></div><ArchitecturalIcon kind={icon} className="production-detail-icon" /><h3>{item.title}</h3><p>{item.text}</p></article>;
              })}
            </div>
          </div>
        </section>
        <MonolithCta title="Передайте проект инженеру" text="Чертёж, спецификация или несколько фото помогут быстро определить систему и следующий этап проработки." />
      </main>
      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="production-hero" requestId="request" href="/raschet/" label="Передать проект" />
    </div>
  );
}
