import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StructuredData } from "@/components/seo/structured-data";
import { MonolithCta, MonolithImagePair, MonolithSectionHeading } from "@/components/ui/monolith-content";
import { MonolithPageHero } from "@/components/ui/monolith-page-hero";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { PROCESS_STEPS } from "@/lib/site-data";
import { createBreadcrumbStructuredData } from "@/lib/seo";

const manufactured = [
  {
    title: "Окна, двери и перегородки",
    text: "Алюминиевые и пластиковые конструкции для жилых, коммерческих и общественных пространств.",
  },
  {
    title: "Панорамное остекление",
    text: "Большие светопрозрачные плоскости для домов, офисов, террас и входных зон.",
  },
  {
    title: "Входные группы и зимние сады",
    text: "Нестандартные конструкции с подбором профиля, стеклопакета и рабочих узлов.",
  },
  {
    title: "Фасады и витражи",
    text: "Фасадные системы и витражные конструкции для объектов разного масштаба.",
  },
] as const;

const services = [
  {
    title: "Замер и консультация",
    text: "Выезжаем на объект, уточняем задачу и собираем исходные данные для расчёта.",
  },
  {
    title: "Проектирование и визуализация",
    text: "Разрабатываем конструктив, согласовываем конфигурацию и показываем будущее решение.",
  },
  {
    title: "Доставка, монтаж и герметизация",
    text: "Берём ответственность за установку и финальную проверку конструкции на объекте.",
  },
  {
    title: "Гарантийный сервис",
    text: "Сопровождаем изделие после сдачи и выполняем постгарантийное обслуживание.",
  },
] as const;

export function OperationsPage() {
  return (
    <div className="page-shell">
      <StructuredData data={createBreadcrumbStructuredData([{ name: "Главная", path: "/" }, { name: "Услуги", path: "/uslugi/" }])} />
      <SiteHeader />
      <main className="page-main monolith-inner-page">
        <MonolithPageHero
          id="operations-hero"
          breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Услуги" }]}
          title="Полный цикл работ под ключ"
          lead="От первого замера и проектирования до производства, монтажа, герметизации и сервисного сопровождения."
          image="/assets/photos/team-site-supervision.png"
          imageAlt="Инженеры СтеклоСтройГрупп контролируют работы на объекте"
          rail={["Замер", "Проект", "Производство", "Монтаж", "Сервис"]}
        />

        <section className="monolith-content-section" id="section-1">
          <div className="container">
            <MonolithSectionHeading
              label="ПРОЦЕСС"
              title="Одна команда отвечает за весь результат"
              text="Замер, проектирование, производство, монтаж и сервис выстроены в понятный маршрут — без разрыва между этапами."
            />
            <div className="monolith-process-line services-process-line">
              {PROCESS_STEPS.map((item) => (
                <article className="reveal" key={item.step}>
                  <span>{item.step}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="monolith-content-section monolith-content-section-alt" id="section-2">
          <div className="container">
            <MonolithSectionHeading label="ИЗГОТАВЛИВАЕМ" title="Конструкции собственного производства" />
            <div className="monolith-fact-rail services-four-rail">
              {manufactured.map((item, index) => (
                <article className="reveal" key={item.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="monolith-content-section" id="section-3">
          <div className="container">
            <MonolithSectionHeading label="ОКАЗЫВАЕМ" title="Инженерные и монтажные услуги" />
            <div className="monolith-fact-rail services-four-rail">
              {services.map((item, index) => (
                <article className="reveal" key={item.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="monolith-content-section monolith-content-section-alt" id="section-4">
          <div className="container">
            <MonolithSectionHeading
              label="НА ОБЪЕКТЕ"
              title="Проектирование продолжается до финальной сдачи"
              text="Команда контролирует конструктивные решения, производство, логистику и качество монтажа как части одного процесса."
            />
            <MonolithImagePair
              primary="/assets/photos/team-consultation.png"
              primaryAlt="Команда обсуждает техническое решение"
              secondary="/assets/photos/logistics-truck.png"
              secondaryAlt="Доставка конструкций СтеклоСтройГрупп"
            />
          </div>
        </section>

        <section className="monolith-route-band" id="section-5">
          <div className="container monolith-route-grid">
            <Link href="/produktsiya/"><span>01</span><strong>Продукция</strong><small>Все системы и конструкции</small><ArrowUpRight size={28} weight="thin" /></Link>
            <Link href="/proizvodstvo/"><span>02</span><strong>Производство</strong><small>Оборудование и контроль</small><ArrowUpRight size={28} weight="thin" /></Link>
            <Link href="/partneram/"><span>03</span><strong>Партнёрам</strong><small>Проектный и дилерский формат</small><ArrowUpRight size={28} weight="thin" /></Link>
          </div>
        </section>

        <MonolithCta title="Нужен полный цикл работ?" text="Приложите фото, план или техническое задание — инженер определит следующий шаг и состав исходных данных." />
      </main>
      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="operations-hero" requestId="request" href="/raschet/" label="Передать исходные данные" />
    </div>
  );
}
