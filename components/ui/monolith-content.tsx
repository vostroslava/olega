import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { assetPath } from "@/lib/site-utils";

export function MonolithSectionHeading({
  label,
  title,
  text,
}: {
  label?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="monolith-content-heading reveal">
      {label ? <p className="optical-label">{label}</p> : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

export function MonolithImagePair({
  primary,
  primaryAlt,
  secondary,
  secondaryAlt,
}: {
  primary: string;
  primaryAlt: string;
  secondary: string;
  secondaryAlt: string;
}) {
  return (
    <div className="monolith-image-pair reveal">
      <div><Image src={assetPath(primary)} alt={primaryAlt} fill sizes="(max-width: 860px) 100vw, 45vw" /></div>
      <div><Image src={assetPath(secondary)} alt={secondaryAlt} fill sizes="(max-width: 860px) 100vw, 27vw" /></div>
    </div>
  );
}

export function MonolithFactRail({ children }: { children: ReactNode }) {
  return <div className="monolith-fact-rail">{children}</div>;
}

export function MonolithFact({ index, title, text }: { index: string; title: string; text: string }) {
  return (
    <article className="reveal">
      <span>{index}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export function MonolithCta({
  label = "СЛЕДУЮЩИЙ ШАГ",
  title = "Обсудим ваш объект",
  text = "Пришлите исходные данные — инженер предложит понятный следующий шаг по проекту.",
  href = "/raschet/",
  action = "Рассчитать проект",
}: {
  label?: string;
  title?: string;
  text?: string;
  href?: string;
  action?: string;
}) {
  return (
    <section
      className="monolith-cta"
      id="request"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(7, 10, 12, 0.96), rgba(7, 10, 12, 0.7)), url("${assetPath("/assets/photos/project-avenue.png")}")`,
      }}
    >
      <div className="container monolith-cta-inner reveal">
        <div>
          <p className="optical-label">{label}</p>
          <h2>{title}</h2>
        </div>
        <p>{text}</p>
        <Link className="button button-primary" href={href} data-magnetic>
          {action}<ArrowUpRight size={20} weight="thin" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
