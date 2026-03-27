import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectPage } from "@/components/project-page";
import { getProjectBySlug, PROJECTS } from "@/lib/site-data";
import { buildPageMetadata } from "@/lib/seo";

type ProjectRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return PROJECTS.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: ProjectRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {};
  }

  return buildPageMetadata({
    title: `${project.title} | Проект`,
    description: project.text,
    path: `/proekty/${project.slug}/`,
  });
}

export default async function ProjectRoutePage({ params }: ProjectRouteProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return <ProjectPage project={project} />;
}
