"use client";

import Link from "next/link";
import Image from "next/image";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { FileArrowUp } from "@phosphor-icons/react/dist/csr/FileArrowUp";
import { LockKey } from "@phosphor-icons/react/dist/csr/LockKey";
import { UserCircleCheck } from "@phosphor-icons/react/dist/csr/UserCircleCheck";
import { ArchitecturalIcon } from "@/components/ui/architectural-icons";
import { CONTACTS } from "@/lib/site-data";
import { assetPath } from "@/lib/site-utils";

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
  const [objectType, setObjectType] = useState(objectTypes[0].value);
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState(materialOptions[3]);
  const [fileName, setFileName] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const summary = useMemo(
    () => `${objectType}; ${size || "размеры уточнить"}; ${material}${fileName ? `; файл: ${fileName}` : ""}`,
    [fileName, material, objectType, size],
  );
  const activeObject = objectTypes.find((item) => item.value === objectType) ?? objectTypes[0];
  const activeScene = sceneCopy[activeObject.value as keyof typeof sceneCopy];

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT?.trim();

    if (endpoint) {
      const payload = new URLSearchParams({
        name,
        phone,
        product: objectType,
        message: summary,
        consent: "yes",
        source: "optical-monolith-wizard",
      });
      void fetch(endpoint, { method: "POST", body: payload, mode: "no-cors" });
      setSubmitted(true);
      return;
    }

    const subject = encodeURIComponent(`Расчёт проекта: ${objectType}`);
    const body = encodeURIComponent(`Имя: ${name}\nТелефон: ${phone}\nПроект: ${summary}`);
    window.location.href = `mailto:${CONTACTS.primaryEmail}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="quote-success" role="status">
        <Check size={50} weight="thin" aria-hidden="true" />
        <p className="optical-label">ЗАПРОС ПОДГОТОВЛЕН</p>
        <h3>Инженер свяжется с вами и проверит исходные данные</h3>
        <p>Если почтовый клиент не открылся, позвоните по номеру {CONTACTS.phones[0].label}.</p>
        <button className="button button-secondary button-on-dark" type="button" onClick={() => setSubmitted(false)}>
          Изменить данные
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
            className={index === step ? "is-active" : index < step ? "is-complete" : ""}
            onClick={() => index <= step && setStep(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="quote-stage">
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
                <input type="file" accept="image/*,.pdf" onChange={handleFile} />
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
            <button className="button button-secondary button-on-dark" type="button" onClick={() => setStep((value) => value - 1)}>
              <ArrowLeft size={20} weight="thin" aria-hidden="true" /> Назад
            </button>
          ) : compact ? (
            <Link className="button button-secondary button-on-dark" href="/raschet/">Полная форма</Link>
          ) : null}
          {step < steps.length - 1 ? (
            <button className="button button-primary" type="button" onClick={() => setStep((value) => value + 1)}>
              Продолжить <ArrowRight size={20} weight="thin" aria-hidden="true" />
            </button>
          ) : (
            <button className="button button-primary" type="submit">
              Отправить проект <ArrowRight size={20} weight="thin" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
