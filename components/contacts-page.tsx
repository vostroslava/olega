import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { MapPin } from "@phosphor-icons/react/dist/ssr/MapPin";
import { Phone } from "@phosphor-icons/react/dist/ssr/Phone";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StructuredData } from "@/components/seo/structured-data";
import { MonolithCta, MonolithSectionHeading } from "@/components/ui/monolith-content";
import { MonolithPageHero } from "@/components/ui/monolith-page-hero";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { CONTACTS } from "@/lib/site-data";
import { createBreadcrumbStructuredData, createLocalBusinessStructuredData } from "@/lib/seo";

export function ContactsPage() {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=30.3279%2C53.8973%2C30.3379%2C53.9015&layer=mapnik&marker=${CONTACTS.coordinates.lat}%2C${CONTACTS.coordinates.lon}`;
  return (
    <div className="page-shell">
      <StructuredData data={createBreadcrumbStructuredData([{ name: "Главная", path: "/" }, { name: "Контакты", path: "/kontakty/" }])} />
      <StructuredData data={createLocalBusinessStructuredData({ name: "СтеклоСтройГрупп", email: CONTACTS.primaryEmail, telephone: CONTACTS.phones.map((item) => item.label), streetAddress: "пер. Коммунистический, д. 2, оф. 5", addressLocality: "Могилёв", postalCode: "212030", addressCountry: "BY", areaServed: "Беларусь", path: "/kontakty/" })} />
      <SiteHeader />
      <main className="page-main monolith-inner-page">
        <MonolithPageHero id="contacts-hero" breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Контакты" }]} title="Начнём с вашего объекта" lead="Свяжитесь напрямую или отправьте исходные данные. Работаем из Могилёва и выезжаем на объекты по всей Беларуси." image="/assets/photos/team-site-supervision.png" imageAlt="Инженеры СтеклоСтройГрупп на объекте" rail={["Связь", "Офис", "Маршрут", "Реквизиты", "Заявка"]} primaryLabel="Оставить заявку" secondaryLabel="Позвонить" secondaryHref={CONTACTS.phones[0].href} />

        <section className="monolith-content-section" id="section-1">
          <div className="container"><MonolithSectionHeading label="СВЯЗАТЬСЯ" title="Удобный канал для каждого запроса" /><div className="contact-monolith-grid">
            <article className="reveal"><Phone size={30} weight="thin" /><span>Телефоны</span>{CONTACTS.phones.map((phone) => <a href={phone.href} key={phone.href}>{phone.label}</a>)}<p>{CONTACTS.responseTime}</p></article>
            <article className="reveal"><EnvelopeSimple size={30} weight="thin" /><span>Email</span>{CONTACTS.emails.map((email) => <a href={`mailto:${email}`} key={email}>{email}</a>)}<p>Коммерческие, партнёрские и сервисные запросы.</p></article>
            <article className="reveal"><MapPin size={30} weight="thin" /><span>Адрес</span><strong>{CONTACTS.postalAddress}</strong><p>{CONTACTS.serviceArea}</p></article>
          </div></div>
        </section>

        <section className="monolith-content-section monolith-content-section-alt" id="section-2">
          <div className="container contact-map-layout"><div><MonolithSectionHeading label="ОФИС" title="Могилёв — вся Беларусь" text={CONTACTS.postalAddress} /><div className="contact-map-actions"><a className="button button-secondary button-on-dark" href={CONTACTS.directionsUrls.yandex} target="_blank" rel="noreferrer">Яндекс Карты</a><a className="button button-secondary button-on-dark" href={CONTACTS.directionsUrls.google} target="_blank" rel="noreferrer">Google Maps</a></div><div className="contact-requisites"><span>Юридический адрес</span><p>{CONTACTS.legalAddress}</p><span>Банковские реквизиты</span><p>{CONTACTS.bankDetails}</p></div></div><div className="contact-map-frame reveal"><iframe title="Карта офиса СтеклоСтройГрупп" src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div></div>
        </section>
        <MonolithCta title="Отправить исходные данные" text="Фото, план, чертёж или короткое описание помогут инженеру быстро подготовиться к первому разговору." />
      </main>
      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="contacts-hero" requestId="request" href="/raschet/" label="Оставить заявку" />
    </div>
  );
}
