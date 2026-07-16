export type AnalyticsParameters = Record<string, string | number | boolean | undefined>;

export type AnalyticsEvent = {
  name: string;
  parameters?: AnalyticsParameters;
};

export const analyticsConfig = {
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "",
  yandexMetrikaId: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID?.trim() ?? "",
};

export const analyticsEnabled =
  /^G-[A-Z0-9]+$/i.test(analyticsConfig.gaMeasurementId) ||
  /^\d+$/.test(analyticsConfig.yandexMetrikaId);

export const analyticsEventName = "steklostroygroup:analytics";

export function trackEvent(name: string, parameters?: AnalyticsParameters) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<AnalyticsEvent>(analyticsEventName, {
      detail: { name, parameters },
    }),
  );
}
