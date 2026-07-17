// Upload a generated audiobook (mp3 + word-timing json per chapter) to the
// private `audiobook-files` bucket and write a manifest.json for the reader.
//
// Usage:
//   node --env-file=.env.local scripts/upload-audiobook.mjs <book-slug> <output-dir>
//   node --env-file=.env.local scripts/upload-audiobook.mjs pofi-s-friends ThoriusAcademy/pofis-friends-audiobook/output

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "audiobook-files";

const [slug, dir] = process.argv.slice(2);
if (!slug || !dir) {
  console.error("Usage: upload-audiobook.mjs <book-slug> <output-dir>");
  process.exit(1);
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function ensureBucket() {
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await admin.storage.createBucket(BUCKET, {
      public: false,
    });
    if (error) throw new Error(`Bucket olusturulamadi: ${error.message}`);
    console.log(`Bucket olusturuldu: ${BUCKET}`);
  }
}

async function main() {
  await ensureBucket();

  const files = (await readdir(dir)).filter((f) =>
    /^chapter_\d{2}\.(mp3|json)$/.test(f),
  );
  if (!files.length) {
    console.error("Klasorde chapter_XX.mp3/json bulunamadi:", dir);
    process.exit(1);
  }

  const chapters = [];

  for (const file of files.sort()) {
    const buffer = await readFile(path.join(dir, file));
    const dest = `${slug}/${file}`;
    const contentType = file.endsWith(".mp3") ? "audio/mpeg" : "application/json";

    const { error } = await admin.storage
      .from(BUCKET)
      .upload(dest, buffer, { contentType, upsert: true });
    if (error) throw new Error(`${file} yuklenemedi: ${error.message}`);
    console.log(`yuklendi: ${dest} (${(buffer.length / 1024).toFixed(0)} KB)`);

    if (file.endsWith(".json")) {
      const data = JSON.parse(buffer.toString("utf-8"));
      const last = data.words?.[data.words.length - 1];
      chapters.push({
        number: data.chapter,
        title: data.title,
        durationSec: last
          ? Math.round((last.startMs + last.durationMs) / 1000)
          : 0,
      });
    }
  }

  chapters.sort((a, b) => a.number - b.number);
  const manifest = {
    slug,
    generatedAt: new Date().toISOString(),
    chapterCount: chapters.length,
    totalDurationSec: chapters.reduce((s, c) => s + c.durationSec, 0),
    chapters,
  };

  const { error: mErr } = await admin.storage
    .from(BUCKET)
    .upload(`${slug}/manifest.json`, JSON.stringify(manifest, null, 1), {
      contentType: "application/json",
      upsert: true,
    });
  if (mErr) throw new Error(`manifest yuklenemedi: ${mErr.message}`);

  console.log(
    `\nTamam: ${chapters.length} bolum, toplam ${(manifest.totalDurationSec / 60).toFixed(0)} dk -> ${BUCKET}/${slug}/`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
