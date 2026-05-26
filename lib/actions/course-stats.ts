"use server";

import { unstable_cache } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { COURSE_STATS_CACHE_TAG } from "@/lib/wordpress/cache-tags";
import { formatDuration } from "@/lib/utils/duration";

export interface CourseStats {
  lessonCount: number;
  durationSeconds: number;
  durationLabel: string;
}

const EMPTY_STATS: CourseStats = {
  lessonCount: 0,
  durationSeconds: 0,
  durationLabel: "",
};

const REVALIDATE_SECONDS = 3600;

async function fetchAllCourseStatsUncached(): Promise<
  Record<string, CourseStats>
> {
  const map: Record<string, CourseStats> = {};
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("lessons")
    .select("course_slug, duration_seconds");

  if (error) {
    console.error("[CourseStats] Supabase query failed:", error.message);
    return map;
  }

  for (const row of data ?? []) {
    const existing = map[row.course_slug] ?? {
      lessonCount: 0,
      durationSeconds: 0,
      durationLabel: "",
    };

    existing.lessonCount += 1;
    existing.durationSeconds += row.duration_seconds ?? 0;
    map[row.course_slug] = existing;
  }

  for (const slug of Object.keys(map)) {
    const stat = map[slug];
    if (stat.lessonCount > 0) {
      stat.durationLabel = formatDuration(stat.durationSeconds);
    }
  }

  return map;
}

const getCachedAllCourseStats = unstable_cache(
  fetchAllCourseStatsUncached,
  ["all-course-stats"],
  { revalidate: REVALIDATE_SECONDS, tags: [COURSE_STATS_CACHE_TAG] },
);

export async function getCourseStatsMap(
  courses: Array<{ id: number; slug: string }>,
): Promise<Map<string, CourseStats>> {
  const map = new Map<string, CourseStats>();

  if (courses.length === 0) {
    return map;
  }

  const allStats = await getCachedAllCourseStats();

  for (const course of courses) {
    map.set(course.slug, allStats[course.slug] ?? { ...EMPTY_STATS });
  }

  return map;
}

export async function getAllCourseStats(): Promise<Record<string, CourseStats>> {
  return getCachedAllCourseStats();
}
