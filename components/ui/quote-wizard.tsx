"use client";

import Link from "next/link";
import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { FileArrowUp } from "@phosphor-icons/react/dist/csr/FileArrowUp";
import { LockKey } from "@phosphor-icons/react/dist/csr/LockKey";
import { UserCircleCheck } from "@phosphor-icons/react/dist/csr/UserCircleCheck";
import { ArchitecturalIcon } from "@/components/ui/architectural-icons";
import { CONTACTS } from "@/lib/site-data";
import {
  appendAttribution,
  createClientRequestId,
  readApiError,
  siteApiEndpoint,
} from "@/lib/site-api";
import { assetPath } from "@/lib/site-utils";
import { trackEvent } from "@/lib/analytics";

const steps = ["Объект", "Размеры", "Материалы", "Контакты"];
const objectTypes = [
  { value: "Частный дом", icon: "house" as const, detail: "Панорамные окна, двери, террасы", scene: "/assets/visuals/configurator-house.png" },
  { value: "Квартира", icon: "apartment" as const, detail: "Окна, балкон, лоджия, эркер", scene: "/assets/visuals/configurator-apartment.png" },
  { value: "Коммерческий объект", icon: "commercial" as const, detail: "Фасад, витражи, входная группа", scene: "/assets/visuals/configurator-commercial.png" },
  { value: "Другое", icon: "custom" as const, detail: "Нестандартная конструкция или идея", scene: "/assets/visuals/configurator-custom.png" },
];
const materialOptions = ["ПВХ", "Тёплый алюминий", "Холодный алюминий", "Нужна рекомендация"];
const sceneCopy = {
  "Частный дом": ["Панорамное остекление", "Окна, двери и террасы под архитектуру дома."],
  "Квартира": ["Остекление квартиры", "Окна, лоджия или эркер с учётом условий помещения."],
  "Коммерческий объект": ["Фасадное остекление", "Витражи и входная группа для масштаба коммерческого объекта."],
  "Другое": ["Свободная геометрия", "Разберём идею, эскиз или нестандартный конструктивный узел."],
} as const;

