// Upload audiobook chapter mp3/json + manifest to Bunny Storage.
//
// Usage:
//   node --env-file=.env.local scripts/upload-audiobook-bunny.mjs <book-slug> <output-dir>
//   node --env-file=.env.local scripts/upload-audiobook-bunny.mjs aurora ThoriusAcademy/aurora-audiobook/output_v2

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const [slug, dir] = process.argv.slice(2);
if (!slug || !dir) {
  console.error("Usage: upload-audiobook-bunny.mjs <book-slug> <output-dir>");
  process.exit(1);
}

const zone = process.env.BUNNY_STORAGE_ZONE_NAME?.trim();
const hostname =
  process.env.BUNNY_STORAGE_HOSTNAME?.trim() || "uk.storage.bunnycdn.com";
const password = process.env.BUNNY_STORAGE_PASSWORD?.trim();
const remotePrefix = `kitaplik/${slug}`;

if (!zone || !password) {
  console.error(
    "BUNNY_STORAGE_ZONE_NAME and BUNNY_STORAGE_PASSWORD required in .env.local",
  );
  process.exit(1);
}

async function uploadBuffer(filename, buffer, contentType) {
  const url = `https://${hostname}/${zone}/${remotePrefix}/${filename}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: password,
      "Content-Type": contentType,
    },
    body: buffer,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `${filename} failed HTTP ${response.status}: ${text.slice(0, 200)}`,
    );
  }
}

async function main() {
  const files = (await readdir(dir)).filter(
    (f) =>
      /^chapter_\d{2}\.(mp3|json)$/.test(f) || f === "manifest.json",
  );
  if (!files.length) {
    console.error("No chapter_XX.mp3/json or manifest.json in", dir);
    process.exit(1);
  }

  let ok = 0;
  const sorted = files.sort((a, b) => {
    if (a === "manifest.json") return 1;
    if (b === "manifest.json") return -1;
    return a.localeCompare(b);
  });

  for (const file of sorted) {
    const buffer = await readFile(path.join(dir, file));
    const contentType = file.endsWith(".mp3")
      ? "audio/mpeg"
      : "application/json";
    process.stdout.write(
      `uploading ${file} (${(buffer.length / 1024 / 1024).toFixed(1)} MB)... `,
    );
    await uploadBuffer(file, buffer, contentType);
    ok += 1;
    console.log("ok");
  }

  const cdnBase =
    process.env.NEXT_PUBLIC_AUDIOBOOK_CDN_BASE_URL?.replace(/\/$/, "") ||
    "(set NEXT_PUBLIC_AUDIOBOOK_CDN_BASE_URL)";
  console.log(`\nDone: ${ok}/${sorted.length} files -> ${zone}/${remotePrefix}/`);
  console.log(`Example CDN: ${cdnBase}/${slug}/chapter_00.mp3`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
