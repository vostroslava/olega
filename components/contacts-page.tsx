import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StructuredData } from "@/components/seo/structured-data";
import { RequestSection } from "@/components/sections/home-sections";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { CONTACTS } from "@/lib/site-data";
import {
  createBreadcrumbStructuredData,
  createLocalBusinessStructuredData,
} from "@/lib/seo";

function ContactCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="contact-card reveal">
      <h3>{title}</h3>
      <div>{children}</div>
    </article>
  );
}

export function ContactsPage() {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=30.3279%2C53.8973%2C30.3379%2C53.9015&layer=mapnik&marker=${CONTACTS.coordinates.lat}%2C${CONTACTS.coordinates.lon}`;

  return (
    <div className="page-shell">
      <StructuredData
        data={createBreadcrumbStructuredData([
          { name: "Главная", path: "/" },
          { name: "Контакты", path: "/kontakty/" },
        ])}
      />
      <StructuredData
        data={createLocalBusinessStructuredData({
          name: "СтеклоСтройГрупп",
          email: CONTACTS.primaryEmail,
          telephone: CONTACTS.phones.map((item) => item.label),
          streetAddress: "пер. Коммунистический, д. 2, оф. 5",
          addressLocality: "Могилёв",
          postalCode: "212030",
          addressCountry: "BY",
          areaServed: "Беларусь",
          path: "/kontakty/",
        })}
      />
      <SiteHeader />

      <main className="page-main">
        <section className="page-hero section">
          <div className="container page-hero-shell reveal" id="contacts-hero">
            <div className="page-hero-copy">
              <div className="page-breadcrumbs">
                <Link href="/">Главная</Link>
                <span>/</span>
                <span>Контакты</span>
              </div>

              <p className="eyebrow">Контакты и заявка</p>
              <h1>Контакты, реквизиты и быстрый запрос по объекту</h1>
              <p className="hero-lead">
                Свяжитесь удобным способом: по телефону, email, через форму сайта или по маршруту
                до офиса в Могилёве.
              </p>
              <p className="page-hero-text">
                На странице собраны все каналы связи для частных клиентов, партнёров и запросов по
                расчёту объектов.
              </p>

              <div className="hero-actions">
                <a className="button button-primary" href={CONTACTS.phones[0].href}>
                  Позвонить
                </a>
                <a className="button button-secondary" href="#request">
                  Оставить заявку
                </a>
              </div>
            </div>

            <aside className="page-hero-panel reveal reveal-delay">
              <strong>Быстрые контакты</strong>
              <ul className="page-highlight-list">
                <li>{CONTACTS.phones[0].label}</li>
                <li>{CONTACTS.primaryEmail}</li>
                <li>{CONTACTS.serviceArea}</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="section contacts-layout">
          <div className="container contacts-grid">
            <div className="contact-card-grid">
              <ContactCard title="Телефоны">
                {CONTACTS.phones.map((phone) => (
                  <a key={phone.href} className="contact-link" href={phone.href}>
                    {phone.label}
                  </a>
                ))}
                <p>{CONTACTS.responseTime}</p>
              </ContactCard>

              <ContactCard title="Email">
                {CONTACTS.emails.map((email) => (
                  <a key={email} className="contact-link" href={`mailto:${email}`}>
                    {email}
                  </a>
                ))}
                <p>Пишите по коммерческим и партнёрским запросам, а также по расчёту объектов.</p>
              </ContactCard>

              <ContactCard title="Адреса">
                <p>Почтовый адрес: {CONTACTS.postalAddress}</p>
                <p>Юридический адрес: {CONTACTS.legalAddress}</p>
                <div className="contact-actions">
                  <a className="button button-secondary" href={CONTACTS.directionsUrls.yandex} target="_blank" rel="noreferrer">
                    Открыть в Яндекс Картах
                  </a>
                </div>
              </ContactCard>

              <ContactCard title="Реквизиты">
                <p>{CONTACTS.bankDetails}</p>
                <p>{CONTACTS.serviceArea}</p>
              </ContactCard>
            </div>

            <div className="contact-map-shell reveal">
              <div className="contact-map-frame">
                <iframe
                  title="Карта офиса СтеклоСтройГрупп"
                  src={mapUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="contact-map-footer">
                <strong>Офис в Могилёве</strong>
                <p>{CONTACTS.postalAddress}</p>
                <div className="contact-actions">
                  <a className="button button-secondary" href={CONTACTS.directionsUrls.google} target="_blank" rel="noreferrer">
                    Открыть в Google Maps
                  </a>
                  <a className="button button-secondary" href={CONTACTS.directionsUrls.yandex} target="_blank" rel="noreferrer">
                    Маршрут в Яндекс
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <RequestSection
          eyebrow="Оставить заявку"
          title="Если удобнее, отправьте запрос прямо со страницы контактов"
          description="Для первого контакта достаточно имени, телефона и короткого описания задачи. Остальное уточним уже после обратной связи."
        />
      </main>

      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="contacts-hero" requestId="request" href="#request" label="Оставить заявку" />
    </div>
  );
}
