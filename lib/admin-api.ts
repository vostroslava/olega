import { readApiError, siteApiEndpoint } from "@/lib/site-api";

export const leadStatuses = ["new", "reviewed", "contacted", "qualified", "won", "lost", "spam"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export type LeadFile = {
  id: string;
  original_name: string;
  mime_type: string;
  byte_size: number;
  created_at: string;
};

export type LeadEvent = {
  id: string;
  kind: "created" | "status_changed" | "notification_sent" | "notification_failed";
  from_status: LeadStatus | null;
  to_status: LeadStatus | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type LeadAiReview = {
  id: string;
  summary: string;
  category: string;
  priority: string;
  completeness: number;
  missing_questions: string[];
  flags: string[];
  manager_reply_draft: string;
  model: string | null;
  created_at: string;
};

export type LeadSummary = {
  id: string;
  status: LeadStatus;
  source: string;
  name: string;
  phone: string;
  email: string | null;
  object_type: string | null;
  size_notes: string | null;
  material: string | null;
  message: string | null;
  page_url: string | null;
  utm: Record<string, string>;
  created_at: string;
  updated_at: string;
  lead_files?: LeadFile[];
};

export type LeadDetail = LeadSummary & {
  lead_files: LeadFile[];
  lead_events: LeadEvent[];
  lead_ai_reviews: LeadAiReview[];
};

type AdminListResponse = {
  ok: boolean;
  leads?: LeadSummary[];
  total?: number;
};

function endpoint(path = "") {
  const base = siteApiEndpoint("admin");
  return base ? `${base}${path}` : "";
}

async function adminFetch(path: string, token: string, init?: RequestInit) {
  const url = endpoint(path);
  if (!url) throw new Error("Контур заявок ещё не подключён.");

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) throw new Error(await readApiError(response));
  return response.json() as Promise<Record<string, unknown>>;
}

export async function getAdminLeads(token: string, status: LeadStatus | "all" = "all") {
  const query = status === "all" ? "" : `?status=${encodeURIComponent(status)}`;
  const body = await adminFetch(`/leads${query}`, token) as AdminListResponse;
  return { leads: body.leads ?? [], total: body.total ?? 0 };
}

export async function getAdminLead(token: string, leadId: string) {
  const body = await adminFetch(`/leads/${encodeURIComponent(leadId)}`, token) as { lead?: LeadDetail };
  if (!body.lead) throw new Error("Заявка не найдена.");
  return body.lead;
}

export async function updateAdminLeadStatus(token: string, leadId: string, status: LeadStatus) {
  const body = await adminFetch(`/leads/${encodeURIComponent(leadId)}/status`, token, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }) as { lead?: LeadDetail };
  if (!body.lead) throw new Error("Не удалось обновить статус.");
  return body.lead;
}

export async function getAdminFileUrl(token: string, leadId: string, fileId: string) {
  const body = await adminFetch(`/leads/${encodeURIComponent(leadId)}/files/${encodeURIComponent(fileId)}`, token) as { url?: string };
  if (!body.url) throw new Error("Файл временно недоступен.");
  return body.url;
}
