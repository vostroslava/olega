import type { Metadata } from "next";
import { ProductionPage } from "@/components/production-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({ title: "Производство", description: "Собственное производство окон, фасадов и алюминиевых систем СтеклоСтройГрупп.", path: "/proizvodstvo/" });
export default function ProductionRoutePage() { return <ProductionPage />; }
