"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { assetPath } from "@/lib/site-utils";

type LensEffect = "overview" | "thermal" | "profile" | "install";

type LensMode = {
  id: string;
  index: string;
  label: string;
  title: string;
  text: string;
  spec: string;
  x: number;
  y: number;
  effect: LensEffect;
};

type ProjectScene = {
  id: string;
  index: string;
  label: string;
  meta: string;
  isCaseStudy?: boolean;
  title: string;
  intro: string;
  image: string;
  alt: string;
  modes: LensMode[];
};

const projectScenes: ProjectScene[] = [
  {
    id: "avenue",
    index: "01",
    label: "ТЦ «Авеню»",
    meta: "МОГИЛЁВ / 8 000 М²",
    isCaseStudy: true,
    title: "Разберите реальный фасад ТЦ «Авеню»",
    intro:
      "Фасад, атриум, витражи и внутренние стеклянные двери — в одном объекте. Наведите линзу на зону, чтобы увидеть, что инженер разбирает до монтажа.",
    image: "/assets/photos/project-avenue.png",
    alt: "ТЦ Авеню с фасадным остеклением в Могилёве",
    modes: [
      {
        id: "avenue-facade",
        index: "01",
        label: "Фасад",
        title: "Фасадная светопрозрачная зона",
        text: "На торговом объекте фасад должен держать масштаб здания, давать естественный свет и оставаться понятным для посетителя с улицы.",
        spec: "ФАСАДНОЕ ОСТЕКЛЕНИЕ",
        x: 44,
        y: 61,
        effect: "overview",
      },
      {
        id: "avenue-atrium",
        index: "02",
        label: "Атриум",
        title: "Атриумное остекление",
        text: "Атриум собирает свет в центре комплекса. Его деления, стекло и последовательность монтажа определяются архитектурой и условиями объекта.",
        spec: "АТРИУМНЫЙ КОНТУР",
        x: 47,
        y: 32,
        effect: "thermal",
      },
      {
        id: "avenue-glazing",
        index: "03",
        label: "Витражи",
        title: "Витражные конструкции",
        text: "Витражи поддерживают общий ритм фасада, но требуют точной стыковки с конструкцией здания и соседними системами.",
        spec: "ВИТРАЖНЫЙ РИТМ",
        x: 77,
        y: 61,
        effect: "profile",
      },
      {
        id: "avenue-interior",
        index: "04",
        label: "Интерьер",
        title: "Внутренние стеклянные двери",
        text: "Внутренние стеклянные элементы были включены в тот же подряд, чтобы фасад и пространства внутри комплекса воспринимались как единая система.",
        spec: "ВНУТРЕННИЕ СИСТЕМЫ",
        x: 62,
        y: 78,
        effect: "install",
      },
    ],
  },
  {
    id: "euromedica",
    index: "02",
    label: "МЦ «Евромедика»",
    meta: "МОГИЛЁВ / МЕДИЦИНСКИЙ ЦЕНТР",
    isCaseStudy: true,
    title: "Разберите стеклянную архитектуру МЦ «Евромедика»",
    intro:
      "Здесь наружный фасад и внутренние перегородки работают вместе: свет, аккуратная геометрия и понятная логика пространства.",
    image: "/assets/photos/project-euromedica.png",
    alt: "Медицинский центр Евромедика с современным остеклением в Могилёве",
    modes: [
      {
        id: "euromedica-facade",
        index: "01",
        label: "Фасад",
        title: "Чистая геометрия фасада",
        text: "Для медицинского центра важны свет, аккуратные стыки и спокойный, ясный образ здания в ежедневной эксплуатации.",
        spec: "ФАСАД И ВИТРАЖИ",
        x: 62,
        y: 43,
        effect: "overview",
      },
      {
        id: "euromedica-light",
        index: "02",
        label: "Свет",
        title: "Свет в медицинском пространстве",
        text: "Светопрозрачные зоны должны поддерживать ощущение порядка и работать с планировкой, не становясь просто декоративной оболочкой.",
        spec: "СВЕТОВАЯ ЛОГИКА",
        x: 84,
        y: 44,
        effect: "thermal",
      },
      {
        id: "euromedica-partitions",
        index: "03",
        label: "Перегородки",
        title: "Внутренние стеклянные перегородки",
        text: "Внутренние системы помогают разделить потоки и сохранить свет внутри центра, поддерживая чистую архитектуру помещений.",
        spec: "ВНУТРЕННЕЕ ЗОНИРОВАНИЕ",
        x: 43,
        y: 57,
        effect: "profile",
      },
      {
        id: "euromedica-system",
        index: "04",
        label: "Система",
        title: "Наружные и внутренние решения",
        text: "Фасад и внутренние стеклянные конструкции рассматриваются как единая система — это упрощает координацию и сохраняет целостность объекта.",
        spec: "ЕДИНЫЙ ПОДРЯД",
        x: 67,
        y: 68,
        effect: "install",
      },
    ],
  },
  {
    id: "arbat",
    index: "03",
    label: "ТЦ «Арбат»",
    meta: "МОГИЛЁВ / 4 500 М²",
    isCaseStudy: true,
    title: "Разберите фасад и витражи ТЦ «Арбат»",
    intro:
      "Реальный торговый объект с фасадом, витражными вставками и внутренними стеклянными зонами. Выберите слой, чтобы увидеть логику решения.",
    image: "/assets/photos/project-arbat.png",
    alt: "ТЦ Арбат с фасадным остеклением и витражными вставками в Могилёве",
    modes: [
      {
        id: "arbat-facade",
        index: "01",
        label: "Фасад",
        title: "Коммерческий фасад",
        text: "Фасадная система формирует современный образ торгового объекта и задаёт масштаб для витражных вставок и входных зон.",
        spec: "ФАСАДНЫЙ КОНТУР",
        x: 39,
        y: 45,
        effect: "overview",
      },
      {
        id: "arbat-glazing",
        index: "02",
        label: "Витражи",
        title: "Витражные вставки",
        text: "Витражи продолжают визуальный язык фасада и помогают собрать объект в цельную композицию без случайных элементов.",
        spec: "ВИТРАЖНЫЕ ВСТАВКИ",
        x: 69,
        y: 42,
        effect: "thermal",
      },
      {
        id: "arbat-interior",
        index: "03",
        label: "Интерьер",
        title: "Внутренние стеклянные элементы",
        text: "Стеклянные зоны внутри объекта поддерживают логичное зонирование и не спорят с фасадом — это один визуальный язык.",
        spec: "ВНУТРЕННИЕ ЗОНЫ",
        x: 61,
        y: 63,
        effect: "profile",
      },
      {
        id: "arbat-coordination",
        index: "04",
        label: "Связка",
        title: "Единая координация по объекту",
        text: "Фасад, витражи и внутренние элементы велись как единый подряд, что помогает удержать архитектурный замысел в реализации.",
        spec: "ЕДИНАЯ КООРДИНАЦИЯ",
        x: 31,
        y: 72,
        effect: "install",
      },
    ],
  },
  {
    id: "public",
    index: "04",
    label: "Общественный объект",
    meta: "ОБЪЕКТ / ФАСАД",
    title: "Разберите остекление общественного здания",
    intro:
      "На понятном медицинском или административном объекте показываем, как светопрозрачные зоны работают вместе с входом и фасадом.",
    image: "/assets/concepts/project-lens-public.webp",
    alt: "Концептуальная демонстрация остекления небольшого общественного здания",
    modes: [
      {
        id: "public-entrance",
        index: "01",
        label: "Вход",
        title: "Прозрачная входная группа",
        text: "Навес, двери и боковые стеклянные поля собираются в ясный вход, заметный с улицы и удобный для ежедневного потока людей.",
        spec: "ВХОДНОЙ КОНТУР",
        x: 40,
        y: 62,
        effect: "overview",
      },
      {
        id: "public-light",
        index: "02",
        label: "Свет",
        title: "Лестничный витраж",
        text: "Высокая стеклянная зона даёт естественный свет внутри, но требует расчёта делений, стекла и температурного режима.",
        spec: "ВЕРТИКАЛЬНОЕ ОСТЕКЛЕНИЕ",
        x: 65,
        y: 38,
        effect: "thermal",
      },
      {
        id: "public-system",
        index: "03",
        label: "Система",
        title: "Стоечно-ригельная сетка",
        text: "Ритм профилей согласуется с архитектурой, размерами стекла и конструкцией здания — это не декоративная раскладка.",
        spec: "ФАСАДНЫЙ ПРОФИЛЬ",
        x: 62,
        y: 54,
        effect: "profile",
      },
      {
        id: "public-install",
        index: "04",
        label: "Монтаж",
        title: "Монтаж фасадной системы",
        text: "Последовательность монтажа, доступ к узлам и защита примыканий планируются до выхода бригады на объект.",
        spec: "УЗЛЫ И ПОСЛЕДОВАТЕЛЬНОСТЬ",
        x: 48,
        y: 69,
        effect: "install",
      },
    ],
  },
];

