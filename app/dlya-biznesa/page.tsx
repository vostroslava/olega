import type { Metadata } from "next";
import { AudiencePage } from "@/components/audience-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({ title: "Остекление для бизнеса", description: "Фасады, витражи, входные группы и алюминиевые системы для коммерческих объектов по всей Беларуси.", path: "/dlya-biznesa/" });
export default function ForBusinessPage() { return <AudiencePage kind="business" />; }
