import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PILOT_COURSE_CONTENT_EN } from "@/lib/course/pilot-course-content-en";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
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
Pilot EN course content backfill — 3 popular planning courses

Usage:
  npx tsx scripts/run-backfill-pilot-course-content-en.ts [options]

Options:
  --dry-run    Preview without writing
  --help       Show this message
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    printUsage();
    return;
  }

  const dryRun = args.includes("--dry-run");
  const root = resolve(process.cwd());
  loadEnvFile(resolve(root, ".env.local"));
  loadEnvFile(resolve(root, ".env"));

  if (!getSupabaseUrl() || !getSupabaseServiceRoleKey()) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
    process.exit(1);
  }

  const admin = getSupabaseAdmin();
  let updated = 0;
  let missing = 0;

  for (const pilot of PILOT_COURSE_CONTENT_EN) {
    const { data: row, error: fetchError } = await admin
      .from("courses_cache")
      .select("id, course_slug, title")
      .eq("course_slug", pilot.course_slug)
      .maybeSingle();

    if (fetchError) {
      console.error(`[${pilot.course_slug}] fetch failed:`, fetchError.message);
      continue;
    }

    if (!row) {
      console.warn(`[${pilot.course_slug}] not found in courses_cache — skipped`);
      missing += 1;
      continue;
    }

    const payload = {
      title_en: pilot.title_en,
      subtitle_en: pilot.subtitle_en,
      description_md_en: pilot.description_md_en,
      what_will_learn_en: pilot.what_will_learn_en ?? null,
      target_audience_en: pilot.target_audience_en ?? null,
      updated_at: new Date().toISOString(),
    };

    if (dryRun) {
      console.log(`[dry-run] ${pilot.course_slug}`);
      console.log(`  TR title: ${row.title}`);
      console.log(`  EN title: ${pilot.title_en}`);
      updated += 1;
      continue;
    }

    const { error: updateError } = await admin
      .from("courses_cache")
      .update(payload)
      .eq("id", row.id);

    if (updateError) {
      console.error(`[${pilot.course_slug}] update failed:`, updateError.message);
      continue;
    }

    console.log(`✓ ${pilot.course_slug}`);
    updated += 1;
  }

  console.log(
    `\nDone: ${updated} updated, ${missing} missing${dryRun ? " (dry-run)" : ""}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
