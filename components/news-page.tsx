import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StructuredData } from "@/components/seo/structured-data";
import { MonolithCta, MonolithSectionHeading } from "@/components/ui/monolith-content";
import { MonolithPageHero } from "@/components/ui/monolith-page-hero";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { assetPath } from "@/lib/site-utils";
import { createBreadcrumbStructuredData } from "@/lib/seo";

const newsDirections = [
  {
    title: "Производство",
    text: "Новое оборудование, контроль качества, материалы и изменения в производственном процессе.",
  },
  {
    title: "Системы и продукты",
    text: "Новые модели окон и дверей, профильные системы, фурнитура и варианты комплектации.",
  },
  {
    title: "Объекты",
    text: "Ход реализации проектов, готовые фасады и инженерные решения с реальных площадок.",
  },
  {
    title: "Эксплуатация",
    text: "Практические материалы по выбору, уходу и обслуживанию ПВХ- и алюминиевых конструкций.",
  },
] as const;

const editorialItems = [
  {
    title: "Как создаётся конструкция",
    text: "Будем показывать путь изделия от технического задания до упаковки и выезда на объект.",
    image: "/assets/photos/company-production.png",
    alt: "Производственный процесс СтеклоСтройГрупп",
    featured: true,
  },
  {
    title: "Разбор реализованных объектов",
    text: "Что требовалось заказчику, какую систему выбрали и как решение работает после сдачи.",
    image: "/assets/photos/facade-evening.jpg",
    alt: "Реализованный фасадный объект в вечернее время",
    featured: false,
  },
  {
    title: "Советы без рекламных обещаний",
    text: "Понятные рекомендации по стеклопакетам, профилям, фурнитуре и обслуживанию конструкций.",
    image: "/assets/photos/hardware-components.png",
    alt: "Фурнитура и компоненты оконных систем",
    featured: false,
  },
] as const;

export function NewsPage() {
  return (
    <div className="page-shell">
      <StructuredData data={createBreadcrumbStructuredData([{ name: "Главная", path: "/" }, { name: "Новости", path: "/novosti/" }])} />
      <SiteHeader />
      <main className="page-main monolith-inner-page">
        <MonolithPageHero
          id="news-hero"
          breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Новости" }]}
          title="Новости и инженерные материалы"
          lead="Обновления производства, новые системы, реализованные объекты и полезные материалы по эксплуатации конструкций."
          image="/assets/photos/company-production.png"
          imageAlt="Производство СтеклоСтройГрупп"
          rail={["Производство", "Продукты", "Объекты", "Советы", "Контакты"]}
        />

        <section className="monolith-content-section" id="section-1">
          <div className="container">
            <MonolithSectionHeading
              label="РУБРИКИ"
              title="Темы, которые полезны заказчику"
              text="Производство, системы, объекты и эксплуатация — четыре направления, по которым мы готовим понятные материалы."
            />
            <div className="monolith-fact-rail services-four-rail">
              {newsDirections.map((item, index) => (
                <article className="reveal" key={item.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="monolith-content-section monolith-content-section-alt" id="section-2">
          <div className="container">
            <MonolithSectionHeading
              label="РЕДАКЦИОННЫЙ ПЛАН"
              title="Три формата для содержательного раздела"
              text="Публикации не выдумываем задним числом: здесь зафиксированы форматы, которые можно наполнять реальными новостями компании."
            />
            <div className="operations-editorial-grid">
              {editorialItems.map((item, index) => (
                <article className={`reveal ${item.featured ? "is-featured" : ""}`} key={item.title}>
                  <div><Image src={assetPath(item.image)} alt={item.alt} fill sizes={item.featured ? "(max-width: 860px) 100vw, 48vw" : "(max-width: 860px) 100vw, 38vw"} /></div>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="monolith-route-band" id="section-3">
          <div className="container monolith-route-grid">
            <Link href="/proizvodstvo/"><span>01</span><strong>Производство</strong><small>Как создаются конструкции</small><ArrowUpRight size={28} weight="thin" /></Link>
            <Link href="/proekty/"><span>02</span><strong>Проекты</strong><small>Реальные объекты компании</small><ArrowUpRight size={28} weight="thin" /></Link>
            <Link href="/produktsiya/"><span>03</span><strong>Продукция</strong><small>Все системы и направления</small><ArrowUpRight size={28} weight="thin" /></Link>
          </div>
        </section>

        <MonolithCta title="Есть вопрос для будущего материала?" text="Напишите нам — инженер подскажет по вашему объекту, а полезные повторяющиеся вопросы станут основой новых публикаций." href="/kontakty/" action="Задать вопрос" />
      </main>
      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="news-hero" requestId="request" href="/kontakty/" label="Задать вопрос" />
    </div>
  );
}
