"use client";

import { useMemo, useState } from "react";
import { CONTACTS, REQUEST_OPTIONS } from "@/lib/site-data";

type RequestFormProps = {
  defaultProduct?: string;
};

export function RequestForm({ defaultProduct }: RequestFormProps) {
  const [note, setNote] = useState(
    "После нажатия откроется почтовый клиент с готовым черновиком письма."
  );
  const [noteSuccess, setNoteSuccess] = useState(false);

  const initialProduct = useMemo(() => {
    if (defaultProduct && REQUEST_OPTIONS.includes(defaultProduct)) {
      return defaultProduct;
    }

    return REQUEST_OPTIONS[0];
  }, [defaultProduct]);

  return (
    <form
      className="request-form reveal reveal-delay"
      onSubmit={(event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const name = formData.get("name")?.toString().trim() || "";
        const phone = formData.get("phone")?.toString().trim() || "";
        const product = formData.get("product")?.toString().trim() || "";
        const message = formData.get("message")?.toString().trim() || "";

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
      }}
    >
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

      <button className="button button-primary button-full" type="submit">
        Отправить заявку
      </button>
      <p className={`form-note ${noteSuccess ? "is-success" : ""}`}>{note}</p>
    </form>
  );
}
