#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { runCodexTask } from "./codex-analysis.mjs";

const { Pool } = pg;
const sourceRoot = fileURLToPath(new URL("../", import.meta.url));
const runtimeRoot = process.env.STEKLOSTROY_WORKER_RUNTIME || path.join(os.homedir(), "Library", "Application Support", "StekloStroyGroup", "ai-worker");
const stagingRoot = path.join(runtimeRoot, "runtime", "tasks");
const knowledgePath = path.join(sourceRoot, "knowledge", "site-knowledge.md");
const caPath = path.join(sourceRoot, "certs", "supabase-ca.crt");
const workerKey = (process.env.STEKLOSTROY_WORKER_KEY || os.hostname() || "steklostroy-mac").replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 120);
const workerName = process.env.STEKLOSTROY_WORKER_NAME || "Mac Codex subscription worker";
const watch = process.argv.includes("--watch");
const once = process.argv.includes("--once");
let stopping = false;

process.once("SIGINT", () => { stopping = true; });
process.once("SIGTERM", () => { stopping = true; });

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  return execFileSync("/usr/bin/security", [
    "find-generic-password",
    "-a",
    "steklostroygroup",
    "-s",
    "ai.steklostroy.database-url",
    "-w",
  ], { encoding: "utf8" }).trim();
}

const parsedDatabaseUrl = new URL(databaseUrl());
parsedDatabaseUrl.searchParams.delete("sslmode");
const pool = new Pool({
  connectionString: parsedDatabaseUrl.toString(),
  max: 4,
  application_name: "steklostroy-local-ai-worker",
  ssl: {
    ca: await readFile(caPath, "utf8"),
    rejectUnauthorized: true,
  },
});

