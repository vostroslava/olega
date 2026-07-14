import type { Metadata } from "next";
import { AudiencePage } from "@/components/audience-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({ title: "Остекление для дома", description: "Окна, панорамные двери, террасы и зимние сады для частных домов и квартир по всей Беларуси.", path: "/dlya-doma/" });
export default function ForHomePage() { return <AudiencePage kind="home" />; }
