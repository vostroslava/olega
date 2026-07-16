const configuredSiteApiUrl = process.env.NEXT_PUBLIC_SITE_API_URL?.trim().replace(/\/+$/, "") ?? "";

const attributionKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export const siteApiUrl = configuredSiteApiUrl;

export function siteApiEndpoint(path: "lead" | "chat" | "health" | "admin") {
  return siteApiUrl ? `${siteApiUrl}/${path}` : "";
}

export function createClientRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `00000000-0000-4000-8000-${Date.now().toString().padStart(12, "0").slice(-12)}`;
}

export function getAttribution() {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    attributionKeys.map((key) => [key, params.get(key) ?? ""]),
  );
}

export function appendAttribution(formData: FormData) {
  Object.entries(getAttribution()).forEach(([key, value]) => formData.set(key, value));
}

export async function readApiError(response: Response) {
  try {
    const body = await response.json() as { error?: string };
    return body.error || "Сервис временно недоступен. Попробуйте ещё раз.";
  } catch {
    return "Сервис временно недоступен. Попробуйте ещё раз.";
  }
}
