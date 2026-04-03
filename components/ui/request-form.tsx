"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { CONTACTS, REQUEST_OPTIONS } from "@/lib/site-data";

type RequestFormProps = {
  defaultProduct?: string;
};

const formEndpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT?.trim() ?? "";
const isGoogleAppsScriptEndpoint = /script\.google(?:usercontent)?\.com/.test(formEndpoint);

export function RequestForm({ defaultProduct }: RequestFormProps) {
  const [note, setNote] = useState(
    formEndpoint
      ? "После отправки покажем статус заявки прямо на странице."
      : "Пока форма работает через почтовый клиент. После нажатия откроется готовый черновик письма."
  );
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initialProduct = useMemo(() => {
    if (defaultProduct && REQUEST_OPTIONS.includes(defaultProduct)) {
      return defaultProduct;
    }

    return REQUEST_OPTIONS[0];
  }, [defaultProduct]);

  const fallbackToMail = ({
    name,
    phone,
    product,
    message,
    consent,
  }: {
    name: string;
    phone: string;
    product: string;
    message: string;
    consent: boolean;
  }) => {
    const subject = encodeURIComponent(`Заявка на расчёт: ${product || "новый запрос"}`);
    const body = encodeURIComponent(
      [
        "Новая заявка с сайта СтеклоСтройГрупп",
        "",
        `Имя: ${name}`,
        `Телефон: ${phone}`,
        `Тип запроса: ${product || "не указано"}`,
        `Согласие на обработку персональных данных: ${consent ? "да" : "нет"}`,
        "",
        "Комментарий:",
        message || "не указан",
      ].join("\n")
    );

    window.location.href = `mailto:${CONTACTS.primaryEmail}?subject=${subject}&body=${body}`;
    setNote(
      `Черновик письма подготовлен. Если почтовый клиент не открылся, используйте ${CONTACTS.primaryEmail}.`
    );
    setNoteSuccess(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const company = formData.get("company")?.toString().trim() || "";
    const name = formData.get("name")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const product = formData.get("product")?.toString().trim() || "";
    const message = formData.get("message")?.toString().trim() || "";
    const consent = formData.get("consent") === "on";

    if (company) {
      setNote("Заявка отправлена. Мы свяжемся с вами в ближайшее рабочее время.");
      setNoteSuccess(true);
      form.reset();
      return;
    }

    if (!formEndpoint) {
      fallbackToMail({ name, phone, product, message, consent });
      return;
    }

    setSubmitting(true);
    setNoteSuccess(false);
    setNote("Отправляем заявку...");

    try {
      if (isGoogleAppsScriptEndpoint) {
        const payload = new URLSearchParams({
          name,
          phone,
          product,
          message,
          consent: consent ? "yes" : "no",
          source: "steklostroygroup-site",
          page: window.location.href,
          submittedAt: new Date().toISOString(),
        });

        // Apps Script web apps work more reliably from static hosting without JSON preflight.
        await fetch(formEndpoint, {
          method: "POST",
          body: payload,
          mode: "no-cors",
        });
      } else {
        const response = await fetch(formEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name,
            phone,
            product,
            message,
            consent,
            source: "steklostroygroup-site",
            page: window.location.href,
            submittedAt: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error("Request failed");
        }
      }

      form.reset();
      setNote(
        isGoogleAppsScriptEndpoint
          ? "Заявка отправлена. Мы сохранили запрос и свяжемся с вами в ближайшее рабочее время."
          : "Заявка отправлена. Мы свяжемся с вами в ближайшее рабочее время."
      );
      setNoteSuccess(true);
    } catch {
      setNote(
        `Не удалось отправить заявку напрямую. Открываем fallback через ${CONTACTS.primaryEmail}.`
      );
      fallbackToMail({ name, phone, product, message, consent });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="request-form reveal reveal-delay" onSubmit={handleSubmit}>
      <label>
        <span>Имя</span>
        <input type="text" name="name" placeholder="Как к вам обращаться" required />
      </label>

      <div className="bot-field" aria-hidden="true">
        <label>
          <span>Компания</span>
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label>
        <span>Телефон</span>
        <input type="tel" name="phone" placeholder="+375 __ ___ __ __" required />
      </label>
      <label>
        <span>Тип запроса</span>
        <select name="product" defaultValue={initialProduct}>
          {REQUEST_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Комментарий</span>
        <textarea
          name="message"
          rows={4}
          placeholder="Например: частный дом, входная группа, фасад, офис, ориентировочные сроки"
        />
      </label>

      <label className="checkbox-field">
        <input type="checkbox" name="consent" required />
        <span>
          Даю согласие на обработку персональных данных в соответствии с{" "}
          <Link href="/politika-konfidentsialnosti/">политикой конфиденциальности</Link>.
        </span>
      </label>

      <button className="button button-primary button-full" type="submit" disabled={submitting}>
        {submitting ? "Отправляем..." : "Отправить заявку"}
      </button>
      <p className={`form-note ${noteSuccess ? "is-success" : ""}`}>{note}</p>
    </form>
  );
}
