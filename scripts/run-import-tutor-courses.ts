import { resolve } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import {
  importAllTutorCoursesToAcademy,
  importTutorCourseToAcademy,
} from "@/lib/tutor/import-courses-to-academy";

function loadEnvFile(filePath: string): void {
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

function printUsage(): void {
  console.log(`
Tutor → Academy müfredat import

Kullanım:
  npx tsx scripts/run-import-tutor-courses.ts --course-id 123
  npx tsx scripts/run-import-tutor-courses.ts --all
  npx tsx scripts/run-import-tutor-courses.ts --all --limit 10
  npx tsx scripts/run-import-tutor-courses.ts --all --dry-run
  npx tsx scripts/run-import-tutor-courses.ts --all --force

Seçenekler:
  --course-id <wp_id>   Tek WP/Tutor kursu import et
  --all                 Tüm katalog (veya --limit ile)
  --limit <n>           En fazla n kurs
  --dry-run             Yazmadan özet göster
  --force               Mevcut dersleri atlamadan yeniden import
  --no-sync             Önce sync-stats çalıştırma (--all)
`);
}

function parseArgs(argv: string[]) {
  const options = {
    courseId: null as number | null,
    all: false,
    limit: undefined as number | undefined,
    dryRun: false,
    skipIfHasLessons: true,
    syncCatalogFirst: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--course-id") {
      options.courseId = parseInt(argv[i + 1] ?? "", 10);
      i += 1;
    } else if (arg === "--all") {
      options.all = true;
    } else if (arg === "--limit") {
      options.limit = parseInt(argv[i + 1] ?? "", 10);
      i += 1;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--force") {
      options.skipIfHasLessons = false;
    } else if (arg === "--no-sync") {
      options.syncCatalogFirst = false;
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
  }

  return options;
}

function requireEnv(): void {
  const missing: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() &&
    !process.env.SUPABASE_SECRET_KEY?.trim()
  ) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY");
  }

  if (!process.env.TUTOR_CONSUMER_KEY?.trim()) {
    missing.push("TUTOR_CONSUMER_KEY");
  }

  if (!process.env.TUTOR_CONSUMER_SECRET?.trim()) {
    missing.push("TUTOR_CONSUMER_SECRET");
  }

  if (missing.length > 0) {
    console.error("Eksik ortam değişkenleri:", missing.join(", "));
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (!args.all && !args.courseId) {
    printUsage();
    process.exit(1);
  }

  requireEnv();

  if (args.courseId) {
    const result = await importTutorCourseToAcademy({
      wpCourseId: args.courseId,
      dryRun: args.dryRun,
      skipIfHasLessons: args.skipIfHasLessons,
    });
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.error ? 1 : 0);
  }

  const summary = await importAllTutorCoursesToAcademy({
    limit: args.limit,
    dryRun: args.dryRun,
    skipIfHasLessons: args.skipIfHasLessons,
    syncCatalogFirst: args.syncCatalogFirst,
  });

  console.log(
    `\nImport özeti: total=${summary.total} imported=${summary.imported} skipped=${summary.skipped} failed=${summary.failed} dryRun=${summary.dryRun}`,
  );

  for (const result of summary.results) {
    if (result.error) {
      console.log(
        `✗ ${result.wpCourseId} ${result.title ?? ""} → ${result.error}`,
      );
    } else if (result.skipped) {
      console.log(
        `○ ${result.wpCourseId} ${result.title ?? ""} → atlandı (${result.skipReason})`,
      );
    } else {
      console.log(
        `✓ ${result.wpCourseId} ${result.title ?? ""} → ${result.sectionsUpserted} bölüm, ${result.lessonsUpserted} ders`,
      );
    }
  }

  process.exit(summary.failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
