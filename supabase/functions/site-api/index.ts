import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "@supabase/supabase-js/cors";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
  "application/acad",
  "application/dwg",
  "image/vnd.dwg",
  "application/dxf",
];
const ALLOWED_FILE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif", "pdf", "dwg", "dxf"]);
const CAD_FALLBACK_MIME_TYPES = new Set(["", "application/octet-stream", "application/x-autocad", "application/x-dwg"]);
const CANONICAL_MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
  dwg: "application/dwg",
  dxf: "application/dxf",
};
const DEFAULT_ALLOWED_ORIGINS = [
  "https://vostroslava.github.io",
  "https://steklostroygroup.by",
  "https://www.steklostroygroup.by",
  "http://127.0.0.1:4173",
  "http://localhost:3000",
];

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase service environment is unavailable");

const db = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const LEAD_STATUSES = ["new", "reviewed", "contacted", "qualified", "won", "lost", "spam"] as const;
const adminLeadSelect = "id,status,source,page_url,name,phone,email,object_type,size_notes,material,message,utm,created_at,updated_at,lead_files(id,original_name,mime_type,byte_size,created_at)";
const staffMemberSelect = "id,user_id,email,full_name,role,created_at";
const sitePageSelect = "id,slug,navigation_label,page_title,meta_description,canonical_path,schema_type,hero_title,hero_lead,hero_image_url,content,template_key,seo_robots,og_title,og_description,og_image_url,twitter_card,sitemap_priority,sitemap_change_frequency,is_indexable,is_in_navigation,navigation_order,navigation_parent,state,published_page_title,published_meta_description,published_content,published_snapshot,published_at,updated_at";
const siteBlockSelect = "id,page_id,block_key,block_type,label,position,is_visible,data,published_data,published_position,published_is_visible,published_at,created_at,updated_at";
const siteNavigationSelect = "id,location,label,href,position,is_visible,opens_new_tab,page_id,created_at,updated_at";

type JsonRecord = Record<string, unknown>;