function compactError(error) {
  return String(error?.message || error || "Unknown worker error")
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[database-url-redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, "Bearer [redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1_000);
}

async function heartbeat(state = "online", task = null, error = null) {
  await pool.query(`
    insert into public.worker_heartbeats (worker_key,worker_name,state,current_task_id,metadata,last_seen_at,updated_at)
    values ($1,$2,$3,$4,$5::jsonb,now(),now())
    on conflict (worker_key) do update
      set worker_name=excluded.worker_name,
          state=excluded.state,
          current_task_id=excluded.current_task_id,
          metadata=excluded.metadata,
          last_seen_at=now(),
          updated_at=now()
  `, [workerKey, workerName, state, task?.id || null, JSON.stringify(error ? { error: compactError(error) } : { pid: process.pid, host: os.hostname() })]);
}

async function claimTask() {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await client.query(`
      select *
      from public.ai_tasks
      where next_attempt_at <= now()
        and (
          state = 'queued'
          or (state in ('leased','running') and lease_expires_at < now())
        )
      order by priority asc, created_at asc
      for update skip locked
      limit 1
    `);
    const task = result.rows[0];
    if (!task) {
      await client.query("rollback");
      return null;
    }
    const recovered = task.state !== "queued";
    const updated = await client.query(`
      update public.ai_tasks
      set state='leased',
          attempt_number=case when state='queued' then attempt_number else least(3,attempt_number+1) end,
          leased_by=$2,
          lease_expires_at=now()+interval '5 minutes',
          heartbeat_at=now(),
          updated_at=now()
      where id=$1
      returning *
    `, [task.id, workerKey]);
    await client.query("commit");
    return { ...updated.rows[0], recovered };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function leadSnapshot(task) {
  const lead = await pool.query(`select * from public.leads where id=$1`, [task.lead_id]);
  if (!lead.rows[0]) throw new Error("Lead not found");
  const files = await pool.query(`
    select original_name,mime_type,byte_size
    from public.lead_files
    where lead_id=$1
    order by created_at
  `, [task.lead_id]);
  return { ...lead.rows[0], files: files.rows };
}

async function completeLead(task, output) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(`
      insert into public.lead_ai_reviews
        (lead_id,ai_task_id,summary,category,priority,completeness,missing_questions,flags,manager_reply_draft,model)
      values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10)
      on conflict (ai_task_id) do nothing
    `, [
      task.lead_id,
      task.id,
      output.summary,
      output.category,
      output.priority,
      output.completeness,
      JSON.stringify(output.missingQuestions || []),
      JSON.stringify(output.flags || []),
      output.managerReplyDraft,
      process.env.STEKLOSTROY_CODEX_MODEL || "codex-default",
    ]);
    await client.query(`update public.leads set status='reviewed' where id=$1 and status='new'`, [task.lead_id]);
    await client.query(`
      update public.ai_tasks
      set state='completed',output=$2::jsonb,completed_at=now(),lease_expires_at=null,heartbeat_at=now(),updated_at=now()
      where id=$1
    `, [task.id, JSON.stringify(output)]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

function notifyLead(output) {
  const priority = ["low", "normal", "high", "urgent"].includes(output.priority) ? output.priority : "normal";
  try {
    execFileSync("/usr/bin/osascript", [
      "-e",
      `display notification "Откройте заявку и AI-разбор в Supabase." with title "СтеклоСтройГрупп" subtitle "Новая заявка · ${priority}"`,
    ], { stdio: "ignore", timeout: 5_000 });
  } catch {
    // Notifications are helpful but must never affect durable lead processing.
  }
}

async function chatHistory(task) {
  const result = await pool.query(`
    select role,content,created_at
    from public.chat_messages
    where session_id=$1
    order by created_at desc,id desc
    limit 20
  `, [task.chat_session_id]);
  return result.rows.reverse();
}

async function completeChat(task, output) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const message = await client.query(`
      insert into public.chat_messages (session_id,role,content,metadata)
      values ($1,'assistant',$2,$3::jsonb)
      returning created_at
    `, [task.chat_session_id, output.answer, JSON.stringify({
      intent: output.intent,
      confidence: output.confidence,
      suggestedQuestions: output.suggestedQuestions || [],
      ai: true,
    })]);
    await client.query(`
      update public.chat_sessions
      set status=case when $2 then 'escalated'::public.chat_session_status else status end,
          last_message_at=$3
      where id=$1
    `, [task.chat_session_id, Boolean(output.escalate), message.rows[0].created_at]);
    await client.query(`
      update public.ai_tasks
      set state='completed',output=$2::jsonb,completed_at=now(),lease_expires_at=null,heartbeat_at=now(),updated_at=now()
      where id=$1
    `, [task.id, JSON.stringify(output)]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

function shouldRetry(error, attemptNumber) {
  if (attemptNumber >= 3) return false;
  const message = compactError(error).toLowerCase();
  if (/auth|unauthori|forbidden|quota|billing|subscription|invalid.*schema/.test(message)) return false;
  return true;
}

async function failTask(task, error) {
  const message = compactError(error);
  const retry = shouldRetry(error, Number(task.attempt_number || 1));
  const delaySeconds = Number(task.attempt_number || 1) <= 1 ? 30 : 120;
  await pool.query(`
    update public.ai_tasks
    set state=$2,
        attempt_number=case when $2='queued' then least(3,attempt_number+1) else attempt_number end,
        next_attempt_at=case when $2='queued' then now()+make_interval(secs=>$3) else next_attempt_at end,
        lease_expires_at=null,
        error_code='CODEX_TASK_FAILED',
        error_message=$4,
        completed_at=case when $2='needs_human' then now() else null end,
        updated_at=now()
    where id=$1
  `, [task.id, retry ? "queued" : "needs_human", delaySeconds, message]);

  if (!retry && task.kind === "site_chat") {
    await pool.query(`
      insert into public.chat_messages (session_id,role,content,metadata)
      values ($1,'assistant',$2,$3::jsonb)
    `, [
      task.chat_session_id,
      "Сейчас не получилось подготовить надёжный ответ. Передам вопрос инженеру — оставьте телефон в форме расчёта или позвоните по номеру +375 33 300 08 18.",
      JSON.stringify({ ai: true, fallback: true }),
    ]);
    await pool.query(`update public.chat_sessions set status='escalated',last_message_at=now() where id=$1`, [task.chat_session_id]);
  }
}

async function processTask(task) {
  const directory = path.join(stagingRoot, `${task.kind}-${task.id}`);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await pool.query(`
    update public.ai_tasks
    set state='running',started_at=coalesce(started_at,now()),heartbeat_at=now(),lease_expires_at=now()+interval '5 minutes',updated_at=now()
    where id=$1
  `, [task.id]);
  await heartbeat("busy", task);
  const pulse = setInterval(() => {
    pool.query(`update public.ai_tasks set heartbeat_at=now(),lease_expires_at=now()+interval '5 minutes',updated_at=now() where id=$1 and state='running'`, [task.id]).catch(() => undefined);
    heartbeat("busy", task).catch(() => undefined);
  }, 30_000);
  pulse.unref();

  try {
    if (task.kind === "lead_intake") {
      const snapshot = await leadSnapshot(task);
      const output = await runCodexTask({ task: { ...task, snapshot }, stagingDirectory: directory });
      await completeLead(task, output);
      notifyLead(output);
    } else if (task.kind === "site_chat") {
      const [knowledge, history] = await Promise.all([readFile(knowledgePath, "utf8"), chatHistory(task)]);
      const output = await runCodexTask({ task, stagingDirectory: directory, knowledge, history });
      await completeChat(task, output);
    } else {
      throw new Error(`Unsupported task kind: ${task.kind}`);
    }
    await heartbeat("online");
    return { processed: true, taskId: task.id, kind: task.kind, state: "completed" };
  } catch (error) {
    await failTask(task, error);
    await heartbeat("error", task, error).catch(() => undefined);
    return { processed: true, taskId: task.id, kind: task.kind, state: "failed", error: compactError(error) };
  } finally {
    clearInterval(pulse);
    await rm(directory, { recursive: true, force: true });
  }
}

async function processOne() {
  const task = await claimTask();
  if (!task) return { processed: false, reason: "empty" };
  return processTask(task);
}

await mkdir(stagingRoot, { recursive: true, mode: 0o700 });
await heartbeat("online");
const heartbeatTimer = setInterval(() => heartbeat("online").catch(() => undefined), 30_000);
heartbeatTimer.unref();

try {
  if (once || !watch) {
    process.stdout.write(`${JSON.stringify(await processOne())}\n`);
  } else {
    while (!stopping) {
      const result = await processOne();
      if (result.processed) process.stdout.write(`${JSON.stringify(result)}\n`);
      await new Promise((resolve) => setTimeout(resolve, result.processed ? 250 : 3_000));
    }
  }
} finally {
  clearInterval(heartbeatTimer);
  await heartbeat("offline").catch(() => undefined);
  await pool.end();
}
