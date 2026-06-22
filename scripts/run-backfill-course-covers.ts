import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { backfillCourseCovers } from "@/lib/course/backfill-course-covers";
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
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
    if (!process.env[key]) process.env[key] = value;
  }
}

function printUsage(): void {
  console.log(`
Kapak görseli backfill — WordPress / YouTube → courses_cache.cover_image_url

Kullanım:
  npm run backfill:covers -- [seçenekler]

Seçenekler:
  --dry-run       Yazmadan önizleme
  --force         Mevcut kapak olsa bile WP'den yeniden yazar
  --limit=N       En fazla N kurs işle
  --help          Bu metni göster

Örnek:
  npm run backfill:covers -- --dry-run
  npm run backfill:covers
`);
}

function parseLimit(args: string[]): number | undefined {
  const limitArg = args.find((arg) => arg.startsWith("--limit="));
  if (!limitArg) {
    return undefined;
  }
  const parsed = Number.parseInt(limitArg.slice("--limit=".length), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    return;
  }

  if (!getSupabaseUrl() || !getSupabaseServiceRoleKey()) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY (veya SUPABASE_SECRET_KEY) gerekli (.env.local)",
    );
    process.exit(1);
  }

  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");
  const limit = parseLimit(args);

  console.log(
    `[backfill-covers] Başlıyor${dryRun ? " (dry-run)" : ""}${force ? " (force)" : ""}…`,
  );

  const result = await backfillCourseCovers({ dryRun, force, limit });

  console.log("");
  console.log("Özet:");
  console.log(`  Taranan (yayında):     ${result.scanned}`);
  console.log(`  Aday (güncellenecek):  ${result.candidates}`);
  console.log(`  WP'den çözümlenen:     ${result.resolved}`);
  console.log(`  ${dryRun ? "Güncellenecek" : "Güncellenen"}:          ${result.updated}`);
  console.log(`  Değişmedi (atlandı):   ${result.skipped}`);

  if (result.unresolved.length > 0) {
    console.log(`  Çözülemedi (${result.unresolved.length}):`);
    for (const slug of result.unresolved.slice(0, 20)) {
      console.log(`    - ${slug}`);
    }
    if (result.unresolved.length > 20) {
      console.log(`    … +${result.unresolved.length - 20} daha`);
    }
  }

  if (dryRun && result.updated > 0) {
    console.log("");
    console.log("Gerçek yazma için: npm run backfill:covers");
  }

  if (!dryRun && result.updated > 0) {
    console.log("");
    console.log(
      "Ana sayfa önbelleği en geç 1 saat içinde yenilenir; hemen görmek için redeploy veya cache bust gerekebilir.",
    );
  }
}

main().catch((error) => {
  console.error("[backfill-covers] Hata:", error);
  process.exit(1);
});
