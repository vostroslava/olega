import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RevealInit } from "@/components/ui/reveal-init";

export default function NotFound() {
  return (
    <div className="page-shell">
      <SiteHeader />

      <main className="page-main">
        <section className="page-hero section">
          <div className="container page-hero-shell reveal">
            <div className="page-hero-copy">
              <p className="eyebrow">404</p>
              <h1>Страница не найдена</h1>
              <p className="hero-lead">
                Возможно, ссылка устарела или страница была перемещена. Вернитесь на главную или
                откройте нужный раздел сайта.
              </p>

              <div className="hero-actions">
                <Link className="button button-primary" href="/">
                  На главную
                </Link>
                <Link className="button button-secondary" href="/uslugi/">
                  Открыть услуги
                </Link>
              </div>
            </div>

            <aside className="page-hero-panel reveal reveal-delay">
              <strong>Куда перейти дальше</strong>
              <ul className="page-highlight-list">
                <li>
                  <Link href="/proekty/">Реализованные проекты</Link>
                </li>
                <li>
                  <Link href="/kontakty/">Контакты и реквизиты</Link>
                </li>
                <li>
                  <Link href="/partneram/">Партнёрское направление</Link>
                </li>
              </ul>
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter />
      <RevealInit />
    </div>
  );
}

