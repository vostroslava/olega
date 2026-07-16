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

function adminEmails() {
  return new Set(
    (Deno.env.get("SITE_ADMIN_EMAILS") || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

async function requireAdmin(request: Request) {
  const allowedEmails = adminEmails();
  if (allowedEmails.size === 0) return { user: null, status: 503, error: "Админ-контур ещё не настроен." };

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return { user: null, status: 401, error: "Требуется вход." };

  const { data, error } = await db.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !data.user || !email || !allowedEmails.has(email)) {
    return { user: null, status: 403, error: "Недостаточно прав для этого контура." };
  }
  return { user: data.user, status: 200, error: "" };
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
  const auth = await requireAdmin(request);
  if (!auth.user) return json(request, { ok: false, error: auth.error }, auth.status);

  const url = new URL(request.url);
  const segments = path.split("/").filter(Boolean);
  const leadId = segments[2] || "";

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
      if (path.startsWith("/admin")) return await handleAdmin(request, path);
      return json(request, { ok: false, error: "Not found" }, 404);
    } catch (error) {
      console.error(error);
      return json(request, { ok: false, error: "Сервис временно недоступен. Попробуйте ещё раз." }, 500);
    }
  },
};

export default handler;
