/* eslint-disable @next/next/no-img-element -- CMS pages accept approved remote image URLs. */

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { assetPath } from "@/lib/site-utils";
import type { CmsBlock, CmsPublishedPage } from "@/lib/cms-published";
import { cmsBlockText } from "@/lib/cms-published";

function imagePath(value: string) {
  return value.startsWith("/") ? assetPath(value) : value;
}

function Block({ block, isFirst }: { block: CmsBlock; isFirst: boolean }) {
  const eyebrow = cmsBlockText(block, "eyebrow");
  const heading = cmsBlockText(block, "heading") || block.label;
  const body = cmsBlockText(block, "body");
  const image = cmsBlockText(block, "imageUrl");
  const alt = cmsBlockText(block, "imageAlt") || heading;
  const ctaLabel = cmsBlockText(block, "ctaLabel");
  const ctaHref = cmsBlockText(block, "ctaHref") || "/raschet/";
  const items = Array.isArray(block.data.items) ? block.data.items : [];

  return (
    <section className={`cms-public-block cms-public-block-${block.block_type} ${isFirst ? "is-first" : ""}`}>
      {image ? <img className="cms-public-block-media" src={imagePath(image)} alt={alt} /> : null}
      <div className="container cms-public-block-inner">
        <div className="cms-public-block-copy">
          {eyebrow ? <p className="optical-label">{eyebrow}</p> : null}
          {isFirst ? <h1>{heading}</h1> : <h2>{heading}</h2>}
          {body ? <p>{body}</p> : null}
          {items.length ? <ul>{items.map((item, index) => <li key={index}>{typeof item === "object" && item ? String((item as Record<string, unknown>).title || (item as Record<string, unknown>).label || "") : String(item)}</li>)}</ul> : null}
          {ctaLabel ? <Link className="button button-primary" href={ctaHref} data-analytics-event="cms_block_cta"><span>{ctaLabel}</span><ArrowUpRight size={20} weight="thin" aria-hidden="true" /></Link> : null}
        </div>
      </div>
    </section>
  );
}

export function CmsPublishedPageView({ page }: { page: CmsPublishedPage }) {
  const blocks = [...(page.blocks ?? [])].filter((block) => block.is_visible).sort((a, b) => a.position - b.position);
  return (
    <div className="page-shell cms-public-page">
      <SiteHeader />
      <main>
        {blocks.map((block, index) => <Block key={block.id} block={block} isFirst={index === 0} />)}
      </main>
      <SiteFooter />
    </div>
  );
}
