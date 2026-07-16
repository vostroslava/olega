import type { Metadata } from "next";
import { ProductionPage } from "@/components/production-page";
import { buildPublishedCmsMetadata, getPublishedCmsPage } from "@/lib/cms-published";

const fallback = { title: "Производство", description: "Собственное производство окон, фасадов и алюминиевых систем СтеклоСтройГрупп.", path: "/proizvodstvo/" };
export async function generateMetadata(): Promise<Metadata> { return buildPublishedCmsMetadata(await getPublishedCmsPage("/proizvodstvo/"), fallback); }
export default function ProductionRoutePage() { return <ProductionPage />; }
