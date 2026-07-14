import type { Metadata } from "next";
import { QuotePage } from "@/components/quote-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({ title: "Рассчитать проект", description: "Подготовьте исходные данные для расчёта остекления, фасада, окон или алюминиевых конструкций.", path: "/raschet/" });
export default function QuoteRoutePage() { return <QuotePage />; }
