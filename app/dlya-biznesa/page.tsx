import type { Metadata } from "next";
import { AudiencePage } from "@/components/audience-page";
import { buildPublishedCmsMetadata, getPublishedCmsPage } from "@/lib/cms-published";

const fallback = { title: "Остекление для бизнеса", description: "Фасады, витражи, входные группы и алюминиевые системы для коммерческих объектов по всей Беларуси.", path: "/dlya-biznesa/" };
export async function generateMetadata(): Promise<Metadata> { return buildPublishedCmsMetadata(await getPublishedCmsPage("/dlya-biznesa/"), fallback); }
export default function ForBusinessPage() { return <AudiencePage kind="business" />; }
