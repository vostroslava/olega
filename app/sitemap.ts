import type { MetadataRoute } from "next";
import { PROJECTS, SERVICE_PAGES } from "@/lib/site-data";
import { isPreviewDeployment, siteConfig } from "@/lib/site-config";
import { getPublishedCmsPages } from "@/lib/cms-published";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isPreviewDeployment) return [];

  const staticRoutes = [
    "/",
    "/produktsiya/",
    "/uslugi/",
    "/dlya-doma/",
    "/dlya-biznesa/",
    "/proekty/",
    "/proizvodstvo/",
    "/raschet/",
    "/kontakty/",
    "/o-kompanii/",
    "/partneram/",
    "/politika-konfidentsialnosti/",
  ];

  const cmsRoutes = (await getPublishedCmsPages())
    .filter((page) => page.is_indexable)
    .map((page) => ({
      url: `${siteConfig.siteUrl}${page.slug}`,
      lastModified: page.published_at,
      changeFrequency: page.sitemap_change_frequency,
      priority: Number(page.sitemap_priority),
    }));

  const routes = [
    ...staticRoutes.map((path) => ({
      url: `${siteConfig.siteUrl}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...SERVICE_PAGES.map((service) => ({
      url: `${siteConfig.siteUrl}/uslugi/${service.slug}/`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...PROJECTS.map((project) => ({
      url: `${siteConfig.siteUrl}/proekty/${project.slug}/`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...cmsRoutes,
  ];

  return Array.from(new Map(routes.map((route) => [route.url, route])).values());
}
