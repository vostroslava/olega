import type { Metadata } from "next";
import { ContactsPage } from "@/components/contacts-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Контакты",
  description:
    "Контакты, адрес, реквизиты и форма заявки СтеклоСтройГрупп. Производство и монтаж светопрозрачных конструкций по Могилёву и всей Беларуси.",
  path: "/kontakty/",
});

export default function ContactsRoutePage() {
  return <ContactsPage />;
}
