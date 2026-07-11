import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PILOT_CURRICULUM_CONTENT_EN } from "@/lib/course/pilot-curriculum-content-en";
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

async function ensureCurriculumColumns(): Promise<void> {
  const admin = getSupabaseAdmin();
  // Probe: select title_en; if column missing, instruct manual migration
  const { error } = await admin.from("sections").select("title_en").limit(1);
  if (error?.message?.includes("title_en")) {
    console.error(
      "Missing title_en columns. Run supabase/manual/20260711110000_curriculum_content_i18n_phase2.sql first.",
    );
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const root = resolve(process.cwd());
  loadEnvFile(resolve(root, ".env.local"));
  loadEnvFile(resolve(root, ".env"));

  if (!getSupabaseUrl() || !getSupabaseServiceRoleKey()) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  await ensureCurriculumColumns();
  const admin = getSupabaseAdmin();

  let sectionUpdates = 0;
  let lessonUpdates = 0;

  for (const pilot of PILOT_CURRICULUM_CONTENT_EN) {
    const { data: course } = await admin
      .from("courses_cache")
      .select("id")
      .eq("course_slug", pilot.course_slug)
      .maybeSingle();

    if (!course?.id) {
      console.warn(`[${pilot.course_slug}] course not found`);
      continue;
    }

    const { data: sections } = await admin
      .from("sections")
      .select("id, title")
      .eq("course_id", course.id);

    for (const section of sections ?? []) {
      const trTitle = section.title?.trim();
      const titleEn = trTitle ? pilot.sections[trTitle] : undefined;
      if (!titleEn) {
        if (trTitle) {
          console.warn(`  section missing EN map: "${trTitle}"`);
        }
        continue;
      }

      if (dryRun) {
        console.log(`[dry-run] section: ${trTitle} → ${titleEn}`);
      } else {
        await admin
          .from("sections")
          .update({ title_en: titleEn })
          .eq("id", section.id);
      }
      sectionUpdates += 1;
    }

    const { data: lessons } = await admin
      .from("lessons")
      .select("id, title")
      .eq("courses_cache_id", course.id);

    for (const lesson of lessons ?? []) {
      const trTitle = lesson.title?.trim();
      const titleEn = trTitle ? pilot.lessons[trTitle] : undefined;
      if (!titleEn) {
        if (trTitle) {
          console.warn(`  lesson missing EN map: "${trTitle}"`);
        }
        continue;
      }

      if (dryRun) {
        console.log(`[dry-run] lesson: ${trTitle} → ${titleEn}`);
      } else {
        await admin
          .from("lessons")
          .update({ title_en: titleEn })
          .eq("id", lesson.id);
      }
      lessonUpdates += 1;
    }

    console.log(`✓ ${pilot.course_slug}`);
  }

  console.log(
    `\nDone: ${sectionUpdates} sections, ${lessonUpdates} lessons${dryRun ? " (dry-run)" : ""}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
