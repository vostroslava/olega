import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MonolithPageHero } from "@/components/ui/monolith-page-hero";
import { RevealInit } from "@/components/ui/reveal-init";
import { CONTACTS } from "@/lib/site-data";

export function PrivacyPage() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="page-main monolith-inner-page">
        <MonolithPageHero id="privacy-hero" breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Конфиденциальность" }]} title="Политика конфиденциальности" lead="Какие данные мы получаем через формы сайта, зачем используем и как можно управлять их обработкой." image="/assets/photos/project-arbat.png" imageAlt="Реальный объект СтеклоСтройГрупп" rail={["Данные", "Цели", "Хранение", "Права", "Контакты"]} primaryLabel="Контакты" primaryHref="/kontakty/" secondaryLabel="На главную" secondaryHref="/" />
        <section className="legal-section" id="section-1">
          <div className="container legal-layout">
            <aside><p className="optical-label">ОПЕРАТОР ДАННЫХ</p><strong>ООО «СтеклоСтройГрупп»</strong><a href={`mailto:${CONTACTS.primaryEmail}`}>{CONTACTS.primaryEmail}</a><p>{CONTACTS.postalAddress}</p></aside>
            <div className="legal-content reveal">
              <section><span>01</span><h2>Какие данные мы собираем</h2><p>Через формы сайта мы можем получать имя, телефон, адрес электронной почты, выбранный тип запроса, текст комментария и файлы, которые пользователь прикладывает добровольно.</p></section>
              <section><span>02</span><h2>Для чего используются данные</h2><p>Только для связи по заявке, подготовки расчёта или консультации, уточнения параметров объекта и состава работ.</p></section>
              <section><span>03</span><h2>Как обрабатываются и хранятся данные</h2><p>В объёме, необходимом для выполнения запроса, договорных обязательств и требований законодательства. Мы не используем данные для нерелевантной рассылки и не публикуем загруженные материалы.</p></section>
              <section><span>04</span><h2>Права пользователя</h2><p>Вы можете запросить уточнение, изменение или удаление данных, а также отозвать согласие на обработку по email {CONTACTS.primaryEmail}.</p></section>
              <section><span>05</span><h2>Контакты</h2><p>Email: {CONTACTS.primaryEmail}<br />Телефон: {CONTACTS.phones[0].label}<br />Адрес: {CONTACTS.postalAddress}</p></section>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <RevealInit />
    </div>
  );
}
