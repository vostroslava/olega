#!/usr/bin/env node
import { execFile } from "node:child_process";
import { rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const label = "by.steklostroygroup.ai-worker";
const plistPath = path.join(os.homedir(), "Library", "LaunchAgents", `${label}.plist`);
const domain = `gui/${process.getuid()}`;
await execFileAsync("launchctl", ["bootout", domain, plistPath]).catch(() => undefined);
await rm(plistPath, { force: true });
process.stdout.write(`${JSON.stringify({ installed: false, label, plistPath }, null, 2)}\n`);
