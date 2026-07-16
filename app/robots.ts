import type { MetadataRoute } from "next";
import { isPreviewDeployment, siteConfig } from "@/lib/site-config";
import { getPublishedCmsPages } from "@/lib/cms-published";

export const dynamic = "force-static";

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (isPreviewDeployment) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const excludedPaths = (await getPublishedCmsPages()).filter((page) => !page.is_indexable).map((page) => page.slug);
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: excludedPaths,
    },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
    host: siteConfig.siteUrl,
  };
}
