"use client";

import { useMemo, useState } from "react";
import {
  ESTIMATE_OBJECT_TYPES,
  ESTIMATE_PROFILES,
  EstimateProfile,
} from "@/lib/site-data";
import { assetPath } from "@/lib/site-utils";

const urgencyOptions = [
  { value: "standard", label: "Обычный срок" },
  { value: "urgent", label: "Срочно" },
] as const;

function getProfile(service: string) {
  return (
    ESTIMATE_PROFILES.find((item) => item.service === service) ?? ESTIMATE_PROFILES[0]
  );
}

function getRangeText(profile: EstimateProfile, area: number) {
  if (area <= 35) return profile.smallRange;
  if (area <= 120) return profile.mediumRange;
  return profile.largeRange;
}

export function QuickEstimate() {
  const [service, setService] = useState(ESTIMATE_PROFILES[0].service);
  const [objectType, setObjectType] = useState(ESTIMATE_OBJECT_TYPES[0].value);
  const [urgency, setUrgency] = useState<(typeof urgencyOptions)[number]["value"]>("standard");
  const [area, setArea] = useState(42);

  const profile = useMemo(() => getProfile(service), [service]);
  const estimateText = useMemo(() => getRangeText(profile, area), [area, profile]);
  const responseTime =
    urgency === "urgent" ? profile.responseTime.urgent : profile.responseTime.standard;
  const nextStep =
    objectType === "commercial" ? profile.nextStep.commercial : profile.nextStep.private;

  const requestHref = useMemo(
    () =>
      assetPath(
        `/?product=${encodeURIComponent(service)}&brief=${encodeURIComponent(
          `${area} м² · ${objectType === "commercial" ? "коммерческий объект" : "частный объект"} · ${urgency === "urgent" ? "срочно" : "обычный срок"}`
        )}#request`
      ),
    [area, objectType, service, urgency]
  );

  return (
    <div className="estimate-shell reveal reveal-delay">
      <div className="estimate-controls">
        <div className="estimate-field">
          <span>Направление</span>
          <div className="estimate-chip-group" role="group" aria-label="Направление">
            {ESTIMATE_PROFILES.map((item) => (
              <button
                key={item.service}
                className={`estimate-chip ${service === item.service ? "is-active" : ""}`}
                type="button"
                aria-pressed={service === item.service}
                onClick={() => setService(item.service)}
              >
                {item.service}
              </button>
            ))}
          </div>
        </div>

        <div className="estimate-field">
          <span>Тип объекта</span>
          <div className="estimate-chip-group" role="group" aria-label="Тип объекта">
            {ESTIMATE_OBJECT_TYPES.map((item) => (
              <button
                key={item.value}
                className={`estimate-chip ${objectType === item.value ? "is-active" : ""}`}
                type="button"
                aria-pressed={objectType === item.value}
                onClick={() => setObjectType(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="estimate-field">
          <span>Срочность</span>
          <div className="estimate-chip-group" role="group" aria-label="Срочность">
            {urgencyOptions.map((item) => (
              <button
                key={item.value}
                className={`estimate-chip ${urgency === item.value ? "is-active" : ""}`}
                type="button"
                aria-pressed={urgency === item.value}
                onClick={() => setUrgency(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <label className="estimate-area estimate-field">
          <span>Площадь или масштаб: {area} м²</span>
          <input
            type="range"
            min={10}
            max={250}
            step={5}
            value={area}
            onChange={(event) => setArea(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="estimate-result">
        <p className="card-tag">Предварительный ориентир</p>
        <h3>Что это означает для вашего запроса</h3>
        <p>{profile.description}</p>

        <div className="estimate-result-grid">
          <article>
            <strong>Формат расчёта</strong>
            <p>{estimateText}</p>
          </article>
          <article>
            <strong>Скорость ответа</strong>
            <p>{responseTime}</p>
          </article>
          <article>
            <strong>Следующий шаг</strong>
            <p>{nextStep}</p>
          </article>
        </div>

        <div className="estimate-actions">
          <a className="button button-primary" href={requestHref}>
            Перейти к заявке
          </a>
          <span>Это предварительный ориентир. Точный расчёт подтверждаем после brief и замера.</span>
        </div>
      </div>
    </div>
  );
}
