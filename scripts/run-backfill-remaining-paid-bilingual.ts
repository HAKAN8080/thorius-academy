import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getCategoryCurriculumI18n } from "@/lib/course/category-curriculum-registry";
import { toCoursesCacheSubtitleLanguageDbValue } from "@/lib/course/course-language";
import type { PlanlamaCategoryCourseContent } from "@/lib/course/planlama-category-content";
import { REMAINING_PAID_CATEGORY_CONTENT } from "@/lib/course/remaining-paid-category-content";
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

function isEmpty(value: string | null | undefined): boolean {
  return !value?.trim();
}

function looksEnglish(text: string): boolean {
  const sample = text.slice(0, 120);
  const latin = (sample.match(/[A-Za-z]/g) ?? []).length;
  const turkish = (sample.match(/[çğıöşüÇĞİÖŞÜ]/g) ?? []).length;
  return latin > 20 && turkish === 0;
}

function normalizeApostrophe(value: string): string {
  return value.replace(/\u2019/g, "'");
}

function lookupCurriculumTitle(
  map: Record<string, string> | undefined,
  title: string,
): string | undefined {
  if (!map) return undefined;
  if (map[title]) return map[title];
  const normalized = normalizeApostrophe(title);
  for (const [key, value] of Object.entries(map)) {
    if (normalizeApostrophe(key) === normalized) return value;
  }
  return undefined;
}

function buildCoursePayload(
  row: Record<string, string | null>,
  content: PlanlamaCategoryCourseContent,
): Record<string, string | null> {
  const payload: Record<string, string | null> = {
    updated_at: new Date().toISOString(),
  };

  const trFields = [
    ["title", content.title],
    ["subtitle", content.subtitle],
    ["description_md", content.description_md],
    ["what_will_learn", content.what_will_learn],
    ["target_audience", content.target_audience],
  ] as const;

  for (const [field, value] of trFields) {
    if (!value?.trim()) continue;
    const current = row[field];
    if (isEmpty(current) || (field === "description_md" && looksEnglish(current!))) {
      payload[field] = value.trim();
    }
  }

  const enFields = [
    ["title_en", content.title_en],
    ["subtitle_en", content.subtitle_en],
    ["description_md_en", content.description_md_en],
    ["what_will_learn_en", content.what_will_learn_en],
    ["target_audience_en", content.target_audience_en],
  ] as const;

  for (const [field, value] of enFields) {
    if (value?.trim()) {
      payload[field] = value.trim();
    }
  }

  if (content.subtitle_language?.trim()) {
    const current = row.subtitle_language;
    if (isEmpty(current)) {
      payload.subtitle_language = toCoursesCacheSubtitleLanguageDbValue(
        content.subtitle_language,
      );
    }
  }

  return payload;
}

async function ensureCurriculumColumns(): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("sections").select("title_en").limit(1);
  if (error?.message?.includes("title_en")) {
    console.warn("title_en columns missing — curriculum DB writes skipped.");
    return false;
  }
  return true;
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

  const curriculumColumnsReady = await ensureCurriculumColumns();
  const admin = getSupabaseAdmin();

  let courseUpdates = 0;
  let sectionUpdates = 0;
  let lessonUpdates = 0;

  for (const content of REMAINING_PAID_CATEGORY_CONTENT) {
    const { data: row, error: fetchError } = await admin
      .from("courses_cache")
      .select(
        "id,course_slug,title,subtitle,description_md,what_will_learn,target_audience,title_en,subtitle_en,description_md_en,what_will_learn_en,target_audience_en,subtitle_language",
      )
      .eq("course_slug", content.course_slug)
      .maybeSingle();

    if (fetchError || !row) {
      console.warn(`[${content.course_slug}] not found — skipped`);
      continue;
    }

    const payload = buildCoursePayload(row, content);
    const fieldCount = Object.keys(payload).length - 1;

    if (fieldCount > 0) {
      if (dryRun) {
        console.log(`[dry-run] course ${content.course_slug}: ${fieldCount} fields`);
      } else {
        const { error: updateError } = await admin
          .from("courses_cache")
          .update(payload)
          .eq("id", row.id);
        if (updateError) {
          console.error(`[${content.course_slug}] update failed:`, updateError.message);
          continue;
        }
      }
      courseUpdates += 1;
    }

    const curriculum = getCategoryCurriculumI18n(content.course_slug);
    if (curriculum && curriculumColumnsReady) {
      const { data: sections } = await admin
        .from("sections")
        .select("id, title, title_en")
        .eq("course_id", row.id);

      for (const section of sections ?? []) {
        const title = section.title?.trim();
        if (!title) continue;

        let titleTr: string | undefined;
        let titleEn: string | undefined;

        if (lookupCurriculumTitle(curriculum.sections, title)) {
          titleEn = lookupCurriculumTitle(curriculum.sections, title);
          titleTr = title;
        } else if (lookupCurriculumTitle(curriculum.sections_tr, title)) {
          titleEn = title;
          titleTr = lookupCurriculumTitle(curriculum.sections_tr, title);
        }

        if (!titleEn && !titleTr) {
          console.warn(`  section missing map: "${title}"`);
          continue;
        }

        const sectionPayload: Record<string, string> = {};
        if (titleEn && (isEmpty(section.title_en) || section.title_en !== titleEn)) {
          sectionPayload.title_en = titleEn;
        }
        if (titleTr && (isEmpty(section.title) || looksEnglish(section.title))) {
          sectionPayload.title = titleTr;
        }

        if (Object.keys(sectionPayload).length === 0) continue;

        if (!dryRun) {
          await admin.from("sections").update(sectionPayload).eq("id", section.id);
        }
        sectionUpdates += 1;
      }

      const { data: lessons } = await admin
        .from("lessons")
        .select("id, title, title_en")
        .eq("courses_cache_id", row.id);

      for (const lesson of lessons ?? []) {
        const title = lesson.title?.trim();
        if (!title) continue;

        let titleTr: string | undefined;
        let titleEn: string | undefined;

        if (lookupCurriculumTitle(curriculum.lessons, title)) {
          titleEn = lookupCurriculumTitle(curriculum.lessons, title);
          titleTr = title;
        } else if (lookupCurriculumTitle(curriculum.lessons_tr, title)) {
          titleEn = title;
          titleTr = lookupCurriculumTitle(curriculum.lessons_tr, title);
        }

        if (!titleEn && !titleTr) {
          console.warn(`  lesson missing map: "${title}"`);
          continue;
        }

        const lessonPayload: Record<string, string> = {};
        if (titleEn && (isEmpty(lesson.title_en) || lesson.title_en !== titleEn)) {
          lessonPayload.title_en = titleEn;
        }
        if (titleTr && (isEmpty(lesson.title) || looksEnglish(lesson.title))) {
          lessonPayload.title = titleTr;
        }

        if (Object.keys(lessonPayload).length === 0) continue;

        if (!dryRun) {
          await admin.from("lessons").update(lessonPayload).eq("id", lesson.id);
        }
        lessonUpdates += 1;
      }
    }

    console.log(`✓ ${content.course_slug}`);
  }

  console.log(
    `\nDone: ${courseUpdates} courses, ${sectionUpdates} sections, ${lessonUpdates} lessons${dryRun ? " (dry-run)" : ""}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
