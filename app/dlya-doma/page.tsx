import type { Metadata } from "next";
import { AudiencePage } from "@/components/audience-page";
import { buildPublishedCmsMetadata, getPublishedCmsPage } from "@/lib/cms-published";

const fallback = { title: "Остекление для дома", description: "Окна, панорамные двери, террасы и зимние сады для частных домов и квартир по всей Беларуси.", path: "/dlya-doma/" };
export async function generateMetadata(): Promise<Metadata> { return buildPublishedCmsMetadata(await getPublishedCmsPage("/dlya-doma/"), fallback); }
export default function ForHomePage() { return <AudiencePage kind="home" />; }
