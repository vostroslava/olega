#!/usr/bin/env node
import { execFile } from "node:child_process";
import { access, chmod, copyFile, mkdir, realpath, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const sourceRoot = fileURLToPath(new URL("./", import.meta.url));
const label = "by.steklostroygroup.ai-worker";
const launchAgents = path.join(os.homedir(), "Library", "LaunchAgents");
const plistPath = path.join(launchAgents, `${label}.plist`);
const logs = path.join(os.homedir(), "Library", "Logs", "StekloStroyGroup");
const applicationSupport = path.join(os.homedir(), "Library", "Application Support", "StekloStroyGroup");
const runtimeRoot = path.join(applicationSupport, "ai-worker");
const runtimeBinDir = path.join(applicationSupport, "bin");
const runtimeCodex = path.join(runtimeBinDir, "codex");
const runtimeWorker = path.join(runtimeRoot, "src", "worker.mjs");

async function findCodex() {
  const preferred = process.env.STEKLOSTROY_CODEX_BIN || path.join(os.homedir(), ".local", "bin", "codex");
  await access(preferred);
  const status = await execFileAsync(preferred, ["login", "status"], { env: { ...process.env, HOME: os.homedir() } });
  if (!/Logged in using ChatGPT/i.test(`${status.stdout}\n${status.stderr}`)) {
    throw new Error("Codex CLI должен быть авторизован через ChatGPT");
  }
  return preferred;
}

async function checkDatabaseKeychain() {
  await execFileAsync("/usr/bin/security", [
    "find-generic-password",
    "-a",
    "steklostroygroup",
    "-s",
    "ai.steklostroy.database-url",
    "-w",
  ]);
}

async function installRuntime(codexSource) {
  const stagingRoot = `${runtimeRoot}.installing-${process.pid}`;
  await rm(stagingRoot, { recursive: true, force: true });
  try {
    await Promise.all([
      mkdir(path.join(stagingRoot, "src"), { recursive: true }),
      mkdir(path.join(stagingRoot, "knowledge"), { recursive: true }),
      mkdir(path.join(stagingRoot, "certs"), { recursive: true }),
      mkdir(runtimeBinDir, { recursive: true }),
    ]);
    await Promise.all([
      copyFile(path.join(sourceRoot, "src", "worker.mjs"), path.join(stagingRoot, "src", "worker.mjs")),
      copyFile(path.join(sourceRoot, "src", "codex-analysis.mjs"), path.join(stagingRoot, "src", "codex-analysis.mjs")),
      copyFile(path.join(sourceRoot, "knowledge", "site-knowledge.md"), path.join(stagingRoot, "knowledge", "site-knowledge.md")),
      copyFile(path.join(sourceRoot, "certs", "supabase-ca.crt"), path.join(stagingRoot, "certs", "supabase-ca.crt")),
      copyFile(path.join(sourceRoot, "package.json"), path.join(stagingRoot, "package.json")),
      copyFile(path.join(sourceRoot, "package-lock.json"), path.join(stagingRoot, "package-lock.json")),
    ]);
    await execFileAsync("/usr/bin/env", ["npm", "ci", "--omit=dev", "--no-audit", "--no-fund", "--ignore-scripts"], {
      cwd: stagingRoot,
      env: { ...process.env, PATH: `/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ""}` },
      maxBuffer: 10 * 1024 * 1024,
    });
    await rm(runtimeRoot, { recursive: true, force: true });
    await rename(stagingRoot, runtimeRoot);
  } catch (error) {
    await rm(stagingRoot, { recursive: true, force: true });
    throw error;
  }

  const resolvedCodex = await realpath(codexSource);
  if (resolvedCodex !== runtimeCodex) await copyFile(resolvedCodex, runtimeCodex);
  await chmod(runtimeCodex, 0o755);
  await execFileAsync("/usr/bin/xattr", ["-d", "com.apple.quarantine", runtimeCodex]).catch(() => undefined);
}

function xml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

await Promise.all([mkdir(launchAgents, { recursive: true }), mkdir(logs, { recursive: true })]);
await checkDatabaseKeychain();
const codexSource = await findCodex();
await installRuntime(codexSource);

const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>${label}</string>
  <key>ProgramArguments</key><array>
    <string>${xml(process.execPath)}</string>
    <string>${xml(runtimeWorker)}</string>
    <string>--watch</string>
  </array>
  <key>WorkingDirectory</key><string>${xml(runtimeRoot)}</string>
  <key>EnvironmentVariables</key><dict>
    <key>HOME</key><string>${xml(os.homedir())}</string>
    <key>STEKLOSTROY_CODEX_BIN</key><string>${xml(runtimeCodex)}</string>
    <key>STEKLOSTROY_CHAT_MODEL</key><string>gpt-5.6-luna</string>
    <key>STEKLOSTROY_CHAT_REASONING_EFFORT</key><string>low</string>
    <key>STEKLOSTROY_WORKER_RUNTIME</key><string>${xml(runtimeRoot)}</string>
    <key>PATH</key><string>${xml(`${path.dirname(runtimeCodex)}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin`)}</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>10</integer>
  <key>ProcessType</key><string>Background</string>
  <key>StandardOutPath</key><string>${xml(path.join(logs, "ai-worker.log"))}</string>
  <key>StandardErrorPath</key><string>${xml(path.join(logs, "ai-worker.error.log"))}</string>
</dict></plist>
`;

await writeFile(plistPath, plist, { mode: 0o600 });
const domain = `gui/${process.getuid()}`;
await execFileAsync("launchctl", ["bootout", domain, plistPath]).catch(() => undefined);
await execFileAsync("launchctl", ["bootstrap", domain, plistPath]);
await execFileAsync("launchctl", ["enable", `${domain}/${label}`]);
process.stdout.write(`${JSON.stringify({ installed: true, label, plistPath, runtimeRoot, runtimeWorker, runtimeCodex, logs }, null, 2)}\n`);
