"use client";

import Image from "next/image";
import { useState } from "react";
import { assetPath } from "@/lib/site-utils";

const layers = [
  { id: "glass", index: "01", title: "Стекло", text: "Прозрачный слой, который работает со светом, обзором и защитой пространства." },
  { id: "spacer", index: "02", title: "Дистанционная рамка", text: "Точный разделитель, который держит геометрию стеклопакета между плоскостями стекла." },
  { id: "seal", index: "03", title: "Герметизация", text: "Защитный слой по периметру, сохраняющий целостность конструкции." },
  { id: "profile", index: "04", title: "Тёплый профиль", text: "Профильный узел подбирается под сценарий объекта и конструктивную задачу." },
  { id: "system", index: "05", title: "Алюминиевая система", text: "Несущая система, которая связывает стекло, узел и архитектуру фасада." },
] as const;

export function GlassAnatomy() {
  const [active, setActive] = useState<(typeof layers)[number]["id"]>("glass");
  const activeLayer = layers.find((layer) => layer.id === active) ?? layers[0];

  return (
    <section className="glass-anatomy" id="glass-anatomy">
      <div className="glass-anatomy-facade" aria-hidden="true">
        <Image src={assetPath("/assets/photos/project-avenue.png")} alt="" fill sizes="100vw" />
      </div>
      <div className="container glass-anatomy-grid">
        <div className="glass-anatomy-copy reveal">
          <p className="optical-label">КОНСТРУКТИВНЫЙ СРЕЗ</p>
          <h2>Стекло — инженерная система</h2>
          <p>Качество светопрозрачной конструкции рождается не в одном материале, а в точной работе всех слоёв.</p>
          <div className="glass-anatomy-active" aria-live="polite">
            <span>{activeLayer.index}</span>
            <div><strong>{activeLayer.title}</strong><p>{activeLayer.text}</p></div>
          </div>
        </div>

        <div className="glass-anatomy-model reveal reveal-delay" aria-label="Интерактивный срез стеклопакета">
          <div className={`glass-cutaway-render is-${active}`}>
            <Image
              src={assetPath("/assets/visuals/glass-cutaway-dark.png")}
              alt="Технический срез стеклопакета и алюминиевой фасадной системы"
              fill
              sizes="(max-width: 860px) 92vw, 40vw"
              quality={92}
            />
            <span className={`glass-cutaway-focus glass-cutaway-focus-${active}`} aria-hidden="true" />
          </div>
        </div>

        <ol className="glass-anatomy-list reveal reveal-delay-2">
          {layers.map((layer) => (
            <li key={layer.id}>
              <button
                type="button"
                className={active === layer.id ? "is-active" : ""}
                onFocus={() => setActive(layer.id)}
                onMouseEnter={() => setActive(layer.id)}
                onClick={() => setActive(layer.id)}
              >
                <span>{layer.index}</span><strong>{layer.title}</strong>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
