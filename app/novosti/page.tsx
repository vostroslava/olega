import type { Metadata } from "next";
import { NewsPage } from "@/components/news-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Новости и материалы",
    description:
      "Новости производства СтеклоСтройГрупп, новые системы, реализованные объекты и материалы по выбору и эксплуатации конструкций.",
    path: "/novosti/",
  }),
  robots: { index: false, follow: true },
};

export default function NewsPageRoute() {
  return <NewsPage />;
}
