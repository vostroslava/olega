import type { Metadata } from "next";
import { ContactsPage } from "@/components/contacts-page";
import { buildPublishedCmsMetadata, getPublishedCmsPage } from "@/lib/cms-published";

const fallback = { title: "Контакты", description: "Контакты, адрес, реквизиты и форма заявки СтеклоСтройГрупп. Производство и монтаж светопрозрачных конструкций по Могилёву и всей Беларуси.", path: "/kontakty/" };
export async function generateMetadata(): Promise<Metadata> { return buildPublishedCmsMetadata(await getPublishedCmsPage("/kontakty/"), fallback); }

export default function ContactsRoutePage() {
  return <ContactsPage />;
}
