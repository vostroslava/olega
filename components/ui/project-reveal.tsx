"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { assetPath } from "@/lib/site-utils";

export function ProjectReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [reveal, setReveal] = useState(44);

  const move = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setReveal(Math.min(93, Math.max(7, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <section className="project-reveal reveal is-visible" id="project-reveal" aria-label="Концептуальная схема и реализация объекта">
      <div className="project-reveal-copy">
        <p className="optical-label">КОНТУР → РЕАЛИЗАЦИЯ</p>
        <h3>Линия проекта становится фасадом</h3>
        <p>Проведите по изображению: слева — концептуальная схема, справа — реальный объект ТЦ «Авеню».</p>
      </div>
      <div
        ref={ref}
        className="project-reveal-media"
        onPointerMove={(event) => move(event.clientX)}
        onPointerDown={(event) => move(event.clientX)}
      >
        <Image src={assetPath("/assets/photos/project-avenue.png")} alt="ТЦ Авеню — реализованный объект" fill sizes="(max-width: 860px) 100vw, 68vw" />
        <div className="project-reveal-concept" style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }} aria-hidden="true">
          <Image src={assetPath("/assets/case-avenue.svg")} alt="" fill sizes="(max-width: 860px) 100vw, 68vw" />
        </div>
        <span className="project-reveal-line" style={{ left: `${reveal}%` }} aria-hidden="true"><i /></span>
        <span className="project-reveal-label project-reveal-label-concept">СХЕМА</span>
        <span className="project-reveal-label project-reveal-label-real">РЕАЛЬНЫЙ ОБЪЕКТ</span>
      </div>
    </section>
  );
}
