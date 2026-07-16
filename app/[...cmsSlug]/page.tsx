import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CmsPublishedPageView } from "@/components/cms/cms-published-page";
import { buildPublishedCmsMetadata, getPublishedCmsPage, getPublishedCmsPages } from "@/lib/cms-published";

type RouteProps = { params: Promise<{ cmsSlug: string[] }> };

const existingRoutes = new Set(["dlya-doma", "dlya-biznesa", "proekty", "proizvodstvo", "kontakty"]);

function toSlug(parts: string[]) {
  return `/${parts.join("/")}/`;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const pages = await getPublishedCmsPages();
  const generated = pages
    .filter((page) => page.slug !== "/" && !existingRoutes.has(page.slug.split("/").filter(Boolean)[0] || ""))
    .map((page) => ({ cmsSlug: page.slug.split("/").filter(Boolean) }));
  return generated.length ? generated : [{ cmsSlug: ["__cms_preview__"] }];
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const slug = toSlug((await params).cmsSlug);
  if (slug === "/__cms_preview__/") return {};
  const page = await getPublishedCmsPage(slug);
  return buildPublishedCmsMetadata(page, { title: "СтеклоСтройГрупп", description: "Инженерные решения для остекления и светопрозрачных конструкций.", path: slug });
}

export default async function CmsRoute({ params }: RouteProps) {
  const slug = toSlug((await params).cmsSlug);
  if (slug === "/__cms_preview__/") notFound();
  const page = await getPublishedCmsPage(slug);
  if (!page) notFound();
  return <CmsPublishedPageView page={page} />;
}
