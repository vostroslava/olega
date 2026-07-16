"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  analyticsConfig,
  analyticsEventName,
  type AnalyticsEvent,
  type AnalyticsParameters,
} from "@/lib/analytics";

type Consent = "accepted" | "declined" | null;

type AnalyticsWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
  ym?: (...args: unknown[]) => void;
};

const consentStorageKey = "steklostroygroup.analytics.consent";
function cleanParameters(parameters?: AnalyticsParameters) {
  return Object.fromEntries(
    Object.entries(parameters ?? {}).filter(([, value]) => value !== undefined),
  );
}

function classifyLink(link: HTMLAnchorElement) {
  const href = link.getAttribute("href") ?? "";
  if (href.startsWith("tel:")) return "phone_click";
  if (href.startsWith("mailto:")) return "email_click";
  if (/^(https?:)?\/\/(wa\.me|web\.telegram\.org|t\.me|api\.whatsapp\.com)/i.test(href)) {
    return "messenger_click";
  }
  return "";
}

function getStoredConsent(): Consent {
  if (typeof window === "undefined") return null;
  const savedConsent = window.localStorage.getItem(consentStorageKey);
  return savedConsent === "accepted" || savedConsent === "declined" ? savedConsent : null;
}

type AnalyticsProps = { config?: Partial<typeof analyticsConfig> };

export function Analytics({ config }: AnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<Consent>(getStoredConsent);
  const configuredGaId = config?.gaMeasurementId || analyticsConfig.gaMeasurementId;
  const configuredYandexId = config?.yandexMetrikaId || analyticsConfig.yandexMetrikaId;
  const gaMeasurementId = /^G-[A-Z0-9]+$/i.test(configuredGaId) ? configuredGaId : "";
  const yandexMetrikaId = /^\d+$/.test(configuredYandexId) ? configuredYandexId : "";
  const analyticsEnabled = Boolean(gaMeasurementId || yandexMetrikaId);

  const sendEvent = useCallback((name: string, parameters?: AnalyticsParameters) => {
    const payload = cleanParameters(parameters);
    const analyticsWindow = window as AnalyticsWindow;

    if (gaMeasurementId) {
      if (analyticsWindow.gtag) {
        analyticsWindow.gtag("event", name, payload);
      } else {
        analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
        analyticsWindow.dataLayer.push(["event", name, payload]);
      }
    }

    if (yandexMetrikaId && analyticsWindow.ym) {
      analyticsWindow.ym(Number(yandexMetrikaId), "reachGoal", name, payload);
    }
  }, [gaMeasurementId, yandexMetrikaId]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (consent !== "accepted") return;

    const onTrackedEvent = (event: Event) => {
      const detail = (event as CustomEvent<AnalyticsEvent>).detail;
      if (detail?.name) sendEvent(detail.name, detail.parameters);
    };

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trackedElement = target.closest<HTMLElement>("[data-analytics-event]");
      if (trackedElement) {
        sendEvent(trackedElement.dataset.analyticsEvent ?? "cta_click", {
          label: trackedElement.dataset.analyticsLabel,
          location: pathname,
        });
        return;
      }

      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const name = classifyLink(link);
      if (name) sendEvent(name, { location: pathname });
    };

    window.addEventListener(analyticsEventName, onTrackedEvent);
    document.addEventListener("click", onDocumentClick);
    return () => {
      window.removeEventListener(analyticsEventName, onTrackedEvent);
      document.removeEventListener("click", onDocumentClick);
    };
  }, [consent, pathname, sendEvent]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (consent !== "accepted") return;
    const query = searchParams.toString();
    sendEvent("page_view", { page_path: `${pathname}${query ? `?${query}` : ""}` });
  }, [consent, pathname, searchParams, sendEvent]);

  if (!analyticsEnabled) return null;

  const chooseConsent = (value: Exclude<Consent, null>) => {
    window.localStorage.setItem(consentStorageKey, value);
    setConsent(value);
  };

  return (
    <>
      {consent === "accepted" && gaMeasurementId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-config" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} window.gtag = gtag; gtag('js', new Date()); gtag('config', '${gaMeasurementId}', { send_page_view: false, anonymize_ip: true });`}
          </Script>
        </>
      ) : null}
      {consent === "accepted" && yandexMetrikaId ? (
        <Script id="yandex-metrika-config" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym'); ym(${Number(yandexMetrikaId)}, 'init', {clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`}
        </Script>
      ) : null}
      {consent === null ? (
        <aside className="analytics-consent" aria-label="Настройки аналитики">
          <p>Разрешите анонимную статистику, чтобы мы понимали, какие страницы и формы помогают клиентам. Это не влияет на работу сайта.</p>
          <div>
            <button className="button button-primary" type="button" onClick={() => chooseConsent("accepted")}>Разрешить</button>
            <button className="button button-secondary button-on-dark" type="button" onClick={() => chooseConsent("declined")}>Не сейчас</button>
          </div>
          <Link href="/politika-konfidentsialnosti/">Подробнее о данных</Link>
        </aside>
      ) : null}
    </>
  );
}
