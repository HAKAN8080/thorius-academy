"use server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  extractVideoUrl,
  fetchCourseFullStructure,
} from "@/lib/tutor/api";
import { formatDuration } from "@/lib/utils/duration";

export interface CourseStats {
  lessonCount: number;
  durationSeconds: number;
  durationLabel: string;
}

export async function getCourseStatsMap(
  courses: Array<{ id: number; slug: string }>,
): Promise<Map<string, CourseStats>> {
  const map = new Map<string, CourseStats>();

  for (const course of courses) {
    map.set(course.slug, {
      lessonCount: 0,
      durationSeconds: 0,
      durationLabel: "",
    });
  }

  if (courses.length === 0) {
    return map;
  }

  const slugs = courses.map((course) => course.slug);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("lessons")
    .select("course_slug, duration_seconds")
    .in("course_slug", slugs);

  if (error) {
    console.error("[CourseStats] Supabase query failed:", error.message);
  } else {
    for (const row of data ?? []) {
      const stat = map.get(row.course_slug);
      if (!stat) continue;
      stat.lessonCount += 1;
      stat.durationSeconds += row.duration_seconds ?? 0;
    }
  }

  await Promise.all(
    courses.map(async (course) => {
      const stat = map.get(course.slug);
      if (!stat) return;

      if (stat.lessonCount > 0) {
        stat.durationLabel = formatDuration(stat.durationSeconds);
        return;
      }

      try {
        const structure = await fetchCourseFullStructure(course.id);
        let lessonCount = 0;
        let durationSeconds = 0;

        for (const topic of structure) {
          for (const lesson of topic.lessons) {
            lessonCount += 1;
            durationSeconds += extractVideoUrl(lesson.video).duration;
          }
        }

        if (lessonCount > 0) {
          map.set(course.slug, {
            lessonCount,
            durationSeconds,
            durationLabel: formatDuration(durationSeconds),
          });
        }
      } catch (err) {
        console.error(
          `[CourseStats] Tutor fallback failed for ${course.slug}:`,
          err,
        );
      }
    }),
  );

  for (const slug of slugs) {
    const stat = map.get(slug);
    if (stat && stat.lessonCount > 0 && !stat.durationLabel) {
      stat.durationLabel = formatDuration(stat.durationSeconds);
    }
  }

  return map;
}
