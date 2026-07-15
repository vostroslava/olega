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
  title: string;
  intro: string;
  image: string;
  alt: string;
  modes: LensMode[];
};

const projectScenes: ProjectScene[] = [
  {
    id: "house",
    index: "01",
    label: "Частный дом",
    meta: "ДОМ / ОСТЕКЛЕНИЕ",
    title: "Исследуйте остекление обычного дома",
    intro:
      "Двигайте оптическую линзу по объекту или выбирайте зоны. Показываем, какие решения инженер разбирает до расчёта и монтажа.",
    image: "/assets/concepts/project-lens-house.webp",
    alt: "Концептуальная демонстрация остекления обычного частного дома",
    modes: [
      {
        id: "living-window",
        index: "01",
        label: "Объект",
        title: "Панорамное окно гостиной",
        text: "Большая световая зона связывает интерьер с участком. Размер, деление и способ открывания подбираются под архитектуру и реальную эксплуатацию дома.",
        spec: "СВЕТОВОЙ КОНТУР",
        x: 44,
        y: 61,
        effect: "overview",
      },
      {
        id: "warm-window",
        index: "02",
        label: "Тепло",
        title: "Тёплый контур окна",
        text: "Показываем принцип работы стеклопакета, профиля и примыканий без выдуманной формулы. Финальный состав рассчитывается после размеров и условий объекта.",
        spec: "ТИПОВОЙ ПРИНЦИП",
        x: 47,
        y: 32,
        effect: "thermal",
      },
      {
        id: "terrace-door",
        index: "03",
        label: "Профиль",
        title: "Выход на террасу",
        text: "Дверной узел должен сочетать удобный проход, жёсткость конструкции и корректное примыкание к полу и навесу.",
        spec: "ДВЕРНОЙ УЗЕЛ",
        x: 77,
        y: 61,
        effect: "profile",
      },
      {
        id: "house-install",
        index: "04",
        label: "Монтаж",
        title: "Монтажный контур",
        text: "Качество определяется не только окном. Важны подготовка проёма, крепление, герметизация и защита монтажного шва по всему периметру.",
        spec: "ПРИМЫКАНИЕ К ПРОЁМУ",
        x: 62,
        y: 78,
        effect: "install",
      },
    ],
  },
  {
    id: "apartment",
    index: "02",
    label: "Квартира",
    meta: "КВАРТИРА / ЛОДЖИЯ",
    title: "Разберите остекление городской квартиры",
    intro:
      "На привычном интерьере показываем не декор, а то, что влияет на тепло, тишину, удобство открывания и аккуратность отделки.",
    image: "/assets/concepts/project-lens-apartment.webp",
    alt: "Концептуальная демонстрация окна и балконной двери в городской квартире",
    modes: [
      {
        id: "apartment-window",
        index: "01",
        label: "Окно",
        title: "Основное окно комнаты",
        text: "Конфигурация створок должна давать достаточно света, удобное проветривание и доступ для ухода без лишних импостов.",
        spec: "СВЕТОВОЙ ПРОЁМ",
        x: 62,
        y: 43,
        effect: "overview",
      },
      {
        id: "apartment-comfort",
        index: "02",
        label: "Комфорт",
        title: "Тепло и тишина",
        text: "Стеклопакет и профиль подбираются по этажу, ориентации окон, шуму с улицы и реальному температурному режиму комнаты.",
        spec: "СТЕКЛОПАКЕТ И ПРОФИЛЬ",
        x: 84,
        y: 44,
        effect: "thermal",
      },
      {
        id: "balcony-door",
        index: "03",
        label: "Дверь",
        title: "Балконная дверь",
        text: "Проверяем ширину прохода, расположение ручки, работу створки рядом со шторами и герметичность нижней части блока.",
        spec: "БАЛКОННЫЙ БЛОК",
        x: 43,
        y: 57,
        effect: "profile",
      },
      {
        id: "apartment-install",
        index: "04",
        label: "Монтаж",
        title: "Подоконный узел",
        text: "Подоконник, откосы и примыкание к радиатору проектируются как единый узел, чтобы сохранить конвекцию и чистую отделку.",
        spec: "ОТКОСЫ И ПОДОКОННИК",
        x: 67,
        y: 68,
        effect: "install",
      },
    ],
  },
  {
    id: "storefront",
    index: "03",
    label: "Небольшая витрина",
    meta: "БИЗНЕС / ВИТРИНА",
    title: "Исследуйте фасад небольшого бизнеса",
    intro:
      "Витрина должна открывать интерьер, выдерживать ежедневную нагрузку и сохранять аккуратный вид без ощущения тяжёлой конструкции.",
    image: "/assets/concepts/project-lens-storefront.webp",
    alt: "Концептуальная демонстрация витрины небольшого коммерческого помещения",
    modes: [
      {
        id: "storefront-plane",
        index: "01",
        label: "Витрина",
        title: "Прозрачная плоскость фасада",
        text: "Шаг стоек и размеры стекла подбираются так, чтобы фасад оставался визуально лёгким и соответствовал расчётным нагрузкам.",
        spec: "ВИТРАЖНЫЙ КОНТУР",
        x: 39,
        y: 45,
        effect: "overview",
      },
      {
        id: "storefront-glass",
        index: "02",
        label: "Стекло",
        title: "Стеклопакет витрины",
        text: "Учитываем площадь, безопасность, солнечную сторону и требования к микроклимату — без универсального состава для всех объектов.",
        spec: "БЕЗОПАСНОСТЬ И ТЕПЛО",
        x: 69,
        y: 42,
        effect: "thermal",
      },
      {
        id: "storefront-door",
        index: "03",
        label: "Вход",
        title: "Входная группа",
        text: "Дверь должна выдерживать поток посетителей, не конфликтовать с витриной и сохранять удобный, понятный проход.",
        spec: "ДВЕРНОЙ ПРОФИЛЬ",
        x: 61,
        y: 63,
        effect: "profile",
      },
      {
        id: "storefront-install",
        index: "04",
        label: "Монтаж",
        title: "Нижнее примыкание",
        text: "Особое внимание — порогу, отводу воды, сопряжению с тротуаром и защите монтажного шва в зоне ежедневной нагрузки.",
        spec: "ПОРОГ И ГИДРОИЗОЛЯЦИЯ",
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
        title: "Монтаж фасадного контура",
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
            <span>КОНЦЕПТУАЛЬНАЯ СЦЕНА</span>
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

          <Link className="button button-primary project-lens-cta" href="/raschet/">
            Разобрать мой объект <ArrowUpRight size={18} weight="thin" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </section>
  );
}
