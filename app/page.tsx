import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { buildPublishedCmsMetadata, getPublishedCmsPage } from "@/lib/cms-published";

const fallback = { title: "Фасады, окна и остекление под ключ", description: "Производство и монтаж окон ПВХ, алюминиевых дверей, фасадных систем, витражей и панорамного остекления по всей Беларуси.", path: "/" };

export async function generateMetadata(): Promise<Metadata> {
  return buildPublishedCmsMetadata(await getPublishedCmsPage("/"), fallback);
}

export default async function Page() {
  return <HomePage cmsPage={await getPublishedCmsPage("/")} />;
}
