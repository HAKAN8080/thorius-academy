#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const baseUrl =
  process.env.DAY1_CHECK_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";

const secret = process.env.CRON_SECRET;

if (!secret) {
  console.error("CRON_SECRET tanımlı değil (.env.local).");
  process.exit(1);
}

const url = `${baseUrl.replace(/\/$/, "")}/api/instructor/day1-check?secret=${encodeURIComponent(secret)}`;

console.log(`Gün 1 kontrolü: ${url.replace(secret, "***")}\n`);

const response = await fetch(url, { cache: "no-store" });
const report = await response.json().catch(() => null);

if (!report || typeof report !== "object") {
  console.error("Geçersiz yanıt:", response.status, await response.text());
  process.exit(1);
}

console.log(`Durum: ${report.ok ? "✅ GEÇTİ" : "❌ BAŞARISIZ"}`);
console.log(`Zaman: ${report.checkedAt}`);
console.log(
  `Özet: ${report.summary.pass} geçti, ${report.summary.warn} uyarı, ${report.summary.fail} hata\n`,
);

for (const check of report.checks ?? []) {
  const icon =
    check.status === "pass" ? "✅" : check.status === "warn" ? "⚠️" : "❌";
  console.log(`${icon} ${check.label}${check.detail ? ` — ${check.detail}` : ""}`);
}

if (report.manualSteps?.length) {
  console.log("\nManuel smoke test:");
  for (const [index, step] of report.manualSteps.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
}

process.exit(report.ok ? 0 : 1);
