import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "@phosphor-icons/react/dist/ssr/ArrowDown";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { assetPath } from "@/lib/site-utils";

type Breadcrumb = { label: string; href?: string };

type MonolithPageHeroProps = {
  id: string;
  breadcrumbs: Breadcrumb[];
  title: string;
  lead: string;
  image: string;
  imageAlt: string;
  rail?: string[];
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function MonolithPageHero({
  id,
  breadcrumbs,
  title,
  lead,
  image,
  imageAlt,
  rail = ["Возможности", "Системы", "Процесс", "Объекты", "Вопросы"],
  primaryLabel = "Рассчитать проект",
  primaryHref = "/raschet/",
  secondaryLabel = "Смотреть объекты",
  secondaryHref = "/proekty/",
}: MonolithPageHeroProps) {
  return (
    <section className="monolith-page-hero" id={id}>
      <div className="monolith-page-media">
        <Image src={assetPath(image)} alt={imageAlt} fill priority sizes="100vw" />
      </div>
      <div className="monolith-page-shade" />
      <div className="container monolith-page-hero-inner">
        <div className="monolith-breadcrumbs" aria-label="Навигационная цепочка">
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`}>
              {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
              {index < breadcrumbs.length - 1 ? <i>/</i> : null}
            </span>
          ))}
        </div>
        <div className="monolith-page-copy reveal is-visible">
          <h1>{title}</h1>
          <p>{lead}</p>
          <div className="hero-actions">
            <Link className="button button-primary" href={primaryHref}>
              {primaryLabel}<ArrowUpRight size={20} weight="thin" aria-hidden="true" />
            </Link>
            <Link className="button button-secondary button-on-dark" href={secondaryHref}>
              {secondaryLabel}<ArrowUpRight size={20} weight="thin" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="monolith-page-spec" aria-hidden="true">LOW-IRON GLASS<br /><strong>10 MM</strong></div>
        <aside className="monolith-page-rail" aria-label="Содержание страницы">
          {rail.map((item, index) => (
            <a className={index === 0 ? "is-active" : ""} href={`#section-${index + 1}`} key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item}
            </a>
          ))}
        </aside>
        <a className="monolith-page-scroll" href="#section-1" aria-label="Читать дальше">
          <ArrowDown size={20} weight="thin" />
        </a>
      </div>
    </section>
  );
}