function allowedOrigins() {
  return new Set(
    (Deno.env.get("SITE_ALLOWED_ORIGINS") || DEFAULT_ALLOWED_ORIGINS.join(","))
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function originAllowed(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || allowedOrigins().has(origin);
}

function responseHeaders(request: Request) {
  const origin = request.headers.get("origin");
  return {
    ...corsHeaders,
    "Access-Control-Allow-Origin": origin && allowedOrigins().has(origin) ? origin : "null",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

function json(request: Request, body: JsonRecord, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(request) });
}

function text(value: unknown, maxLength = 4000) {
  return String(value ?? "").trim().slice(0, maxLength);
}

async function requireStaff(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return { user: null, staff: null, status: 401, error: "Требуется вход." };

  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return { user: null, staff: null, status: 403, error: "Недостаточно прав для этого контура." };
  const staff = await db.from("staff_members").select(staffMemberSelect).eq("user_id", data.user.id).maybeSingle();
  if (staff.error) throw staff.error;
  if (!staff.data) return { user: null, staff: null, status: 403, error: "Для этой учётной записи не выдан доступ." };
  return { user: data.user, staff: staff.data, status: 200, error: "" };
}

async function requireAdmin(request: Request) {
  const auth = await requireStaff(request);
  if (!auth.user || !auth.staff) return auth;
  if (auth.staff.role !== "admin") {
    return { user: null, staff: null, status: 403, error: "Доступ к управлению командой есть только у администратора." };
  }
  return auth;
}

async function requireContentEditor(request: Request) {
  const auth = await requireStaff(request);
  if (!auth.user || !auth.staff) return auth;
  if (auth.staff.role !== "admin" && auth.staff.role !== "editor") {
    return { user: null, staff: null, status: 403, error: "Для Content Studio нужен доступ редактора или администратора." };
  }
  return auth;
}

function secureEquals(left: string, right: string) {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  if (leftBytes.length !== rightBytes.length) return false;
  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) difference |= leftBytes[index] ^ rightBytes[index];
  return difference === 0;
}

async function adminLoginRateLimited(fingerprint: string) {
  const threshold = new Date(Date.now() - 15 * 60_000).toISOString();
  const { count } = await db.from("admin_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("request_fingerprint", fingerprint)
    .gte("created_at", threshold);
  return (count || 0) >= 5;
}

async function recordAdminLoginFailure(fingerprint: string) {
  const result = await db.from("admin_login_attempts").insert({ request_fingerprint: fingerprint });
  if (result.error) console.error("Unable to record admin login attempt", result.error);
}

async function bootstrapAdmin(login: string, password: string, fingerprint: string) {
  const expectedLogin = Deno.env.get("SITE_BOOTSTRAP_ADMIN_LOGIN") || "";
  const expectedPassword = Deno.env.get("SITE_BOOTSTRAP_ADMIN_PASSWORD") || "";
  const internalEmail = (Deno.env.get("SITE_BOOTSTRAP_ADMIN_EMAIL") || "").toLowerCase();
  if (!expectedLogin || !expectedPassword || !internalEmail) throw new Error("Bootstrap administrator is not configured");
  if (await adminLoginRateLimited(fingerprint)) return { ok: false, status: 429, error: "Слишком много попыток. Попробуйте через 15 минут." };
  if (!secureEquals(login, expectedLogin) || !secureEquals(password, expectedPassword)) {
    await recordAdminLoginFailure(fingerprint);
    return { ok: false, status: 401, error: "Неверный логин или пароль." };
  }

  const existing = await db.from("staff_members").select(staffMemberSelect).eq("email", internalEmail).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) {
    if (existing.data.role !== "admin") {
      const repaired = await db.from("staff_members").update({ role: "admin" }).eq("id", existing.data.id);
      if (repaired.error) throw repaired.error;
    }
    return { ok: true, email: internalEmail };
  }

  const created = await db.auth.admin.createUser({
    email: internalEmail,
    password: expectedPassword,
    email_confirm: true,
    app_metadata: { staff_role: "admin" },
  });
  if (created.error || !created.data.user) throw created.error || new Error("Unable to create bootstrap administrator");
  const inserted = await db.from("staff_members").insert({
    user_id: created.data.user.id,
    email: internalEmail,
    full_name: "Администратор",
    role: "admin",
  });
  if (inserted.error) throw inserted.error;
  return { ok: true, email: internalEmail };
}

async function addLeadEvent(
  leadId: string,
  kind: "created" | "status_changed" | "notification_sent" | "notification_failed",
  values: JsonRecord = {},
) {
  const result = await db.from("lead_events").insert({ lead_id: leadId, kind, ...values });
  if (result.error) console.error("Unable to create lead event", result.error);
}

async function notifyNewLead(lead: { id: string; name: string; phone: string; objectType: string; message: string }) {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_LEADS_CHAT_ID");
  if (!token || !chatId) return;

  const message = [
    "Новая заявка с сайта СтеклоСтройГрупп",
    `Клиент: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    lead.objectType ? `Объект: ${lead.objectType}` : "",
    lead.message ? `Задача: ${lead.message.slice(0, 700)}` : "",
    `ID: ${lead.id}`,
  ].filter(Boolean).join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, disable_web_page_preview: true }),
    });
    if (!response.ok) throw new Error(`Telegram returned ${response.status}`);
    await addLeadEvent(lead.id, "notification_sent", { metadata: { channel: "telegram" } });
  } catch (error) {
    console.error("Telegram notification failed", error);
    await addLeadEvent(lead.id, "notification_failed", { metadata: { channel: "telegram" } });
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function siteSlug(value: unknown) {
  const slug = text(value, 180);
  return /^\/[a-z0-9/-]*$/.test(slug) ? slug : "";
}

function siteImageUrl(value: unknown) {
  const url = text(value, 2000);
  return !url || url.startsWith("/") || /^https:\/\//.test(url) ? url || null : null;
}

function safeJson(value: unknown, maxKeys = 24) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as JsonRecord)
      .slice(0, maxKeys)
      .map(([key, entry]) => [text(key, 80), typeof entry === "string" ? text(entry, 6000) : entry]),
  );
}

function blockKey(value: unknown) {
  const key = text(value, 80).toLowerCase();
  return /^[a-z0-9_-]{2,80}$/.test(key) ? key : "";
}

function navigationHref(value: unknown) {
  const href = text(value, 2000);
  return /^(https:\/\/|\/)/.test(href) ? href : "";
}

function contentBlockData(values: JsonRecord) {
  return {
    eyebrow: text(values.eyebrow, 120),
    heading: text(values.heading, 240),
    body: text(values.body, 6000),
    ctaLabel: text(values.ctaLabel, 80),
    ctaHref: navigationHref(values.ctaHref),
    imageUrl: siteImageUrl(values.imageUrl),
    imageAlt: text(values.imageAlt, 240),
    items: Array.isArray(values.items) ? values.items.slice(0, 12).map((item) => safeJson(item, 8)) : [],
  };
}

function sitePageSnapshot(page: Record<string, unknown>) {
  return {
    page_title: page.page_title,
    meta_description: page.meta_description,
    canonical_path: page.canonical_path,
    schema_type: page.schema_type,
    hero_title: page.hero_title,
    hero_lead: page.hero_lead,
    hero_image_url: page.hero_image_url,
    content: page.content,
    template_key: page.template_key,
    seo_robots: page.seo_robots,
    og_title: page.og_title,
    og_description: page.og_description,
    og_image_url: page.og_image_url,
    twitter_card: page.twitter_card,
    sitemap_priority: page.sitemap_priority,
    sitemap_change_frequency: page.sitemap_change_frequency,
    is_indexable: page.is_indexable,
    is_in_navigation: page.is_in_navigation,
    navigation_order: page.navigation_order,
    navigation_parent: page.navigation_parent,
    state: page.state,
  };
}

async function addSitePageRevision(page: Record<string, unknown>, action: "draft_saved" | "published", userId: string) {
  const current = await db.from("site_page_revisions")
    .select("revision_number")
    .eq("page_id", String(page.id))
    .order("revision_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (current.error) throw current.error;
  const inserted = await db.from("site_page_revisions").insert({
    page_id: page.id,
    revision_number: (current.data?.revision_number || 0) + 1,
    action,
    snapshot: sitePageSnapshot(page),
    created_by: userId,
  });
  if (inserted.error) throw inserted.error;
}

async function markCmsPageDraft(pageId: string, userId: string) {
  const changed = await db.from("site_pages").update({ state: "draft", updated_by: userId }).eq("id", pageId);
  if (changed.error) throw changed.error;
}

function safeFileName(name: string) {
  const normalized = name.normalize("NFKD").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized.slice(0, 120) || "attachment";
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function requestFingerprint(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const agent = request.headers.get("user-agent") || "unknown";
  const salt = Deno.env.get("LEAD_FINGERPRINT_SALT") || serviceRoleKey;
  return sha256(`${ip}|${agent}|${salt}`);
}

async function workerOnline() {
  const threshold = new Date(Date.now() - 90_000).toISOString();
  const { count } = await db
    .from("worker_heartbeats")
    .select("worker_key", { count: "exact", head: true })
    .gte("last_seen_at", threshold)
    .in("state", ["online", "busy"]);
  return (count || 0) > 0;
}

async function ensureLeadBucket() {
  const { data } = await db.storage.getBucket("lead-files");
  if (data) return;
  const { error } = await db.storage.createBucket("lead-files", {
    public: false,
    fileSizeLimit: MAX_FILE_BYTES,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
  });
  if (error && !/already exists/i.test(error.message)) throw error;
}

async function payloadFromRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const values: JsonRecord = {};
    for (const [key, value] of form.entries()) {
      if (!(value instanceof File)) values[key] = value;
    }
    const attachment = form.get("attachment");
    return { values, attachment: attachment instanceof File && attachment.size > 0 ? attachment : null };
  }
  return { values: await request.json() as JsonRecord, attachment: null };
}

async function leadRateLimited(fingerprint: string) {
  const threshold = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count } = await db
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("request_fingerprint", fingerprint)
    .gte("created_at", threshold);
  return (count || 0) >= 5;
}

async function handleLead(request: Request) {
  const { values, attachment } = await payloadFromRequest(request);
  const company = text(values.company, 160);
  if (company) return json(request, { ok: true, accepted: true });

  const name = text(values.name, 160);
  const phone = text(values.phone, 80);
  const consent = values.consent === true || values.consent === "true" || values.consent === "yes" || values.consent === "on";
  if (!name || phone.replace(/\D/g, "").length < 7 || !consent) {
    return json(request, { ok: false, error: "Проверьте имя, телефон и согласие на обработку данных." }, 422);
  }

  const fingerprint = await requestFingerprint(request);
  if (await leadRateLimited(fingerprint)) {
    return json(request, { ok: false, error: "Слишком много запросов. Попробуйте немного позже." }, 429);
  }

  const requestedId = text(values.clientRequestId, 40);
  const clientRequestId = isUuid(requestedId) ? requestedId : crypto.randomUUID();
  const utm = {
    source: text(values.utm_source, 160),
    medium: text(values.utm_medium, 160),
    campaign: text(values.utm_campaign, 160),
    content: text(values.utm_content, 160),
    term: text(values.utm_term, 160),
  };

  let { data: lead } = await db.from("leads").select("id").eq("client_request_id", clientRequestId).maybeSingle();
  let createdNewLead = false;
  if (!lead) {
    const created = await db.from("leads").insert({
      client_request_id: clientRequestId,
      source: text(values.source, 160) || "website",
      page_url: text(values.page, 2000) || null,
      name,
      phone,
      email: text(values.email, 320) || null,
      object_type: text(values.objectType ?? values.product, 240) || null,
      size_notes: text(values.size, 4000) || null,
      material: text(values.material, 240) || null,
      message: text(values.message, 12000) || null,
      consent,
      utm,
      metadata: { submittedAt: text(values.submittedAt, 80), fileName: attachment?.name || null },
      request_fingerprint: fingerprint,
    }).select("id").single();
    if (created.error) throw created.error;
    lead = created.data;
    createdNewLead = true;
    await addLeadEvent(lead.id, "created", { metadata: { source: text(values.source, 160) || "website" } });
  }

  let fileUploaded = false;
  if (attachment) {
    const extension = attachment.name.split(".").pop()?.toLowerCase() || "";
    const mimeAllowed = ALLOWED_MIME_TYPES.includes(attachment.type)
      || (["dwg", "dxf"].includes(extension) && CAD_FALLBACK_MIME_TYPES.has(attachment.type));
    if (!mimeAllowed || !ALLOWED_FILE_EXTENSIONS.has(extension)) {
      return json(request, { ok: false, accepted: true, leadId: lead.id, error: "Поддерживаются изображения, PDF, DWG и DXF." }, 415);
    }
    if (attachment.size > MAX_FILE_BYTES) {
      return json(request, { ok: false, accepted: true, leadId: lead.id, error: "Размер файла не должен превышать 10 МБ." }, 413);
    }

    const { count } = await db.from("lead_files").select("id", { count: "exact", head: true }).eq("lead_id", lead.id);
    if ((count || 0) === 0) {
      await ensureLeadBucket();
      const fileId = crypto.randomUUID();
      const objectPath = `${lead.id}/${fileId}/${safeFileName(attachment.name)}`;
      const bytes = await attachment.arrayBuffer();
      const upload = await db.storage.from("lead-files").upload(objectPath, bytes, {
        contentType: ALLOWED_MIME_TYPES.includes(attachment.type) ? attachment.type : CANONICAL_MIME_TYPES[extension],
        upsert: false,
      });
      if (upload.error) throw upload.error;
      const saved = await db.from("lead_files").insert({
        id: fileId,
        lead_id: lead.id,
        object_path: objectPath,
        original_name: attachment.name.slice(0, 240),
        mime_type: ALLOWED_MIME_TYPES.includes(attachment.type) ? attachment.type : CANONICAL_MIME_TYPES[extension],
        byte_size: attachment.size,
      });
      if (saved.error) {
        await db.storage.from("lead-files").remove([objectPath]);
        throw saved.error;
      }
    }
    fileUploaded = true;
  }

  const queued = await db.from("ai_tasks").insert({ kind: "lead_intake", lead_id: lead.id, priority: 40, payload: { source: "site-api" } });
  if (queued.error && queued.error.code !== "23505") throw queued.error;

  if (createdNewLead) {
    await notifyNewLead({
      id: lead.id,
      name,
      phone,
      objectType: text(values.objectType ?? values.product, 240),
      message: text(values.message, 12000),
    });
  }

  return json(request, {
    ok: true,
    accepted: true,
    leadId: lead.id,
    fileUploaded,
    aiQueued: true,
    workerOnline: await workerOnline(),
  }, 201);
}

async function handleAdmin(request: Request, path: string) {
  if (request.method === "POST" && path === "/admin/bootstrap") {
    const values = await request.json() as JsonRecord;
    const result = await bootstrapAdmin(text(values.login, 80), text(values.password, 240), await requestFingerprint(request));
    return result.ok
      ? json(request, { ok: true, email: result.email || "" })
      : json(request, { ok: false, error: result.error || "Не удалось войти." }, result.status || 500);
  }

  const auth = await requireStaff(request);
  if (!auth.user) return json(request, { ok: false, error: auth.error }, auth.status);

  const url = new URL(request.url);
  const segments = path.split("/").filter(Boolean);
  const leadId = segments[2] || "";

  if (request.method === "GET" && path === "/admin/me") {
    return json(request, { ok: true, staff: auth.staff });
  }

  if (request.method === "GET" && path === "/admin/staff") {
    const admin = await requireAdmin(request);
    if (!admin.user) return json(request, { ok: false, error: admin.error }, admin.status);
    const result = await db.from("staff_members").select(staffMemberSelect).order("created_at", { ascending: true });
    if (result.error) throw result.error;
    return json(request, { ok: true, staff: result.data || [] });
  }

  if (request.method === "POST" && path === "/admin/staff") {
    const admin = await requireAdmin(request);
    if (!admin.user) return json(request, { ok: false, error: admin.error }, admin.status);
    const values = await request.json() as JsonRecord;
    const email = text(values.email, 320).toLowerCase();
    const fullName = text(values.fullName, 160);
    const password = text(values.password, 240);
    const role = text(values.role, 20) === "editor" ? "editor" : "manager";
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 10) {
      return json(request, { ok: false, error: "Укажите рабочую почту и временный пароль не короче 10 символов." }, 422);
    }
    const existing = await db.from("staff_members").select("id").eq("email", email).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) return json(request, { ok: false, error: "Этот сотрудник уже добавлен." }, 409);
    const created = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: fullName ? { full_name: fullName } : {},
      app_metadata: { staff_role: role },
    });
    if (created.error || !created.data.user) throw created.error || new Error("Unable to create staff member");
    const inserted = await db.from("staff_members").insert({
      user_id: created.data.user.id,
      email,
      full_name: fullName || null,
      role,
      created_by: admin.user.id,
    }).select(staffMemberSelect).single();
    if (inserted.error) throw inserted.error;
    return json(request, { ok: true, staff: inserted.data }, 201);
  }

  if (request.method === "GET" && path === "/admin/content/pages") {
    const contentEditor = await requireContentEditor(request);
    if (!contentEditor.user) return json(request, { ok: false, error: contentEditor.error }, contentEditor.status);
    const result = await db.from("site_pages").select(sitePageSelect).order("slug", { ascending: true });
    if (result.error) throw result.error;
    return json(request, { ok: true, pages: result.data || [] });
  }

  if (request.method === "PATCH" && path === "/admin/content/pages") {
    const contentEditor = await requireContentEditor(request);
    if (!contentEditor.user) return json(request, { ok: false, error: contentEditor.error }, contentEditor.status);
    const slug = siteSlug(url.searchParams.get("slug"));
    if (!slug) return json(request, { ok: false, error: "Некорректный адрес страницы." }, 422);
    const values = await request.json() as JsonRecord;
    const navigationLabel = text(values.navigationLabel, 120);
    const pageTitle = text(values.pageTitle, 160);
    const metaDescription = text(values.metaDescription, 320);
    const canonicalPath = siteSlug(values.canonicalPath);
    const schemaType = text(values.schemaType, 40);
    const heroImageUrl = siteImageUrl(values.heroImageUrl);
    const templateKey = text(values.templateKey, 30) || "landing";
    const seoRobots = text(values.seoRobots, 30) || "index,follow";
    const ogImageUrl = siteImageUrl(values.ogImageUrl);
    const sitemapPriority = Number(values.sitemapPriority ?? 0.5);
    const sitemapChangeFrequency = text(values.sitemapChangeFrequency, 20) || "monthly";
    if (!navigationLabel || !pageTitle || !metaDescription || !canonicalPath || !["WebPage", "Service", "CollectionPage", "ContactPage", "AboutPage"].includes(schemaType) || !["home", "audience", "projects", "production", "contacts", "landing", "article"].includes(templateKey) || !["index,follow", "noindex,follow", "noindex,nofollow"].includes(seoRobots) || !["summary", "summary_large_image"].includes(text(values.twitterCard, 30) || "summary_large_image") || !["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].includes(sitemapChangeFrequency) || !Number.isFinite(sitemapPriority) || sitemapPriority < 0 || sitemapPriority > 1 || heroImageUrl === null && text(values.heroImageUrl, 2000) || ogImageUrl === null && text(values.ogImageUrl, 2000)) {
      return json(request, { ok: false, error: "Проверьте title, description, canonical URL, schema и адрес изображения." }, 422);
    }
    const updated = await db.from("site_pages").update({
      navigation_label: navigationLabel,
      page_title: pageTitle,
      meta_description: metaDescription,
      canonical_path: canonicalPath,
      schema_type: schemaType,
      hero_title: text(values.heroTitle, 180) || null,
      hero_lead: text(values.heroLead, 480) || null,
      hero_image_url: heroImageUrl,
      template_key: templateKey,
      seo_robots: seoRobots,
      og_title: text(values.ogTitle, 160) || null,
      og_description: text(values.ogDescription, 320) || null,
      og_image_url: ogImageUrl,
      twitter_card: text(values.twitterCard, 30) || "summary_large_image",
      sitemap_priority: sitemapPriority,
      sitemap_change_frequency: sitemapChangeFrequency,
      is_indexable: values.isIndexable !== false,
      is_in_navigation: values.isInNavigation !== false,
      navigation_order: Math.max(0, Math.min(9999, Number(values.navigationOrder ?? 100) || 100)),
      navigation_parent: text(values.navigationParent, 80) || null,
      state: "draft",
      updated_by: contentEditor.user.id,
    }).eq("slug", slug).select(sitePageSelect).maybeSingle();
    if (updated.error) throw updated.error;
    if (!updated.data) return json(request, { ok: false, error: "Страница не найдена." }, 404);
    await addSitePageRevision(updated.data as Record<string, unknown>, "draft_saved", contentEditor.user.id);
    return json(request, { ok: true, page: updated.data });
  }

  if (request.method === "POST" && path === "/admin/content/pages/publish") {
    const contentEditor = await requireContentEditor(request);
    if (!contentEditor.user) return json(request, { ok: false, error: contentEditor.error }, contentEditor.status);
    const slug = siteSlug(url.searchParams.get("slug"));
    if (!slug) return json(request, { ok: false, error: "Некорректный адрес страницы." }, 422);
    const current = await db.from("site_pages").select(sitePageSelect).eq("slug", slug).maybeSingle();
    if (current.error) throw current.error;
    if (!current.data) return json(request, { ok: false, error: "Страница не найдена." }, 404);
    const blocks = await db.from("site_page_blocks").select(siteBlockSelect).eq("page_id", current.data.id).order("position");
    if (blocks.error) throw blocks.error;
    for (const block of blocks.data || []) {
      const publishedBlock = await db.from("site_page_blocks").update({
        published_data: block.data,
        published_position: block.position,
        published_is_visible: block.is_visible,
        published_at: new Date().toISOString(),
      }).eq("id", block.id);
      if (publishedBlock.error) throw publishedBlock.error;
    }
    const snapshot = { ...sitePageSnapshot(current.data as Record<string, unknown>), blocks: blocks.data || [] };
    const published = await db.from("site_pages").update({
      state: "published",
      published_page_title: current.data.page_title,
      published_meta_description: current.data.meta_description,
      published_content: {
        hero_title: current.data.hero_title,
        hero_lead: current.data.hero_lead,
        hero_image_url: current.data.hero_image_url,
        content: current.data.content,
      },
      published_snapshot: snapshot,
      published_at: new Date().toISOString(),
      published_by: contentEditor.user.id,
      updated_by: contentEditor.user.id,
    }).eq("id", current.data.id).select(sitePageSelect).single();
    if (published.error) throw published.error;
    await addSitePageRevision(published.data as Record<string, unknown>, "published", contentEditor.user.id);
    const releaseEvent = await db.from("site_release_events").insert({
      page_id: published.data.id,
      kind: "page_published",
      status: "completed",
      metadata: { slug: published.data.slug },
      created_by: contentEditor.user.id,
    });
    if (releaseEvent.error) throw releaseEvent.error;
    return json(request, { ok: true, page: published.data });
  }

  if (request.method === "POST" && path === "/admin/content/pages") {
    const contentEditor = await requireContentEditor(request);
    if (!contentEditor.user) return json(request, { ok: false, error: contentEditor.error }, contentEditor.status);
    const values = await request.json() as JsonRecord;
    const slug = siteSlug(values.slug);
    const label = text(values.navigationLabel, 120);
    if (!slug || slug === "/" || !label) return json(request, { ok: false, error: "Укажите адрес и название новой страницы." }, 422);
    const created = await db.from("site_pages").insert({
      slug,
      navigation_label: label,
      page_title: text(values.pageTitle, 160) || `${label} | СтеклоСтройГрупп`,
      meta_description: text(values.metaDescription, 320) || `Информация о разделе «${label}» компании СтеклоСтройГрупп.`,
      canonical_path: slug,
      schema_type: "WebPage",
      template_key: "landing",
      is_in_navigation: false,
      updated_by: contentEditor.user.id,
    }).select(sitePageSelect).single();
    if (created.error) {
      if (/duplicate/i.test(created.error.message)) return json(request, { ok: false, error: "Страница с таким адресом уже существует." }, 409);
      throw created.error;
    }
    const block = await db.from("site_page_blocks").insert({
      page_id: created.data.id,
      block_key: "hero",
      block_type: "hero",
      label: "Первый экран",
      position: 0,
      data: contentBlockData({ heading: label, body: created.data.meta_description, ctaLabel: "Оставить заявку", ctaHref: "/raschet/" }),
    });
    if (block.error) throw block.error;
    await addSitePageRevision(created.data as Record<string, unknown>, "draft_saved", contentEditor.user.id);
    return json(request, { ok: true, page: created.data }, 201);
  }

  if (request.method === "POST" && path === "/admin/content/pages/duplicate") {
    const contentEditor = await requireContentEditor(request);
    if (!contentEditor.user) return json(request, { ok: false, error: contentEditor.error }, contentEditor.status);
    const values = await request.json() as JsonRecord;
    const sourceSlug = siteSlug(values.sourceSlug);
    const slug = siteSlug(values.slug);
    if (!sourceSlug || !slug || slug === "/") return json(request, { ok: false, error: "Проверьте исходную и новую страницу." }, 422);
    const source = await db.from("site_pages").select(sitePageSelect).eq("slug", sourceSlug).maybeSingle();
    if (source.error) throw source.error;
    if (!source.data) return json(request, { ok: false, error: "Исходная страница не найдена." }, 404);
    const created = await db.from("site_pages").insert({
      ...sitePageSnapshot(source.data as Record<string, unknown>),
      slug,
      navigation_label: text(values.navigationLabel, 120) || `${source.data.navigation_label} — копия`,
      canonical_path: slug,
      state: "draft",
      published_page_title: null,
      published_meta_description: null,
      published_content: null,
      published_snapshot: null,
      published_at: null,
      updated_by: contentEditor.user.id,
    }).select(sitePageSelect).single();
    if (created.error) throw created.error;
    const blocks = await db.from("site_page_blocks").select(siteBlockSelect).eq("page_id", source.data.id).order("position");
    if (blocks.error) throw blocks.error;
    if (blocks.data?.length) {
      const copied = await db.from("site_page_blocks").insert(blocks.data.map((block) => ({
        page_id: created.data.id,
        block_key: block.block_key,
        block_type: block.block_type,
        label: block.label,
        position: block.position,
        is_visible: block.is_visible,
        data: block.data,
      })));
      if (copied.error) throw copied.error;
    }
    await addSitePageRevision(created.data as Record<string, unknown>, "draft_saved", contentEditor.user.id);
    return json(request, { ok: true, page: created.data }, 201);
  }

  if (request.method === "DELETE" && path === "/admin/content/pages") {
    const admin = await requireAdmin(request);
    if (!admin.user) return json(request, { ok: false, error: admin.error }, admin.status);
    const slug = siteSlug(url.searchParams.get("slug"));
    if (!slug || slug === "/") return json(request, { ok: false, error: "Главную страницу нельзя удалить." }, 422);
    const deleted = await db.from("site_pages").delete().eq("slug", slug).select("id").maybeSingle();
    if (deleted.error) throw deleted.error;
    if (!deleted.data) return json(request, { ok: false, error: "Страница не найдена." }, 404);
    return json(request, { ok: true, deletedSlug: slug });
  }

  if (request.method === "GET" && path === "/admin/content/blocks") {
    const contentEditor = await requireContentEditor(request);
    if (!contentEditor.user) return json(request, { ok: false, error: contentEditor.error }, contentEditor.status);
    const slug = siteSlug(url.searchParams.get("slug"));
    const page = await db.from("site_pages").select("id").eq("slug", slug).maybeSingle();
    if (page.error) throw page.error;
    if (!page.data) return json(request, { ok: false, error: "Страница не найдена." }, 404);
    const blocks = await db.from("site_page_blocks").select(siteBlockSelect).eq("page_id", page.data.id).order("position");
    if (blocks.error) throw blocks.error;
    return json(request, { ok: true, blocks: blocks.data || [] });
  }

  if (request.method === "POST" && path === "/admin/content/blocks") {
    const contentEditor = await requireContentEditor(request);
    if (!contentEditor.user) return json(request, { ok: false, error: contentEditor.error }, contentEditor.status);
    const values = await request.json() as JsonRecord;
    const slug = siteSlug(values.slug);
    const type = text(values.blockType, 30);
    const page = await db.from("site_pages").select("id").eq("slug", slug).maybeSingle();
    if (page.error) throw page.error;
    if (!page.data || !["hero", "text", "image", "cards", "projects", "technology", "faq", "quote", "cta"].includes(type)) return json(request, { ok: false, error: "Проверьте страницу и тип блока." }, 422);
    const last = await db.from("site_page_blocks").select("position").eq("page_id", page.data.id).order("position", { ascending: false }).limit(1).maybeSingle();
    if (last.error) throw last.error;
    const key = blockKey(values.blockKey) || `${type}-${Date.now().toString(36)}`;
    const created = await db.from("site_page_blocks").insert({
      page_id: page.data.id,
      block_key: key,
      block_type: type,
      label: text(values.label, 120) || "Новый блок",
      position: (last.data?.position || 0) + 10,
      data: contentBlockData(values),
    }).select(siteBlockSelect).single();
    if (created.error) throw created.error;
    await markCmsPageDraft(created.data.page_id, contentEditor.user.id);
    return json(request, { ok: true, block: created.data }, 201);
  }

  if (request.method === "PUT" && path === "/admin/content/blocks/order") {
    const contentEditor = await requireContentEditor(request);
    if (!contentEditor.user) return json(request, { ok: false, error: contentEditor.error }, contentEditor.status);
    const values = await request.json() as JsonRecord;
    const slug = siteSlug(values.slug);
    const blockIds = Array.isArray(values.blockIds) ? values.blockIds.map((value) => text(value, 80)).filter(isUuid) : [];
    const page = await db.from("site_pages").select("id").eq("slug", slug).maybeSingle();
    if (page.error) throw page.error;
    if (!page.data || !blockIds.length) return json(request, { ok: false, error: "Проверьте порядок блоков." }, 422);
    const existing = await db.from("site_page_blocks").select("id").eq("page_id", page.data.id);
    if (existing.error) throw existing.error;
    if (existing.data?.length !== blockIds.length || existing.data.some((block) => !blockIds.includes(block.id))) return json(request, { ok: false, error: "Набор блоков страницы изменился. Обновите редактор." }, 409);
    for (let index = 0; index < blockIds.length; index += 1) {
      const temporary = await db.from("site_page_blocks").update({ position: 10_000 + index }).eq("id", blockIds[index]);
      if (temporary.error) throw temporary.error;
    }
    for (let index = 0; index < blockIds.length; index += 1) {
      const final = await db.from("site_page_blocks").update({ position: index * 10 }).eq("id", blockIds[index]);
      if (final.error) throw final.error;
    }
    await markCmsPageDraft(page.data.id, contentEditor.user.id);
    return json(request, { ok: true });
  }

  if (request.method === "PATCH" && segments.length === 4 && segments[0] === "admin" && segments[1] === "content" && segments[2] === "blocks" && isUuid(segments[3])) {
    const contentEditor = await requireContentEditor(request);
    if (!contentEditor.user) return json(request, { ok: false, error: contentEditor.error }, contentEditor.status);
    const values = await request.json() as JsonRecord;
    const blockType = text(values.blockType, 30);
    const update: JsonRecord = {
      label: text(values.label, 120),
      is_visible: values.isVisible !== false,
      data: contentBlockData(values),
    };
    if (["hero", "text", "image", "cards", "projects", "technology", "faq", "quote", "cta"].includes(blockType)) update.block_type = blockType;
    if (Number.isFinite(Number(values.position))) update.position = Math.max(0, Math.min(9999, Number(values.position)));
    const updated = await db.from("site_page_blocks").update(update).eq("id", segments[3]).select(siteBlockSelect).maybeSingle();
    if (updated.error) throw updated.error;
    if (!updated.data) return json(request, { ok: false, error: "Блок не найден." }, 404);
    await markCmsPageDraft(updated.data.page_id, contentEditor.user.id);
    return json(request, { ok: true, block: updated.data });
  }

  if (request.method === "DELETE" && segments.length === 4 && segments[0] === "admin" && segments[1] === "content" && segments[2] === "blocks" && isUuid(segments[3])) {
    const contentEditor = await requireContentEditor(request);
    if (!contentEditor.user) return json(request, { ok: false, error: contentEditor.error }, contentEditor.status);
    const deleted = await db.from("site_page_blocks").delete().eq("id", segments[3]).select("id,page_id").maybeSingle();
    if (deleted.error) throw deleted.error;
    if (!deleted.data) return json(request, { ok: false, error: "Блок не найден." }, 404);
    await markCmsPageDraft(deleted.data.page_id, contentEditor.user.id);
    return json(request, { ok: true });
  }

  if (request.method === "GET" && path === "/admin/content/navigation") {
    const contentEditor = await requireContentEditor(request);
    if (!contentEditor.user) return json(request, { ok: false, error: contentEditor.error }, contentEditor.status);
    const navigation = await db.from("site_navigation_items").select(siteNavigationSelect).order("location").order("position");
    if (navigation.error) throw navigation.error;
    return json(request, { ok: true, navigation: navigation.data || [] });
  }

  if (request.method === "PUT" && path === "/admin/content/navigation") {
    const contentEditor = await requireContentEditor(request);
    if (!contentEditor.user) return json(request, { ok: false, error: contentEditor.error }, contentEditor.status);
    const values = await request.json() as JsonRecord;
    const items = Array.isArray(values.items) ? values.items.slice(0, 30) : [];
    const normalized = items.map((item, index) => {
      const value = safeJson(item, 10);
      return { id: text(value.id, 80), location: text(value.location, 20) || "header", label: text(value.label, 120), href: navigationHref(value.href), position: index * 10, is_visible: value.isVisible !== false, opens_new_tab: value.opensNewTab === true };
    });
    if (normalized.some((item) => !item.id || !item.label || !item.href || !["header", "footer", "utility"].includes(item.location))) return json(request, { ok: false, error: "Проверьте пункты меню." }, 422);
    for (const item of normalized) {
      const updated = await db.from("site_navigation_items").update({ location: item.location, label: item.label, href: item.href, position: item.position, is_visible: item.is_visible, opens_new_tab: item.opens_new_tab }).eq("id", item.id);
      if (updated.error) throw updated.error;
    }
    await db.from("site_release_events").insert({ kind: "navigation_published", status: "completed", metadata: { count: normalized.length }, created_by: contentEditor.user.id });
    return json(request, { ok: true });
  }

  if (request.method === "GET" && path === "/admin/content/settings") {
    const contentEditor = await requireContentEditor(request);
    if (!contentEditor.user) return json(request, { ok: false, error: contentEditor.error }, contentEditor.status);
    const settings = await db.from("site_settings").select("setting_key,setting_value,updated_at").order("setting_key");
    if (settings.error) throw settings.error;
    return json(request, { ok: true, settings: settings.data || [] });
  }

  if (request.method === "PUT" && path === "/admin/content/settings") {
    const admin = await requireAdmin(request);
    if (!admin.user) return json(request, { ok: false, error: admin.error }, admin.status);
    const values = await request.json() as JsonRecord;
    const key = text(values.key, 80);
    if (!["brand", "contacts", "social", "default_seo", "analytics"].includes(key)) return json(request, { ok: false, error: "Этот раздел настроек недоступен." }, 422);
    const saved = await db.from("site_settings").upsert({ setting_key: key, setting_value: safeJson(values.value, 20), updated_by: admin.user.id }, { onConflict: "setting_key" }).select("setting_key,setting_value,updated_at").single();
    if (saved.error) throw saved.error;
    await db.from("site_release_events").insert({ kind: "settings_saved", status: "completed", metadata: { key }, created_by: admin.user.id });
    return json(request, { ok: true, setting: saved.data });
  }

  if (request.method === "GET" && path === "/admin/content/media") {
    const contentEditor = await requireContentEditor(request);
    if (!contentEditor.user) return json(request, { ok: false, error: contentEditor.error }, contentEditor.status);
    const result = await db.from("site_media").select("id,kind,source_url,alt_text,caption,created_at,updated_at").order("created_at", { ascending: false }).limit(100);
    if (result.error) throw result.error;
    return json(request, { ok: true, media: result.data || [] });
  }

  if (request.method === "POST" && path === "/admin/content/media") {
    const contentEditor = await requireContentEditor(request);
    if (!contentEditor.user) return json(request, { ok: false, error: contentEditor.error }, contentEditor.status);
    const values = await request.json() as JsonRecord;
    const sourceUrl = siteImageUrl(values.sourceUrl);
    const kind = text(values.kind, 20) || "image";
    if (!sourceUrl || !["image", "video", "document"].includes(kind)) return json(request, { ok: false, error: "Укажите корректный URL материала." }, 422);
    const inserted = await db.from("site_media").insert({
      kind,
      source_url: sourceUrl,
      alt_text: text(values.altText, 240),
      caption: text(values.caption, 320) || null,
      created_by: contentEditor.user.id,
    }).select("id,kind,source_url,alt_text,caption,created_at,updated_at").single();
    if (inserted.error) throw inserted.error;
    return json(request, { ok: true, media: inserted.data }, 201);
  }

  if (request.method === "GET" && path === "/admin/leads") {
    const requestedStatus = url.searchParams.get("status") || "all";
    if (requestedStatus !== "all" && !LEAD_STATUSES.includes(requestedStatus as typeof LEAD_STATUSES[number])) {
      return json(request, { ok: false, error: "Некорректный статус." }, 422);
    }
    let query = db.from("leads").select(adminLeadSelect, { count: "exact" }).order("created_at", { ascending: false }).range(0, 99);
    if (requestedStatus !== "all") query = query.eq("status", requestedStatus);
    const result = await query;
    if (result.error) throw result.error;
    return json(request, { ok: true, leads: result.data || [], total: result.count || 0 });
  }

  if (request.method === "GET" && segments.length === 3 && segments[0] === "admin" && segments[1] === "leads" && isUuid(leadId)) {
    const result = await db.from("leads")
      .select(`${adminLeadSelect},lead_events(id,kind,from_status,to_status,metadata,created_at),lead_ai_reviews(id,summary,category,priority,completeness,missing_questions,flags,manager_reply_draft,model,created_at)`)
      .eq("id", leadId).maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) return json(request, { ok: false, error: "Заявка не найдена." }, 404);
    return json(request, { ok: true, lead: result.data });
  }

  if (request.method === "PATCH" && segments.length === 4 && segments[0] === "admin" && segments[1] === "leads" && segments[3] === "status" && isUuid(leadId)) {
    const values = await request.json() as JsonRecord;
    const nextStatus = text(values.status, 30) as typeof LEAD_STATUSES[number];
    if (!LEAD_STATUSES.includes(nextStatus)) return json(request, { ok: false, error: "Некорректный статус." }, 422);
    const current = await db.from("leads").select("id,status").eq("id", leadId).maybeSingle();
    if (current.error) throw current.error;
    if (!current.data) return json(request, { ok: false, error: "Заявка не найдена." }, 404);
    if (current.data.status !== nextStatus) {
      const updated = await db.from("leads").update({ status: nextStatus }).eq("id", leadId);
      if (updated.error) throw updated.error;
      await addLeadEvent(leadId, "status_changed", {
        actor_user_id: auth.user.id,
        from_status: current.data.status,
        to_status: nextStatus,
      });
    }
    const result = await db.from("leads")
      .select(`${adminLeadSelect},lead_events(id,kind,from_status,to_status,metadata,created_at),lead_ai_reviews(id,summary,category,priority,completeness,missing_questions,flags,manager_reply_draft,model,created_at)`)
      .eq("id", leadId).single();
    if (result.error) throw result.error;
    return json(request, { ok: true, lead: result.data });
  }

  if (request.method === "GET" && segments.length === 5 && segments[0] === "admin" && segments[1] === "leads" && segments[3] === "files" && isUuid(leadId) && isUuid(segments[4])) {
    const file = await db.from("lead_files").select("bucket,object_path").eq("lead_id", leadId).eq("id", segments[4]).maybeSingle();
    if (file.error) throw file.error;
    if (!file.data) return json(request, { ok: false, error: "Файл не найден." }, 404);
    const signed = await db.storage.from(file.data.bucket).createSignedUrl(file.data.object_path, 60);
    if (signed.error || !signed.data?.signedUrl) throw signed.error || new Error("Unable to sign file");
    return json(request, { ok: true, url: signed.data.signedUrl });
  }

  return json(request, { ok: false, error: "Not found" }, 404);
}

async function chatSession(token: string) {
  if (!token || token.length > 160) return null;
  const tokenHash = await sha256(token);
  const { data } = await db.from("chat_sessions").select("id,status").eq("public_token_hash", tokenHash).maybeSingle();
  return data;
}

async function handleChatPost(request: Request) {
  const values = await request.json() as JsonRecord;
  const company = text(values.company, 160);
  if (company) return json(request, { ok: true, queued: true });
  const message = text(values.message, 1200);
  if (!message) return json(request, { ok: false, error: "Напишите вопрос." }, 422);

  const fingerprint = await requestFingerprint(request);
  let token = text(values.sessionToken, 160);
  let session = await chatSession(token);
  if (!session) {
    token = crypto.randomUUID() + crypto.randomUUID().replaceAll("-", "");
    const created = await db.from("chat_sessions").insert({
      public_token_hash: await sha256(token),
      page_url: text(values.page, 2000) || null,
      request_fingerprint: fingerprint,
      metadata: { locale: text(values.locale, 40) || "ru-BY" },
    }).select("id,status").single();
    if (created.error) throw created.error;
    session = created.data;
  }

  if (session.status !== "active") return json(request, { ok: false, error: "Диалог передан инженеру." }, 409);
  const minuteAgo = new Date(Date.now() - 60_000).toISOString();
  const recent = await db.from("chat_messages").select("id", { count: "exact", head: true })
    .eq("session_id", session.id).eq("role", "user").gte("created_at", minuteAgo);
  if ((recent.count || 0) >= 6) return json(request, { ok: false, error: "Слишком много сообщений. Подождите минуту." }, 429);

  const inserted = await db.from("chat_messages").insert({ session_id: session.id, role: "user", content: message }).select("id,created_at").single();
  if (inserted.error) throw inserted.error;
  await db.from("chat_sessions").update({ last_message_at: inserted.data.created_at }).eq("id", session.id);
  const task = await db.from("ai_tasks").insert({
    kind: "site_chat",
    chat_session_id: session.id,
    chat_message_id: inserted.data.id,
    priority: 20,
    payload: { source: "website-chat" },
  }).select("id").single();
  if (task.error) throw task.error;

  return json(request, {
    ok: true,
    queued: true,
    sessionToken: token,
    sessionId: session.id,
    messageId: inserted.data.id,
    taskId: task.data.id,
    workerOnline: await workerOnline(),
  }, 202);
}

async function handleChatGet(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("session") || "";
  const session = await chatSession(token);
  if (!session) return json(request, { ok: false, error: "Диалог не найден." }, 404);
  const result = await db.from("chat_messages")
    .select("id,role,content,metadata,created_at")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true })
    .limit(50);
  if (result.error) throw result.error;
  return json(request, { ok: true, status: session.status, workerOnline: await workerOnline(), messages: result.data });
}

async function handlePublicSiteContent(request: Request) {
  const url = new URL(request.url);
  const slug = siteSlug(url.searchParams.get("slug"));
  if (!slug) return json(request, { ok: false, error: "Некорректный адрес страницы." }, 422);
  const result = await db.from("site_pages")
    .select("id,slug,navigation_label,published_page_title,published_meta_description,published_content,published_snapshot,published_at")
    .eq("slug", slug)
    .eq("state", "published")
    .maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) return json(request, { ok: false, error: "Страница не опубликована." }, 404);
  const [blocks, navigation, settings] = await Promise.all([
    db.from("site_page_blocks").select("id,page_id,block_key,block_type,label,published_data,published_position,published_is_visible,published_at").eq("page_id", result.data.id).eq("published_is_visible", true).order("published_position"),
    db.from("site_navigation_items").select(siteNavigationSelect).eq("location", "header").eq("is_visible", true).order("position"),
    db.from("site_settings").select("setting_key,setting_value").in("setting_key", ["brand", "contacts", "social", "default_seo"]),
  ]);
  if (blocks.error) throw blocks.error;
  if (navigation.error) throw navigation.error;
  if (settings.error) throw settings.error;
  const publishedBlocks = (blocks.data || []).map((block) => ({
    id: block.id,
    page_id: block.page_id,
    block_key: block.block_key,
    block_type: block.block_type,
    label: block.label,
    position: block.published_position,
    is_visible: block.published_is_visible,
    data: block.published_data,
    published_at: block.published_at,
  }));
  return json(request, { ok: true, page: result.data, blocks: publishedBlocks, navigation: navigation.data || [], settings: settings.data || [] });
}

const handler = {
  async fetch(request: Request) {
    if (!originAllowed(request)) return json(request, { ok: false, error: "Origin is not allowed" }, 403);
    if (request.method === "OPTIONS") return new Response("ok", { headers: responseHeaders(request) });

    try {
      const path = new URL(request.url).pathname.replace(/^.*\/site-api\/?/, "/");
      if (request.method === "GET" && (path === "/" || path === "/health")) {
        return json(request, { ok: true, service: "steklostroy-site-api", workerOnline: await workerOnline() });
      }
      if (request.method === "POST" && path === "/lead") return await handleLead(request);
      if (request.method === "POST" && path === "/chat") return await handleChatPost(request);
      if (request.method === "GET" && path === "/chat") return await handleChatGet(request);
      if (request.method === "GET" && path === "/content/page") return await handlePublicSiteContent(request);
      if (path.startsWith("/admin")) return await handleAdmin(request, path);
      return json(request, { ok: false, error: "Not found" }, 404);
    } catch (error) {
      console.error(error);
      return json(request, { ok: false, error: "Сервис временно недоступен. Попробуйте ещё раз." }, 500);
    }
  },
};

export default handler;
