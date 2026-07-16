import type { Metadata } from "next";
import { siteApiUrl } from "@/lib/site-api";
import { siteConfig } from "@/lib/site-config";

export type CmsBlock = {
  id: string;
  block_key: string;
  block_type: "hero" | "text" | "image" | "cards" | "projects" | "technology" | "faq" | "quote" | "cta";
  label: string;
  position: number;
  is_visible: boolean;
  data: Record<string, unknown>;
};

export type CmsPublishedPage = {
  slug: string;
  navigation_label: string;
  published_page_title: string;
  published_meta_description: string;
  published_snapshot: Record<string, unknown> | null;
  published_at: string;
  is_indexable: boolean;
  is_in_navigation: boolean;
  navigation_order: number;
  sitemap_priority: number;
  sitemap_change_frequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  seo_robots: "index,follow" | "noindex,follow" | "noindex,nofollow";
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  twitter_card: "summary" | "summary_large_image";
  blocks?: CmsBlock[];
};

export type CmsNavigationItem = { id: string; label: string; href: string; position: number; is_visible: boolean; opens_new_tab: boolean };
export type CmsSettings = Record<string, Record<string, string>>;

function endpoint(path: string) {
  return siteApiUrl ? `${siteApiUrl}${path}` : "";
}

async function getJson<T>(path: string): Promise<T | null> {
  const url = endpoint(path);
  if (!url) return null;
  try {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

export async function getPublishedCmsPage(slug: string) {
  const result = await getJson<{ ok: boolean; page?: CmsPublishedPage; blocks?: CmsBlock[] }>(`/content/page?slug=${encodeURIComponent(slug)}`);
  return result?.ok && result.page ? { ...result.page, blocks: result.blocks ?? [] } : null;
}

export async function getPublishedCmsPages() {
  const result = await getJson<{ ok: boolean; pages?: CmsPublishedPage[] }>("/content/pages");
  return result?.ok ? result.pages ?? [] : [];
}

export async function getPublishedCmsNavigation() {
  const result = await getJson<{ ok: boolean; navigation?: CmsNavigationItem[] }>("/content/navigation");
  return result?.ok ? result.navigation ?? [] : [];
}

export async function getPublishedCmsSettings() {
  const result = await getJson<{ ok: boolean; settings?: Array<{ setting_key: string; setting_value: Record<string, string> }> }>("/content/settings");
  return Object.fromEntries((result?.settings ?? []).map((setting) => [setting.setting_key, setting.setting_value])) as CmsSettings;
}

type MetadataFallback = { title: string; description: string; path: string };

export function buildPublishedCmsMetadata(page: CmsPublishedPage | null, fallback: MetadataFallback): Metadata {
  if (!page) {
    return {
      title: fallback.title,
      description: fallback.description,
      alternates: { canonical: fallback.path },
    };
  }

  const robots = page.seo_robots.split(",");
  const title = page.published_page_title || fallback.title;
  const description = page.published_meta_description || fallback.description;
  const ogTitle = page.og_title || title;
  const ogDescription = page.og_description || description;
  const ogImage = page.og_image_url || siteConfig.ogImage;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: page.slug || fallback.path },
    robots: { index: page.is_indexable && robots.includes("index"), follow: robots.includes("follow") },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: page.slug || fallback.path,
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.companyName,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: { card: page.twitter_card, title: ogTitle, description: ogDescription, images: [ogImage] },
  };
}

export function cmsBlockText(block: CmsBlock | undefined, key: string) {
  const value = block?.data?.[key];
  return typeof value === "string" ? value : "";
}
