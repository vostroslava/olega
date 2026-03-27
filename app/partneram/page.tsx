import type { Metadata } from "next";
import { PartnersPage } from "@/components/partners-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Партнёрам",
  description:
    "Партнёрская программа СтеклоСтройГрупп для застройщиков, дилеров, архитекторов и подрядчиков.",
  path: "/partneram/",
});

export default function PartnersPageRoute() {
  return <PartnersPage />;
}
