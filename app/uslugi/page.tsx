import type { Metadata } from "next";
import { OperationsPage } from "@/components/operations-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Услуги",
  description:
    "Услуги СтеклоСтройГрупп: замер, проектирование, производство, доставка, монтаж, герметизация и сервисное обслуживание конструкций.",
  path: "/uslugi/",
});

export default function ServicesPageRoute() {
  return <OperationsPage />;
}