export function QuoteWizard({ compact = false }: { compact?: boolean }) {
  const [step, setStep] = useState(0);
  const [stepDirection, setStepDirection] = useState<"forward" | "backward">("forward");
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(() => new Set([0]));
  const [objectType, setObjectType] = useState(objectTypes[0].value);
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState(materialOptions[3]);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const clientRequestId = useRef("");

  const summary = useMemo(
    () => `${objectType}; ${size || "размеры уточнить"}; ${material}${fileName ? `; файл: ${fileName}` : ""}`,
    [fileName, material, objectType, size],
  );
  const activeObject = objectTypes.find((item) => item.value === objectType) ?? objectTypes[0];
  const activeScene = sceneCopy[activeObject.value as keyof typeof sceneCopy];

  useEffect(() => {
    trackEvent("quote_step_view", { step: step + 1, step_name: steps[step] });
  }, [step]);

  const goToStep = (nextStep: number) => {
    if (nextStep === step || nextStep < 0 || nextStep >= steps.length) return;

    setStepDirection(nextStep > step ? "forward" : "backward");
    setVisitedSteps((current) => {
      const next = new Set(current);
      next.add(step);
      next.add(nextStep);
      return next;
    });
    setStep(nextStep);
  };

  const isStepComplete = (index: number) => {
    if (!visitedSteps.has(index)) return false;
    if (index === 0) return Boolean(objectType);
    if (index === 1) return Boolean(size.trim());
    if (index === 2) return Boolean(material);
    return Boolean(name.trim()) && phone.replace(/\D/g, "").length >= 7 && consent;
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAttachment(file ?? null);
    setFileName(file?.name ?? "");
    if (file) {
      trackEvent("quote_file_selected", {
        extension: file.name.split(".").pop()?.toLowerCase() || "unknown",
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const endpoint = siteApiEndpoint("lead");
    setSubmitError("");

    if (!endpoint) {
      setSubmitError(`Сервис заявок ещё не подключён. Напишите нам: ${CONTACTS.primaryEmail}.`);
      return;
    }

    if (!clientRequestId.current) clientRequestId.current = createClientRequestId();
    const payload = new FormData();
    payload.set("clientRequestId", clientRequestId.current);
    payload.set("name", name.trim());
    payload.set("phone", phone.trim());
    payload.set("objectType", objectType);
    payload.set("size", size.trim());
    payload.set("material", material);
    payload.set("message", summary);
    payload.set("consent", consent ? "true" : "false");
    payload.set("company", "");
    payload.set("source", "optical-monolith-wizard");
    payload.set("page", window.location.href);
    payload.set("submittedAt", new Date().toISOString());
    if (attachment) payload.set("attachment", attachment, attachment.name);
    appendAttribution(payload);

    setSubmitting(true);
    try {
      const response = await fetch(endpoint, { method: "POST", body: payload });
      if (!response.ok) throw new Error(await readApiError(response));
      trackEvent("lead_submit", {
        form: "quote_wizard",
        object_type: objectType,
        material,
        has_attachment: Boolean(attachment),
        has_size: Boolean(size.trim()),
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="quote-success" role="status">
        <Check size={50} weight="thin" aria-hidden="true" />
        <p className="optical-label">ЗАЯВКА ПРИНЯТА</p>
        <h3>Проект передан инженеру на предварительный разбор</h3>
        <p>Мы сохранили исходные данные и свяжемся с вами по номеру {phone}.</p>
        <button
          className="button button-secondary button-on-dark"
          type="button"
          onClick={() => {
            clientRequestId.current = "";
            setSubmitted(false);
            setStep(0);
            setName("");
            setPhone("");
            setConsent(false);
            setAttachment(null);
            setFileName("");
          }}
        >
          Рассчитать ещё один проект
        </button>
      </div>
    );
  }

  return (
    <form className={`quote-wizard ${compact ? "quote-wizard-compact" : ""}`} onSubmit={handleSubmit}>
      <div className="quote-progress" aria-label="Этапы расчёта">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            className={[
              index === step ? "is-active" : "",
              visitedSteps.has(index) ? "is-visited" : "",
              index !== step && isStepComplete(index) ? "is-complete" : "",
            ].filter(Boolean).join(" ")}
            onClick={() => goToStep(index)}
            aria-current={index === step ? "step" : undefined}
            aria-label={`${String(index + 1).padStart(2, "0")} ${label}${index === step ? ", текущий этап" : isStepComplete(index) ? ", заполнено" : ""}`}
          >
            <span className="quote-step-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="quote-step-label">{label}</span>
          </button>
        ))}
      </div>

      <div className="quote-stage" data-direction={stepDirection}>
        {step === 0 ? (
          <>
            <div className="quote-fields">
              <h3>Что вы планируете остеклить?</h3>
              <div className="quote-choice-list">
                {objectTypes.map(({ value, icon, detail }) => (
                  <button
                    key={value}
                    type="button"
                    className={objectType === value ? "is-selected" : ""}
                    onClick={() => setObjectType(value)}
                  >
                    <ArchitecturalIcon kind={icon} className="quote-object-icon" />
                    <span><strong>{value}</strong><small>{detail}</small></span>
                    {objectType === value ? <Check size={20} weight="thin" aria-hidden="true" /> : null}
                  </button>
                ))}
              </div>
            </div>
            <div className="quote-scene-panel" aria-live="polite">
              <div className="quote-scene-ruler quote-scene-ruler-top" aria-hidden="true" />
              <div className="quote-scene-object" key={activeObject.icon}>
                <Image
                  src={assetPath(activeObject.scene)}
                  alt={`${objectType} — архитектурная сцена`}
                  fill
                  sizes="(max-width: 860px) 100vw, 42vw"
                  quality={90}
                />
                <span className="quote-scene-measure quote-scene-measure-width" aria-hidden="true">КОНТУР ПРОЕКТА</span>
              </div>
              <p className="optical-label">{activeScene[0]}</p>
              <strong>{objectType}</strong>
              <span>{activeScene[1]}</span>
              <label className="quote-upload">
                <FileArrowUp size={36} weight="thin" aria-hidden="true" />
                <b>{fileName || "Добавьте фото, чертёж или PDF"}</b>
                <small>{fileName ? "Файл выбран" : "Можно добавить на этом шаге"}</small>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.pdf,.dwg,.dxf" onChange={handleFile} />
              </label>
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <div className="quote-single-stage">
            <p className="optical-label">РАЗМЕРЫ И МАСШТАБ</p>
            <h3>Какие размеры или ориентировочный объём работ?</h3>
            <textarea
              value={size}
              onChange={(event) => setSize(event.target.value)}
              placeholder="Например: фасад 12 × 6 м, 8 окон, панорамная дверь на террасу…"
              autoFocus
            />
            <p>Если точных размеров нет — ничего страшного. Инженер уточнит их на замере.</p>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="quote-single-stage">
            <p className="optical-label">МАТЕРИАЛЫ И СИСТЕМЫ</p>
            <h3>Какое решение рассматриваете?</h3>
            <div className="quote-material-grid">
              {materialOptions.map((item) => (
                <button key={item} type="button" className={material === item ? "is-selected" : ""} onClick={() => setMaterial(item)}>
                  <span>{item}</span>
                  {material === item ? <Check size={20} weight="thin" aria-hidden="true" /> : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="quote-single-stage quote-contact-stage">
            <p className="optical-label">КОНТАКТЫ</p>
            <h3>Куда отправить предварительный разбор?</h3>
            <div className="quote-contact-grid">
              <label>
                <span>Ваше имя</span>
                <input value={name} onChange={(event) => setName(event.target.value)} required autoFocus />
              </label>
              <label>
                <span>Телефон</span>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" required placeholder="+375" />
              </label>
            </div>
            <p className="quote-summary">{summary}</p>
            <label className="quote-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                required
              />
              <span>
                Даю согласие на обработку персональных данных в соответствии с{" "}
                <Link href="/politika-konfidentsialnosti/">политикой конфиденциальности</Link>.
              </span>
            </label>
            {submitError ? (
              <p className="quote-submit-error" role="alert">
                {submitError}{" "}
                <a href={`mailto:${CONTACTS.primaryEmail}`}>Написать на почту</a>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="quote-controls">
        <div className="quote-trust-note">
          <span><LockKey size={18} weight="thin" aria-hidden="true" /> Данные защищены</span>
          <span><UserCircleCheck size={18} weight="thin" aria-hidden="true" /> Инженер проверит заявку</span>
        </div>
        <div>
          {step > 0 ? (
            <button className="button button-secondary button-on-dark" type="button" onClick={() => goToStep(step - 1)}>
              <ArrowLeft size={20} weight="thin" aria-hidden="true" /> Назад
            </button>
          ) : compact ? (
            <Link className="button button-secondary button-on-dark" href="/raschet/" data-analytics-event="quote_full_form">Полная форма</Link>
          ) : null}
          {step < steps.length - 1 ? (
            <button className="button button-primary" type="button" onClick={() => goToStep(step + 1)}>
              Продолжить <ArrowRight size={20} weight="thin" aria-hidden="true" />
            </button>
          ) : (
            <button className="button button-primary" type="submit" disabled={submitting}>
              {submitting ? "Отправляем…" : "Отправить проект"} <ArrowRight size={20} weight="thin" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
