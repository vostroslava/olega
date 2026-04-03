import type { MetadataRoute } from "next";
import { PROJECTS, SERVICE_PAGES } from "@/lib/site-data";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "/",
    "/uslugi/",
    "/proekty/",
    "/kontakty/",
    "/o-kompanii/",
    "/partneram/",
    "/politika-konfidentsialnosti/",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${siteConfig.siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...SERVICE_PAGES.map((service) => ({
      url: `${siteConfig.siteUrl}/uslugi/${service.slug}/`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...PROJECTS.map((project) => ({
      url: `${siteConfig.siteUrl}/proekty/${project.slug}/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
