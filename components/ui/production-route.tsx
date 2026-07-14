"use client";

import { useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";

const route = [
  { step: "01", title: "Замер", text: "Фиксируем геометрию проёмов и условия будущего монтажа." },
  { step: "02", title: "Проектирование", text: "Собираем систему, узлы и конструктивную логику объекта." },
  { step: "03", title: "Изготовление", text: "Передаём точную задачу в собственный производственный контур." },
  { step: "04", title: "Монтаж", text: "Собираем конструкцию на объекте и проверяем финальную геометрию." },
] as const;

export function ProductionRoute() {
  const [active, setActive] = useState(0);
  const item = route[active];

  return (
    <section className="production-route" id="production-route" aria-label="Маршрут проекта">
      <div className="production-route-track" aria-hidden="true"><span style={{ width: `${((active + 1) / route.length) * 100}%` }} /></div>
      <div className="production-route-tabs">
        {route.map((entry, index) => (
          <button key={entry.step} type="button" className={active === index ? "is-active" : ""} onClick={() => setActive(index)} onMouseEnter={() => setActive(index)}>
            <span>{entry.step}</span>{entry.title}
          </button>
        ))}
      </div>
      <div className="production-route-detail">
        <span>{item.step}</span>
        <div><h3>{item.title}</h3><p>{item.text}</p></div>
        <ArrowUpRight size={26} weight="thin" aria-hidden="true" />
      </div>
    </section>
  );
}
