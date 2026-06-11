#!/usr/bin/env node
/**
 * Supabase SQL dosyası çalıştırır.
 * Gerekli env: SUPABASE_DB_URL veya SUPABASE_DB_PASSWORD (+ NEXT_PUBLIC_SUPABASE_URL)
 *
 * Örnek .env.local:
 * SUPABASE_DB_PASSWORD=your-database-password
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const { Client } = pg;

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // optional
  }
}

function getDbUrl() {
  if (process.env.SUPABASE_DB_URL) {
    return process.env.SUPABASE_DB_URL;
  }

  const password = process.env.SUPABASE_DB_PASSWORD;
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const ref = projectUrl.replace(/^https:\/\//, "").split(".")[0];
  if (!password || !ref) {
    return null;
  }

  const host = process.env.SUPABASE_DB_HOST ?? "aws-0-eu-central-1.pooler.supabase.com";
  const port = process.env.SUPABASE_DB_PORT ?? "6543";
  return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${host}:${port}/postgres`;
}

async function main() {
  loadEnvLocal();

  const file = process.argv[2];
  if (!file) {
    console.error("Kullanım: node scripts/apply-supabase-sql.mjs <sql-dosyasi>");
    process.exit(1);
  }

  const dbUrl = getDbUrl();
  if (!dbUrl) {
    console.error(
      "SUPABASE_DB_URL veya SUPABASE_DB_PASSWORD + NEXT_PUBLIC_SUPABASE_URL gerekli.",
    );
    process.exit(1);
  }

  const sql = readFileSync(resolve(process.cwd(), file), "utf8");
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query(sql);
    console.log(`OK: ${file}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
