"use client";

import { useState } from "react";

const layers = [
  { id: "glass", index: "01", title: "Стекло", text: "Прозрачный слой, который работает со светом, обзором и защитой пространства." },
  { id: "spacer", index: "02", title: "Дистанционная рамка", text: "Точный контур, который держит геометрию стеклопакета между плоскостями стекла." },
  { id: "seal", index: "03", title: "Герметизация", text: "Защитный слой по периметру, сохраняющий целостность конструкции." },
  { id: "profile", index: "04", title: "Тёплый профиль", text: "Профильный узел подбирается под сценарий объекта и конструктивную задачу." },
  { id: "system", index: "05", title: "Алюминиевая система", text: "Несущий контур, который связывает стекло, узел и архитектуру фасада." },
] as const;

export function GlassAnatomy() {
  const [active, setActive] = useState<(typeof layers)[number]["id"]>("glass");
  const activeLayer = layers.find((layer) => layer.id === active) ?? layers[0];

  return (
    <section className="glass-anatomy" id="glass-anatomy">
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
          <div className={`glass-cutaway is-${active}`}>
            <i className="glass-pane glass-pane-back" />
            <i className="glass-pane glass-pane-front" />
            <i className="glass-spacer" />
            <i className="glass-seal" />
            <i className="glass-profile" />
            <i className="glass-system" />
            <i className="glass-glint" />
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
