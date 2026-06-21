import type { InstructorCourseListItem } from "@/types/instructor-course";
import {
  fetchWpCoverImageBySlug,
  fetchWpCoverImagesByWpIds,
  pickBestCoverImageUrl,
} from "@/lib/course/resolve-course-cover-image";

const MAX_SLUG_FALLBACKS = 32;

interface CacheCoverRow {
  cover_image_url: string | null;
  course_slug: string | null;
}

export async function enrichInstructorCourseListCovers(
  courses: InstructorCourseListItem[],
  cacheByWpId: Map<number, CacheCoverRow>,
): Promise<InstructorCourseListItem[]> {
  if (courses.length === 0) {
    return courses;
  }

  const enriched = courses.map((course) => {
    const cache =
      course.wp_course_id != null
        ? cacheByWpId.get(course.wp_course_id)
        : undefined;
    const cover = pickBestCoverImageUrl({
      coverImageUrl: cache?.cover_image_url,
      fallbackUrl: course.cover_image_url,
    });

    return {
      ...course,
      cover_image_url: cover,
    };
  });

  let missing = enriched.filter(
    (course) => !course.cover_image_url?.trim() && course.wp_course_id != null,
  );
  if (missing.length === 0) {
    return enriched;
  }

  const wpIds = missing
    .map((course) => course.wp_course_id)
    .filter((id): id is number => id != null);
  let byWpId: Record<number, string> = {};

  try {
    byWpId = await fetchWpCoverImagesByWpIds(wpIds);
  } catch (error) {
    console.error("[enrich-instructor-course-covers] batch fetch failed:", error);
  }

  for (const course of enriched) {
    if (!course.cover_image_url?.trim() && course.wp_course_id != null) {
      const wpCover = byWpId[course.wp_course_id];
      if (wpCover) {
        course.cover_image_url = wpCover;
      }
    }
  }

  missing = enriched.filter(
    (course) => !course.cover_image_url?.trim() && course.wp_course_id != null,
  );
  if (missing.length === 0) {
    return enriched;
  }

  await Promise.all(
    missing.slice(0, MAX_SLUG_FALLBACKS).map(async (course) => {
      const slug =
        course.course_slug?.trim() ||
        (course.wp_course_id != null
          ? cacheByWpId.get(course.wp_course_id)?.course_slug?.trim()
          : undefined);
      if (!slug) {
        return;
      }

      const cover = await fetchWpCoverImageBySlug(slug);
      if (cover) {
        course.cover_image_url = cover;
      }
    }),
  );

  return enriched;
}
