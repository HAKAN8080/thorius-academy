#!/usr/bin/env node
/**
 * profile-media Supabase Storage bucket oluşturur (service role).
 * Gerekli: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (.env.local)
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET_ID = "profile-media";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
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
  } catch {
    // optional
  }
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  )?.trim();

  if (!url || !serviceKey) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY (veya SUPABASE_SECRET_KEY) gerekli.",
    );
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) {
    console.error("Bucket listesi alınamadı:", listError.message);
    process.exit(1);
  }

  const existing = (buckets ?? []).find((bucket) => bucket.id === BUCKET_ID);
  if (existing) {
    console.log(`OK: "${BUCKET_ID}" bucket zaten var (public=${existing.public}).`);
    return;
  }

  const { error: createError } = await admin.storage.createBucket(BUCKET_ID, {
    public: true,
    fileSizeLimit: 512 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });

  if (createError) {
    console.error("Bucket oluşturulamadı:", createError.message);
    process.exit(1);
  }

  console.log(`OK: "${BUCKET_ID}" bucket oluşturuldu (public, 512 KB, image/jpeg|png|webp).`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
