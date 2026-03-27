import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Фасады, окна и остекление под ключ",
  description:
    "Производство и монтаж окон ПВХ, алюминиевых дверей, фасадных систем, витражей и панорамного остекления по всей Беларуси.",
  path: "/",
});

export default function Page() {
  return <HomePage />;
}
