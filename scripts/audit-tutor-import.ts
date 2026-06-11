import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  fetchAllTutorCourses,
  parseCourseId,
} from "@/lib/tutor/instructor-api";
import { fetchCourseFullStructureFresh } from "@/lib/tutor/api";

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

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

async function main() {
  const checkTutor = process.argv.includes("--check-tutor");
  const admin = getSupabaseAdmin();

  const { courses: wpCourses } = await fetchAllTutorCourses();
  const wpIds = wpCourses
    .map((course) => parseCourseId(course))
    .filter((id) => id > 0)
    .sort((a, b) => a - b);

  const { data: cacheRows } = await admin
    .from("courses_cache")
    .select("id, wp_course_id, title, course_slug")
    .not("wp_course_id", "is", null);

  const cacheByWp = new Map(
    (cacheRows ?? []).map((row) => [Number(row.wp_course_id), row]),
  );

  const { data: lessonCounts } = await admin.from("lessons").select("course_id");

  const lessonsByWp = new Map<number, number>();
  for (const row of lessonCounts ?? []) {
    const wpId = Number(row.course_id);
    if (!Number.isFinite(wpId) || wpId <= 0) continue;
    lessonsByWp.set(wpId, (lessonsByWp.get(wpId) ?? 0) + 1);
  }

  const missingCache: number[] = [];
  const zeroLessons: Array<{
    wpCourseId: number;
    title: string;
    tutorLessonCount?: number;
  }> = [];

  for (const wpId of wpIds) {
    const cache = cacheByWp.get(wpId);
    if (!cache) {
      missingCache.push(wpId);
      continue;
    }

    const lessonCount = lessonsByWp.get(wpId) ?? 0;
    if (lessonCount === 0) {
      zeroLessons.push({
        wpCourseId: wpId,
        title: String(cache.title ?? ""),
      });
    }
  }

  if (checkTutor && zeroLessons.length > 0) {
    for (const item of zeroLessons) {
      try {
        const topics = await fetchCourseFullStructureFresh(item.wpCourseId);
        item.tutorLessonCount = topics.reduce(
          (sum, topic) => sum + topic.lessons.length,
          0,
        );
      } catch {
        item.tutorLessonCount = -1;
      }
    }
  }

  const extraCache = (cacheRows ?? [])
    .filter((row) => {
      const wpId = Number(row.wp_course_id);
      return wpId > 0 && !wpIds.includes(wpId);
    })
    .map((row) => ({
      wpCourseId: Number(row.wp_course_id),
      title: String(row.title ?? ""),
    }));

  const importedWithLessons = wpIds.filter(
    (id) => (lessonsByWp.get(id) ?? 0) > 0,
  ).length;

  const emptyInTutor = checkTutor
    ? zeroLessons.filter((row) => row.tutorLessonCount === 0)
    : [];
  const needsImport = checkTutor
    ? zeroLessons.filter(
        (row) =>
          (row.tutorLessonCount ?? 0) > 0 || row.tutorLessonCount === -1,
      )
    : zeroLessons;

  console.log(
    JSON.stringify(
      {
        wpCatalogCourses: wpIds.length,
        coursesCacheRows: cacheRows?.length ?? 0,
        importedWithLessons,
        missingFromCoursesCache: missingCache,
        zeroLessonsInSupabase: zeroLessons.map((row) => ({
          wpCourseId: row.wpCourseId,
          title: row.title,
          tutorLessonCount: row.tutorLessonCount,
        })),
        emptyInTutor: emptyInTutor.map((row) => row.wpCourseId),
        needsReimport: needsImport.map((row) => ({
          wpCourseId: row.wpCourseId,
          title: row.title,
          tutorLessonCount: row.tutorLessonCount,
        })),
        extraInCoursesCacheNotInWpCatalog: extraCache,
        summary:
          missingCache.length === 0 &&
          (checkTutor ? needsImport.length === 0 : zeroLessons.length <= 2)
            ? "OK — import tamamlanmış görünüyor"
            : "Eksik veya dersi olmayan kurs var",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
