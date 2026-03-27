import type { Metadata } from "next";
import { ServicesCatalogPage } from "@/components/services-catalog-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Услуги",
  description:
    "Все направления СтеклоСтройГрупп: окна ПВХ, алюминиевые системы, фасады, витражи, панорамное остекление, перегородки и зимние сады.",
  path: "/uslugi/",
});

export default function ServicesPageRoute() {
  return <ServicesCatalogPage />;
}
