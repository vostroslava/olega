import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MonolithCta, MonolithFact, MonolithFactRail, MonolithSectionHeading } from "@/components/ui/monolith-content";
import { MonolithPageHero } from "@/components/ui/monolith-page-hero";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { PRODUCTS, PROJECTS } from "@/lib/site-data";
import { assetPath } from "@/lib/site-utils";

type AudiencePageProps = {
  kind: "home" | "business";
};

const content = {
  home: {
    title: "Стекло для пространства, в котором хочется жить",
    lead: "Окна, панорамные двери, террасы и зимние сады — с точным расчётом тепла, безопасности и ежедневного комфорта.",
    image: "/assets/photos/project-arbat.png",
    imageAlt: "Реальный объект СтеклоСтройГрупп с панорамным остеклением",
    intro: "Свет, тишина и связь с ландшафтом",
    introText: "Подбираем систему не по названию профиля, а по сценарию жизни: стороне света, размеру проёма, отоплению, безопасности детей и удобству открывания.",
    products: ["okna-pvh", "alyuminievye-sistemy", "panoramnoe-osteklenie", "zimnie-sady"],
    facts: [
      ["Тёплый контур", "Считаем теплопотери и подбираем стеклопакет под реальную архитектуру дома."],
      ["Безопасность", "Закалённое и ламинированное стекло там, где это требуется сценарием использования."],
      ["Точный монтаж", "Сохраняем геометрию, герметичность и чистый архитектурный узел."],
    ],
  },
  business: {
    title: "Светопрозрачная архитектура для бизнеса",
    lead: "Фасады, витражи, входные группы и алюминиевые системы для объектов, где важны сроки, инженерная дисциплина и визуальный результат.",
    image: "/assets/photos/facade-evening.jpg",
    imageAlt: "Коммерческий фасад со светопрозрачными конструкциями",
    intro: "Инженерный контур для объекта любого масштаба",
    introText: "Подключаемся к проекту на этапе идеи, рабочей документации или замены подрядчика. Берём ответственность за расчёт, производство, логистику, монтаж и сервис.",
    products: ["fasady-i-vitrazhi", "alyuminievye-sistemy", "peregorodki-i-vkhodnye-gruppy", "panoramnoe-osteklenie"],
    facts: [
      ["Техподдержка", "Работаем с архитектором, генподрядчиком и службой эксплуатации в одном информационном контуре."],
      ["Сроки и логистика", "Планируем производство и поставку под этапность строительства и доступность монтажных зон."],
      ["Документы", "Фиксируем комплектацию, требования к узлам и контроль качества до начала монтажа."],
    ],
  },
} as const;

export function AudiencePage({ kind }: AudiencePageProps) {
  const page = content[kind];
  const selectedProducts = page.products.map((slug) => PRODUCTS.find((item) => item.slug === slug)).filter(Boolean);

  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="page-main monolith-inner-page">
        <MonolithPageHero
          id="audience-hero"
          breadcrumbs={[{ label: "Главная", href: "/" }, { label: kind === "home" ? "Для дома" : "Для бизнеса" }]}
          title={page.title}
          lead={page.lead}
          image={page.image}
          imageAlt={page.imageAlt}
          rail={["Задача", "Решения", "Подход", "Объекты", "Расчёт"]}
        />

        <section className="monolith-content-section" id="section-1">
          <div className="container audience-intro-layout">
            <MonolithSectionHeading label={kind === "home" ? "ДЛЯ ЖИЗНИ" : "ДЛЯ КОММЕРЦИИ"} title={page.intro} text={page.introText} />
            <div className="audience-intro-image reveal">
              <Image src={assetPath(kind === "home" ? "/assets/photos/product-winter-garden.png" : "/assets/photos/project-avenue.png")} alt={page.intro} fill sizes="(max-width: 860px) 100vw, 58vw" />
            </div>
          </div>
          <div className="container">
            <MonolithFactRail>
              {page.facts.map(([title, text], index) => <MonolithFact key={title} index={String(index + 1).padStart(2, "0")} title={title} text={text} />)}
            </MonolithFactRail>
          </div>
        </section>

        <section className="monolith-content-section monolith-content-section-alt" id="section-2">
          <div className="container">
            <MonolithSectionHeading label="РЕШЕНИЯ" title={kind === "home" ? "Для дома, квартиры и террасы" : "Для фасада, входной группы и интерьера"} />
            <div className="audience-solutions-grid">
              {selectedProducts.map((product, index) => product ? (
                <Link href={`/uslugi/${product.slug}/`} className="audience-solution-card reveal" key={product.slug}>
                  <Image src={assetPath(product.image)} alt={product.alt} fill sizes="(max-width: 860px) 100vw, 50vw" />
                  <span className="audience-solution-shade" />
                  <small>{String(index + 1).padStart(2, "0")} · {product.tag}</small>
                  <strong>{product.title}</strong>
                  <ArrowUpRight size={30} weight="thin" />
                </Link>
              ) : null)}
            </div>
          </div>
        </section>

        <section className="monolith-content-section" id="section-3">
          <div className="container">
            <MonolithSectionHeading label="ПОДХОД" title="Решение начинается не с каталога, а с объекта" text="Выезжаем на замер, проверяем геометрию и условия монтажа, после чего собираем технически честное предложение." />
            <div className="monolith-process-line">
              {["Brief и исходные данные", "Замер и проверка узлов", "Проектирование и расчёт", "Производство и монтаж"].map((item, index) => (
                <article className="reveal" key={item}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item}</h3><p>{index === 0 ? "Понимаем задачу, сроки и архитектурный замысел." : index === 1 ? "Фиксируем фактические размеры и риски на объекте." : index === 2 ? "Подбираем систему, стеклопакет, фурнитуру и монтажный контур." : "Изготавливаем, доставляем, монтируем и передаём гарантию."}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="monolith-content-section monolith-content-section-alt" id="section-4">
          <div className="container">
            <MonolithSectionHeading label="ОБЪЕКТЫ" title="Реализованные проекты" />
            <div className="monolith-project-row">
              {PROJECTS.slice(0, 2).map((project, index) => (
                <Link className="monolith-project-link reveal" href={`/proekty/${project.slug}/`} key={project.id}>
                  <Image src={assetPath(project.image)} alt={project.alt} fill sizes="(max-width: 860px) 100vw, 50vw" />
                  <span className="monolith-project-overlay" />
                  <span className="monolith-project-meta">{String(index + 1).padStart(2, "0")} · {project.location}</span>
                  <strong>{project.title}</strong>
                  <ArrowUpRight size={28} weight="thin" />
                </Link>
              ))}
            </div>
          </div>
        </section>
        <MonolithCta title={kind === "home" ? "Рассчитать остекление дома" : "Обсудить коммерческий объект"} text="Приложите план, фото или техническое задание — инженер соберёт понятный следующий шаг." />
      </main>
      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="audience-hero" requestId="request" href="/raschet/" label="Рассчитать проект" />
    </div>
  );
}
