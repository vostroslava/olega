import { readApiError, siteApiEndpoint } from "@/lib/site-api";

export const leadStatuses = ["new", "reviewed", "contacted", "qualified", "won", "lost", "spam"] as const;
export type LeadStatus = (typeof leadStatuses)[number];
export type StaffRole = "admin" | "manager" | "editor";

export const sitePageStates = ["draft", "review", "published"] as const;
export type SitePageState = (typeof sitePageStates)[number];

export type SitePage = {
  id: string;
  slug: string;
  navigation_label: string;
  page_title: string;
  meta_description: string;
  canonical_path: string;
  schema_type: "WebPage" | "Service" | "CollectionPage" | "ContactPage" | "AboutPage";
  hero_title: string | null;
  hero_lead: string | null;
  hero_image_url: string | null;
  content: Record<string, unknown>;
  state: SitePageState;
  published_page_title: string | null;
  published_meta_description: string | null;
  published_content: Record<string, unknown> | null;
  published_at: string | null;
  updated_at: string;
};

export type SiteMedia = {
  id: string;
  kind: "image" | "video" | "document";
  source_url: string;
  alt_text: string;
  caption: string | null;
  created_at: string;
  updated_at: string;
};

export type StaffMember = {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: StaffRole;
  created_at: string;
};

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

export async function bootstrapAdmin(login: string, password: string) {
  const body = await adminFetch("/bootstrap", "", {
    method: "POST",
    body: JSON.stringify({ login, password }),
  }) as { email?: string };
  if (!body.email) throw new Error("Не удалось подготовить администраторский вход.");
  return body.email;
}

export async function getAdminMe(token: string) {
  const body = await adminFetch("/me", token) as { staff?: StaffMember };
  if (!body.staff) throw new Error("Не удалось определить права доступа.");
  return body.staff;
}

export async function getAdminStaff(token: string) {
  const body = await adminFetch("/staff", token) as { staff?: StaffMember[] };
  return body.staff ?? [];
}

export async function createAdminStaff(token: string, values: { email: string; fullName: string; password: string; role?: Exclude<StaffRole, "admin"> }) {
  const body = await adminFetch("/staff", token, {
    method: "POST",
    body: JSON.stringify(values),
  }) as { staff?: StaffMember };
  if (!body.staff) throw new Error("Не удалось создать сотрудника.");
  return body.staff;
}

export async function getContentPages(token: string) {
  const body = await adminFetch("/content/pages", token) as { pages?: SitePage[] };
  return body.pages ?? [];
}

export async function saveContentPage(token: string, page: SitePage) {
  const body = await adminFetch(`/content/pages?slug=${encodeURIComponent(page.slug)}`, token, {
    method: "PATCH",
    body: JSON.stringify({
      pageTitle: page.page_title,
      metaDescription: page.meta_description,
      canonicalPath: page.canonical_path,
      schemaType: page.schema_type,
      heroTitle: page.hero_title,
      heroLead: page.hero_lead,
      heroImageUrl: page.hero_image_url,
    }),
  }) as { page?: SitePage };
  if (!body.page) throw new Error("Не удалось сохранить черновик.");
  return body.page;
}

export async function publishContentPage(token: string, slug: string) {
  const body = await adminFetch(`/content/pages/publish?slug=${encodeURIComponent(slug)}`, token, {
    method: "POST",
  }) as { page?: SitePage };
  if (!body.page) throw new Error("Не удалось опубликовать страницу.");
  return body.page;
}

export async function getContentMedia(token: string) {
  const body = await adminFetch("/content/media", token) as { media?: SiteMedia[] };
  return body.media ?? [];
}

export async function addContentMedia(token: string, values: { sourceUrl: string; altText: string; caption?: string; kind?: SiteMedia["kind"] }) {
  const body = await adminFetch("/content/media", token, {
    method: "POST",
    body: JSON.stringify(values),
  }) as { media?: SiteMedia };
  if (!body.media) throw new Error("Не удалось добавить материал.");
  return body.media;
}
