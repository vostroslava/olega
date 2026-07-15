import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { assetPath } from "@/lib/site-utils";

export default function NotFound() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main
        className="status-page-main"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(7, 10, 12, 0.96), rgba(7, 10, 12, 0.58)), url("${assetPath("/assets/photos/project-arbat.png")}")`,
        }}
      ><div className="container status-page-card"><p className="optical-label">404 · СТРАНИЦА НЕ НАЙДЕНА</p><h1>Страница<br />не найдена</h1><p>Ссылка устарела или страница недоступна. Все основные направления можно открыть из меню сайта.</p><div className="hero-actions"><Link className="button button-primary" href="/">На главную <ArrowUpRight size={20} weight="thin" /></Link><Link className="button button-secondary button-on-dark" href="/produktsiya/">Вся продукция <ArrowUpRight size={20} weight="thin" /></Link></div></div></main>
      <SiteFooter />
    </div>
  );
}
