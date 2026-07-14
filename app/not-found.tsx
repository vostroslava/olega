import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function NotFound() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="status-page-main"><div className="container status-page-card"><p className="optical-label">404 · СТРАНИЦА НЕ НАЙДЕНА</p><h1>Прозрачная<br />навигация</h1><p>Ссылка устарела или страница была перенесена. Все основные направления доступны в новом меню.</p><div className="hero-actions"><Link className="button button-primary" href="/">На главную <ArrowUpRight size={20} weight="thin" /></Link><Link className="button button-secondary button-on-dark" href="/produktsiya/">Вся продукция <ArrowUpRight size={20} weight="thin" /></Link></div></div></main>
      <SiteFooter />
    </div>
  );
}
