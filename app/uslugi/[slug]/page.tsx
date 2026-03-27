import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePage } from "@/components/service-page";
import { getServiceBySlug, SERVICE_PAGES } from "@/lib/site-data";
import { buildPageMetadata } from "@/lib/seo";

type ServiceRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return SERVICE_PAGES.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: ServiceRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return {};
  }

  return buildPageMetadata({
    title: service.title,
    description: service.lead,
    path: `/uslugi/${service.slug}/`,
  });
}

export default async function ServiceRoutePage({ params }: ServiceRouteProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return <ServicePage service={service} />;
}
