import type { Metadata } from "next";
import { PrivacyPage } from "@/components/privacy-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Политика конфиденциальности",
  description:
    "Политика конфиденциальности и обработки персональных данных для обращений через сайт СтеклоСтройГрупп.",
  path: "/politika-konfidentsialnosti/",
});

export default function PrivacyPageRoute() {
  return <PrivacyPage />;
}

