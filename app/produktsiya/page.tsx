import type { Metadata } from "next";
import { ProductsCatalogPage } from "@/components/services-catalog-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Продукция",
  description:
    "Продукция СтеклоСтройГрупп: окна и двери ПВХ, алюминиевые системы, фасады, витражи, панорамное остекление, перегородки и зимние сады.",
  path: "/produktsiya/",
});

export default function ProductsPageRoute() {
  return <ProductsCatalogPage />;
}
