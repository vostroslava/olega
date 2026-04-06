import Link from "next/link";
import { CONTACTS, PRODUCTS } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contacts">
      <div className="container footer-grid">
        <div className="footer-brand">
          <p className="section-kicker">Контакты</p>
          <h2>СтеклоСтройГрупп</h2>
          <p>
            Производство и монтаж светопрозрачных конструкций, фасадов, окон и алюминиевых систем
            по всей Беларуси.
          </p>
          <div className="footer-facts">
            <p>Почтовый адрес: {CONTACTS.postalAddress}</p>
            <p>Юридический адрес: {CONTACTS.legalAddress}</p>
            <p>Банк: {CONTACTS.bankDetails}</p>
          </div>
        </div>

        <div className="footer-column">
          <h3>Связаться</h3>
          {CONTACTS.phones.map((phone) => (
            <a key={phone.href} href={phone.href}>
              {phone.label}
            </a>
          ))}
          {CONTACTS.emails.map((email) => (
            <a key={email} href={`mailto:${email}`}>
              {email}
            </a>
          ))}
        </div>

        <div className="footer-column">
          <h3>Направления</h3>
          {PRODUCTS.slice(0, 4).map((product) => (
            <Link key={product.slug} href={`/uslugi/${product.slug}/`}>
              {product.title}
            </Link>
          ))}
          <Link href="/uslugi/">Все услуги</Link>
          <Link href="/proekty/">Все проекты</Link>
          <Link href="/o-kompanii/">О компании</Link>
          <Link href="/partneram/">Партнёрам</Link>
          <Link href="/kontakty/">Контакты</Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} ООО «СтеклоСтройГрупп». Все права защищены.</p>
        <div className="footer-bottom-links">
          <Link href="/politika-konfidentsialnosti/">Политика конфиденциальности</Link>
          <Link href="/kontakty/">Контакты</Link>
        </div>
      </div>
    </footer>
  );
}
