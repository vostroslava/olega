import type { Metadata } from "next";
import { AboutPage } from "@/components/about-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "О компании",
  description:
    "СтеклоСтройГрупп — производство, проектирование и монтаж светопрозрачных конструкций по всей Беларуси.",
  path: "/o-kompanii/",
});

export default function AboutPageRoute() {
  return <AboutPage />;
}
