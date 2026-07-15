"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { assetPath } from "@/lib/site-utils";

const sceneImage = "/assets/concepts/project-lens-house.webp";

const lensModes = [
  {
    id: "overview",
    index: "01",
    label: "Объект",
    title: "Панорамное окно гостиной",
    text: "Большая световая зона связывает интерьер с участком. Размер, деление и способ открывания подбираются под архитектуру и реальную эксплуатацию дома.",
    spec: "СВЕТОВОЙ КОНТУР",
    x: 44,
    y: 61,
  },
  {
    id: "thermal",
    index: "02",
    label: "Тепло",
    title: "Тёплый контур окна",
    text: "Показываем принцип работы стеклопакета, профиля и примыканий без выдуманной формулы. Финальный состав рассчитывается после размеров и условий объекта.",
    spec: "ТИПОВОЙ ПРИНЦИП",
    x: 47,
    y: 32,
  },
  {
    id: "profile",
    index: "03",
    label: "Профиль",
    title: "Выход на террасу",
    text: "Дверной узел должен сочетать удобный проход, жёсткость конструкции и корректное примыкание к полу и навесу.",
    spec: "ДВЕРНОЙ УЗЕЛ",
    x: 77,
    y: 61,
  },
  {
    id: "install",
    index: "04",
    label: "Монтаж",
    title: "Монтажный контур",
    text: "Качество определяется не только окном. Важны подготовка проёма, крепление, герметизация и защита монтажного шва по всему периметру.",
    spec: "ПРИМЫКАНИЕ К ПРОЁМУ",
    x: 62,
    y: 78,
  },
] as const;

type LensMode = (typeof lensModes)[number];
type LensModeId = LensMode["id"];
type LensStageStyle = CSSProperties & {
  "--lens-x": string;
  "--lens-y": string;
};

export function ProjectLens() {
  const [activeId, setActiveId] = useState<LensModeId>("overview");
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const activeMode = lensModes.find((item) => item.id === activeId) ?? lensModes[0];

  const moveLens = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const x = Math.min(92, Math.max(8, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(88, Math.max(12, ((event.clientY - rect.top) / rect.height) * 100));

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      stage.style.setProperty("--lens-x", `${x}%`);
      stage.style.setProperty("--lens-y", `${y}%`);
    });
  }, []);

  const resetLens = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty("--lens-x", `${activeMode.x}%`);
    stage.style.setProperty("--lens-y", `${activeMode.y}%`);
  }, [activeMode.x, activeMode.y]);

  useEffect(() => {
    resetLens();
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [resetLens]);

  const selectMode = (id: LensModeId) => setActiveId(id);
  const stageStyle: LensStageStyle = {
    "--lens-x": `${activeMode.x}%`,
    "--lens-y": `${activeMode.y}%`,
  };

  return (
    <section className="project-lens-section" id="project-lens">
      <div className="container project-lens-heading reveal">
        <div>
          <p className="optical-label">ИНТЕРАКТИВНАЯ ДЕМОНСТРАЦИЯ</p>
          <h2>Исследуйте остекление обычного дома</h2>
        </div>
        <p>
          Двигайте оптическую линзу по объекту или выбирайте зоны. Показываем, какие решения инженер
          разбирает до расчёта и монтажа.
        </p>
      </div>

      <div className="container project-lens-shell reveal reveal-delay">
        <div
          ref={stageRef}
          className={`project-lens-stage is-${activeMode.id}`}
          style={stageStyle}
          onPointerMove={moveLens}
          onPointerLeave={resetLens}
        >
          <Image
            className="project-lens-image"
            src={assetPath(sceneImage)}
            alt="Концептуальная демонстрация остекления обычного частного дома"
            fill
            sizes="(max-width: 900px) 100vw, 72vw"
            priority={false}
          />
          <span className="project-lens-shade" aria-hidden="true" />
          <span className="project-lens-grid" aria-hidden="true" />

          <div className="project-lens-meta" aria-hidden="true">
            <span>КОНЦЕПТУАЛЬНАЯ СЦЕНА</span>
            <span>ДВИГАЙТЕ ЛИНЗУ</span>
          </div>

          {lensModes.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`project-lens-hotspot ${activeId === item.id ? "is-active" : ""}`}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              aria-label={`${item.index}. ${item.title}`}
              aria-pressed={activeId === item.id}
              onClick={() => selectMode(item.id)}
            >
              <span>{item.index}</span>
            </button>
          ))}

          <div
            className="project-lens-optic"
            style={{ backgroundImage: `url(${assetPath(sceneImage)})` }}
            aria-hidden="true"
          >
            <span className="project-lens-optic-scan" />
            <span className="project-lens-optic-crosshair" />
            <small>{activeMode.spec}</small>
          </div>
        </div>

        <aside className="project-lens-panel" aria-label="Режимы исследования объекта">
          <div className="project-lens-tabs" role="tablist" aria-label="Слои проекта">
            {lensModes.map((item) => (
              <button
                key={item.id}
                id={`project-lens-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={activeId === item.id}
                aria-controls="project-lens-detail"
                className={activeId === item.id ? "is-active" : ""}
                onClick={() => selectMode(item.id)}
              >
                <span>{item.index}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div
            className="project-lens-detail"
            id="project-lens-detail"
            role="tabpanel"
            aria-labelledby={`project-lens-tab-${activeMode.id}`}
            aria-live="polite"
          >
            <span className="project-lens-detail-index">{activeMode.index}</span>
            <p className="optical-label">{activeMode.spec}</p>
            <h3>{activeMode.title}</h3>
            <p>{activeMode.text}</p>
          </div>

          <div className="project-lens-disclaimer">
            <span>Важно</span>
            <p>Это демонстрация принципа. Система и узлы подбираются после изучения вашего объекта.</p>
          </div>

          <Link className="button button-primary project-lens-cta" href="/raschet/">
            Разобрать мой объект <ArrowUpRight size={18} weight="thin" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </section>
  );
}
