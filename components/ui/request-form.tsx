"use client";

import { FormEvent, useMemo, useState } from "react";
import { CONTACTS, REQUEST_OPTIONS } from "@/lib/site-data";

type RequestFormProps = {
  defaultProduct?: string;
};

const formEndpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT?.trim() ?? "";

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
  }: {
    name: string;
    phone: string;
    product: string;
    message: string;
  }) => {
    const subject = encodeURIComponent(`Заявка на расчёт: ${product || "новый запрос"}`);
    const body = encodeURIComponent(
      [
        "Новая заявка с сайта СтеклоСтройГрупп",
        "",
        `Имя: ${name}`,
        `Телефон: ${phone}`,
        `Тип запроса: ${product || "не указано"}`,
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
    const name = formData.get("name")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const product = formData.get("product")?.toString().trim() || "";
    const message = formData.get("message")?.toString().trim() || "";

    if (!formEndpoint) {
      fallbackToMail({ name, phone, product, message });
      return;
    }

    setSubmitting(true);
    setNoteSuccess(false);
    setNote("Отправляем заявку...");

    try {
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
          source: "steklostroygroup-site",
          page: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      form.reset();
      setNote("Заявка отправлена. Мы свяжемся с вами в ближайшее рабочее время.");
      setNoteSuccess(true);
    } catch {
      setNote(
        `Не удалось отправить заявку напрямую. Открываем fallback через ${CONTACTS.primaryEmail}.`
      );
      fallbackToMail({ name, phone, product, message });
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

      <button className="button button-primary button-full" type="submit" disabled={submitting}>
        {submitting ? "Отправляем..." : "Отправить заявку"}
      </button>
      <p className={`form-note ${noteSuccess ? "is-success" : ""}`}>{note}</p>
    </form>
  );
}
