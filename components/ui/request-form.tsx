"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CONTACTS, REQUEST_OPTIONS } from "@/lib/site-data";
import { assetPath } from "@/lib/site-utils";

type RequestFormProps = {
  defaultProduct?: string;
};

const formEndpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT?.trim() ?? "";
const isGoogleAppsScriptEndpoint = /script\.google(?:usercontent)?\.com/.test(formEndpoint);
const preferredProductStorageKey = "steklostroygroup.request.product";
const preferredBriefStorageKey = "steklostroygroup.request.brief";

export function RequestForm({ defaultProduct }: RequestFormProps) {
  const [note, setNote] = useState(
    formEndpoint
      ? "После отправки покажем статус заявки прямо на странице."
      : "Пока форма работает через почтовый клиент. После нажатия откроется готовый черновик письма."
  );
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(REQUEST_OPTIONS[0]);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [messageValue, setMessageValue] = useState("");
  const selectRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const initialProduct = useMemo(() => {
    if (defaultProduct && REQUEST_OPTIONS.includes(defaultProduct)) {
      return defaultProduct;
    }

    return REQUEST_OPTIONS[0];
  }, [defaultProduct]);

  useEffect(() => {
    setSelectedProduct(initialProduct);
  }, [initialProduct]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const preferredProductFromQuery = params.get("product");
    const preferredBriefFromQuery = params.get("brief");
    const preferredProductFromStorage = window.localStorage.getItem(preferredProductStorageKey);
    const preferredBriefFromStorage = window.localStorage.getItem(preferredBriefStorageKey);

    const resolvedProduct =
      preferredProductFromQuery ?? preferredProductFromStorage ?? defaultProduct ?? "";

    if (resolvedProduct && REQUEST_OPTIONS.includes(resolvedProduct)) {
      setSelectedProduct(resolvedProduct);
    }

    if (preferredBriefFromQuery) {
      setMessageValue(`Предварительный brief: ${preferredBriefFromQuery}`);
    } else if (preferredBriefFromStorage) {
      setMessageValue(`Предварительный brief: ${preferredBriefFromStorage}`);
    }
  }, [defaultProduct]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!selectRef.current?.contains(event.target as Node)) {
        setIsProductMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const selectedIndex = REQUEST_OPTIONS.findIndex((item) => item === selectedProduct);

  const clearEstimateContext = () => {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem(preferredProductStorageKey);
    window.localStorage.removeItem(preferredBriefStorageKey);
  };

  const focusOption = (index: number) => {
    window.requestAnimationFrame(() => {
      optionRefs.current[index]?.focus();
    });
  };

  const openMenuAndFocus = (index: number) => {
    setIsProductMenuOpen(true);
    focusOption(index);
  };

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
    clearEstimateContext();
    setMessageValue("");
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
    const product = selectedProduct;
    const message = messageValue.trim();
    const consent = formData.get("consent") === "on";

    if (company) {
      setNote("Заявка отправлена. Мы свяжемся с вами в ближайшее рабочее время.");
      setNoteSuccess(true);
      form.reset();
      setMessageValue("");
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
          company,
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

        form.reset();
        clearEstimateContext();
        setMessageValue("");
        setNote(
          "Запрос передан в обработку. Отдельную страницу подтверждения не показываем: если не вернёмся в ближайшее рабочее время, свяжитесь с нами по телефону."
        );
        setNoteSuccess(true);
        return;
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
            company,
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
      clearEstimateContext();
      setMessageValue("");
      setNote("Заявка отправлена. Мы свяжемся с вами в ближайшее рабочее время.");
      setNoteSuccess(true);
      window.location.assign(
        assetPath(`/spasibo/?product=${encodeURIComponent(product)}`)
      );
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
        <input
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Как к вам обращаться…"
          required
        />
      </label>

      <div className="bot-field" aria-hidden="true">
        <label>
          <span>Компания</span>
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label>
        <span>Телефон</span>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+375 __ ___ __ __…"
          required
        />
      </label>
      <label>
        <span>Тип запроса</span>
        <div className="custom-select" ref={selectRef}>
          <input type="hidden" name="product" value={selectedProduct} />
          <button
            className={`custom-select-trigger ${isProductMenuOpen ? "is-open" : ""}`}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isProductMenuOpen}
            aria-controls="request-product-menu"
            onClick={() => setIsProductMenuOpen((open) => !open)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openMenuAndFocus(selectedIndex >= 0 ? selectedIndex : 0);
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                openMenuAndFocus(selectedIndex > 0 ? selectedIndex - 1 : REQUEST_OPTIONS.length - 1);
              }
            }}
          >
            <span>{selectedProduct}</span>
            <span className="custom-select-arrow" aria-hidden="true">
              ▾
            </span>
          </button>

          <div
            className={`custom-select-menu ${isProductMenuOpen ? "is-open" : ""}`}
            id="request-product-menu"
            role="listbox"
          >
            {REQUEST_OPTIONS.map((option, index) => {
              const isSelected = option === selectedProduct;

              return (
                <button
                  key={option}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  className={`custom-select-option ${isSelected ? "is-selected" : ""}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setSelectedProduct(option);
                    setIsProductMenuOpen(false);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      focusOption((index + 1) % REQUEST_OPTIONS.length);
                    }

                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      focusOption((index - 1 + REQUEST_OPTIONS.length) % REQUEST_OPTIONS.length);
                    }

                    if (event.key === "Home") {
                      event.preventDefault();
                      focusOption(0);
                    }

                    if (event.key === "End") {
                      event.preventDefault();
                      focusOption(REQUEST_OPTIONS.length - 1);
                    }

                    if (event.key === "Escape") {
                      event.preventDefault();
                      setIsProductMenuOpen(false);
                    }

                    if (event.key === "Tab") {
                      setIsProductMenuOpen(false);
                    }
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </label>
      <label>
        <span>Комментарий</span>
        <textarea
          name="message"
          rows={4}
          autoComplete="off"
          value={messageValue}
          onChange={(event) => setMessageValue(event.target.value)}
          placeholder="Например: частный дом, входная группа, фасад, офис, ориентировочные сроки…"
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
      <p className={`form-note ${noteSuccess ? "is-success" : ""}`} aria-live="polite">
        {note}
      </p>
    </form>
  );
}
