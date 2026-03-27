import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePage } from "@/components/service-page";
import { getServiceBySlug, SERVICE_PAGES } from "@/lib/site-data";

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

  return {
    title: `${service.title} | СтеклоСтройГрупп`,
    description: service.lead,
    openGraph: {
      title: `${service.title} | СтеклоСтройГрупп`,
      description: service.lead,
      type: "website",
      locale: "ru_BY",
    },
  };
}

export default async function ServiceRoutePage({ params }: ServiceRouteProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return <ServicePage service={service} />;
}
