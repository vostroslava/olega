import type { Metadata } from "next";
import { ProjectsPage } from "@/components/projects-page";
import { buildPublishedCmsMetadata, getPublishedCmsPage } from "@/lib/cms-published";

const fallback = { title: "Проекты", description: "Реализованные объекты СтеклоСтройГрупп: фасады, витражи, алюминиевые системы и стеклянные конструкции для коммерческих и медицинских объектов.", path: "/proekty/" };
export async function generateMetadata(): Promise<Metadata> { return buildPublishedCmsMetadata(await getPublishedCmsPage("/proekty/"), fallback); }

export default function ProjectsRoutePage() {
  return <ProjectsPage />;
}