export function ProjectLens() {
  const [activeSceneId, setActiveSceneId] = useState(projectScenes[0].id);
  const [activeModeId, setActiveModeId] = useState(projectScenes[0].modes[0].id);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const pointerTrackingRef = useRef(false);
  const activeScene = projectScenes.find((scene) => scene.id === activeSceneId) ?? projectScenes[0];
  const activeMode = activeScene.modes.find((mode) => mode.id === activeModeId) ?? activeScene.modes[0];
  const activeLensX = activeMode.x;
  const activeLensY = activeMode.y;

  const moveLens = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const stage = stageRef.current;
    if (!stage) return;
    pointerTrackingRef.current = true;
    const rect = stage.getBoundingClientRect();
    const x = Math.min(92, Math.max(8, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(88, Math.max(12, ((event.clientY - rect.top) / rect.height) * 100));
    const activationRadius = Math.min(rect.width, rect.height) * 0.16;
    const distances = activeScene.modes.map((mode) => ({
      mode,
      distance: Math.hypot(
        event.clientX - (rect.left + (mode.x / 100) * rect.width),
        event.clientY - (rect.top + (mode.y / 100) * rect.height)
      ),
    }));
    const nearest = distances.reduce((best, candidate) =>
      candidate.distance < best.distance ? candidate : best
    );
    const currentDistance = distances.find(({ mode }) => mode.id === activeMode.id)?.distance ?? Infinity;

    if (
      nearest.mode.id !== activeMode.id &&
      nearest.distance <= activationRadius &&
      nearest.distance + 14 < currentDistance
    ) {
      setActiveModeId(nearest.mode.id);
    }

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      stage.style.setProperty("--lens-x", `${x}%`);
      stage.style.setProperty("--lens-y", `${y}%`);
    });
  };

  const resetLens = () => {
    pointerTrackingRef.current = false;
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty("--lens-x", `${activeLensX}%`);
    stage.style.setProperty("--lens-y", `${activeLensY}%`);
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!pointerTrackingRef.current) {
      stage?.style.setProperty("--lens-x", `${activeLensX}%`);
      stage?.style.setProperty("--lens-y", `${activeLensY}%`);
    }
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [activeLensX, activeLensY]);

  const selectScene = (scene: ProjectScene) => {
    setActiveSceneId(scene.id);
    setActiveModeId(scene.modes[0].id);
  };

  return (
    <section className="project-lens-section" id="project-lens">
      <div className="container project-lens-heading reveal">
        <div>
          <p className="optical-label">ИНТЕРАКТИВНАЯ ДЕМОНСТРАЦИЯ</p>
          <h2>{activeScene.title}</h2>
        </div>
        <p>{activeScene.intro}</p>
      </div>

      <div className="container project-lens-scenes reveal" role="tablist" aria-label="Тип объекта">
        {projectScenes.map((scene) => (
          <button
            key={scene.id}
            id={`project-scene-tab-${scene.id}`}
            type="button"
            role="tab"
            aria-selected={activeScene.id === scene.id}
            aria-controls="project-lens-explorer"
            className={activeScene.id === scene.id ? "is-active" : ""}
            onClick={() => selectScene(scene)}
            data-analytics-event="project_lens_scene_select"
            data-analytics-label={scene.id}
          >
            <span>{scene.index}</span>
            {scene.label}
          </button>
        ))}
      </div>

      <div
        className="container project-lens-shell reveal reveal-delay"
        id="project-lens-explorer"
        role="tabpanel"
        aria-labelledby={`project-scene-tab-${activeScene.id}`}
      >
        <div
          ref={stageRef}
          className={`project-lens-stage is-${activeMode.effect}`}
          onPointerMove={moveLens}
          onPointerLeave={resetLens}
        >
          <Image
            key={activeScene.image}
            className="project-lens-image"
            src={assetPath(activeScene.image)}
            alt={activeScene.alt}
            fill
            sizes="(max-width: 900px) 100vw, 72vw"
          />
          <span className="project-lens-shade" aria-hidden="true" />
          <span className="project-lens-grid" aria-hidden="true" />

          <div className="project-lens-meta" aria-hidden="true">
            <span>{activeScene.isCaseStudy ? "РЕАЛЬНЫЙ ОБЪЕКТ" : "КОНЦЕПТУАЛЬНАЯ СЦЕНА"}</span>
            <span>{activeScene.meta}</span>
          </div>

          {activeScene.modes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`project-lens-hotspot ${activeMode.id === mode.id ? "is-active" : ""}`}
              style={{ left: `${mode.x}%`, top: `${mode.y}%` }}
              aria-label={`${mode.index}. ${mode.title}`}
              aria-pressed={activeMode.id === mode.id}
              onClick={() => setActiveModeId(mode.id)}
              data-analytics-event="project_lens_node_select"
              data-analytics-label={mode.id}
            >
              <span>{mode.index}</span>
            </button>
          ))}

          <div
            className="project-lens-optic"
            style={{ backgroundImage: `url(${assetPath(activeScene.image)})` }}
            aria-hidden="true"
          >
            <span className="project-lens-optic-scan" />
            <span className="project-lens-optic-crosshair" />
            <small>{activeMode.spec}</small>
          </div>
        </div>

        <aside className="project-lens-panel" aria-label="Режимы исследования объекта">
          <div className="project-lens-tabs" role="tablist" aria-label="Слои проекта">
            {activeScene.modes.map((mode) => (
              <button
                key={mode.id}
                id={`project-lens-tab-${activeScene.id}-${mode.id}`}
                type="button"
                role="tab"
                aria-selected={activeMode.id === mode.id}
                aria-controls={`project-lens-detail-${activeScene.id}`}
                className={activeMode.id === mode.id ? "is-active" : ""}
                onClick={() => setActiveModeId(mode.id)}
                data-analytics-event="project_lens_layer_select"
                data-analytics-label={mode.id}
              >
                <span>{mode.index}</span>
                {mode.label}
              </button>
            ))}
          </div>

          <div
            key={`${activeScene.id}-${activeMode.id}`}
            className="project-lens-detail"
            id={`project-lens-detail-${activeScene.id}`}
            role="tabpanel"
            aria-labelledby={`project-lens-tab-${activeScene.id}-${activeMode.id}`}
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

          <Link className="button button-primary project-lens-cta" href="/raschet/" data-analytics-event="project_lens_engineer_review">
            Разобрать мой объект <ArrowUpRight size={18} weight="thin" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </section>
  );
}
