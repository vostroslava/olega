import type { Metadata } from "next";
import { ProjectsPage } from "@/components/projects-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Проекты",
  description:
    "Реализованные объекты СтеклоСтройГрупп: фасады, витражи, алюминиевые системы и стеклянные конструкции для коммерческих и медицинских объектов.",
  path: "/proekty/",
});

export default function ProjectsRoutePage() {
  return <ProjectsPage />;
}
