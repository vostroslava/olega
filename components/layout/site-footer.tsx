import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { MapPin } from "@phosphor-icons/react/dist/ssr/MapPin";
import { Phone } from "@phosphor-icons/react/dist/ssr/Phone";
import { SquareHalf } from "@phosphor-icons/react/dist/ssr/SquareHalf";
import { CONTACTS, PRODUCTS } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contacts">
      <div className="footer-contact-band">
        <div className="container footer-contact-grid">
          <div>
            <h2>Обсудим объект?</h2>
            <p>Подберём решение, которое подчеркнёт архитектуру объекта и будет удобно в ежедневной эксплуатации.</p>
          </div>
          <div className="footer-contact-item">
            <Phone size={24} weight="thin" aria-hidden="true" />
            <div>
              <a href={CONTACTS.phones[0].href}>{CONTACTS.phones[0].label}</a>
              <a href={CONTACTS.phones[1].href}>{CONTACTS.phones[1].label}</a>
            </div>
          </div>
          <div className="footer-contact-item">
            <EnvelopeSimple size={24} weight="thin" aria-hidden="true" />
            <a href={`mailto:${CONTACTS.primaryEmail}`}>{CONTACTS.primaryEmail}</a>
          </div>
          <div className="footer-contact-item">
            <MapPin size={24} weight="thin" aria-hidden="true" />
            <span>Могилёв · вся Беларусь</span>
          </div>
          <Link className="button button-primary" href="/raschet/">
            <span>Заказать звонок</span>
            <ArrowUpRight size={20} weight="thin" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="container footer-grid">
        <div className="footer-brand">
          <Link className="brand" href="/" aria-label="СтеклоСтройГрупп">
            <SquareHalf className="brand-mark" size={31} weight="thin" aria-hidden="true" />
            <strong>СтеклоСтройГрупп</strong>
          </Link>
          <p>Окна, фасады и панорамное остекление — от замера до монтажа по всей Беларуси.</p>
          <small>ИНЖЕНЕРНЫЙ ПОДХОД</small>
        </div>
        <div className="footer-column">
          <h3>Решения</h3>
          <Link href="/dlya-doma/">Для дома</Link>
          <Link href="/dlya-biznesa/">Для бизнеса</Link>
          <Link href="/produktsiya/">Вся продукция</Link>
          <Link href="/uslugi/">Услуги под ключ</Link>
          {PRODUCTS.slice(0, 3).map((product) => (
            <Link key={product.slug} href={`/uslugi/${product.slug}/`}>{product.title}</Link>
          ))}
        </div>
        <div className="footer-column">
          <h3>Компания</h3>
          <Link href="/o-kompanii/">О компании</Link>
          <Link href="/proizvodstvo/">Производство</Link>
          <Link href="/proekty/">Проекты</Link>
          <Link href="/partneram/">Партнёрам</Link>
          <Link href="/novosti/">Новости</Link>
          <Link href="/kontakty/">Контакты</Link>
        </div>
        <div className="footer-column">
          <h3>Клиентам</h3>
          <Link href="/raschet/">Получить расчёт</Link>
          <Link href="/uslugi/">Все услуги</Link>
          <Link href="/politika-konfidentsialnosti/">Конфиденциальность</Link>
          <a href={`mailto:${CONTACTS.primaryEmail}`}>Написать нам</a>
        </div>
        <Link className="footer-cta" href="/raschet/">
          <span>Получить расчёт</span>
          <ArrowUpRight size={24} weight="thin" aria-hidden="true" />
        </Link>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} ООО «СтеклоСтройГрупп»</p>
        <Link href="/politika-konfidentsialnosti/">Политика конфиденциальности</Link>
        <p>УНП 791356349</p>
      </div>
    </footer>
  );
}
