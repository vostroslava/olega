"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { PROJECTS } from "@/lib/site-data";
import { assetPath } from "@/lib/site-utils";

const filters = [
  ["all", "Все объекты"],
  ["retail", "Торговые"],
  ["medical", "Медицинские"],
  ["commercial", "Коммерческие"],
] as const;

export function ProjectGallery() {
  const [filter, setFilter] = useState<(typeof filters)[number][0]>("all");
  const projects = useMemo(() => filter === "all" ? PROJECTS : PROJECTS.filter((project) => project.category === filter), [filter]);

  return (
    <>
      <div className="project-filter" role="group" aria-label="Фильтр проектов">
        {filters.map(([value, label]) => <button className={filter === value ? "is-active" : ""} type="button" onClick={() => setFilter(value)} key={value}>{label}</button>)}
      </div>
      <div className="project-gallery-list">
        {projects.map((project, index) => (
          <Link className="project-gallery-row reveal is-visible" href={`/proekty/${project.slug}/`} key={project.id}>
            <span className="project-gallery-index">{String(index + 1).padStart(2, "0")}</span>
            <div className="project-gallery-media"><Image src={assetPath(project.image)} alt={project.alt} fill sizes="(max-width: 860px) 100vw, 62vw" /></div>
            <div className="project-gallery-copy">
              <small>{project.location} · {project.note}</small>
              <h2>{project.title}</h2>
              <p>{project.text}</p>
              <span>{project.relatedServiceLabel} · {project.area}</span>
            </div>
            <ArrowUpRight size={34} weight="thin" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </>
  );
}
