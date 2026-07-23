import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import { fetchLocalizedCourseBySlug } from "@/lib/course/fetch-localized-course-by-slug";
import { createClient } from "@/lib/supabase/server";
import { fetchCourseBySlug } from "@/lib/wordpress/api";
import type { Course } from "@/types/wordpress";

const PLAYER_WP_TIMEOUT_MS = 8000;

function courseFromEnrollment(row: {
  course_id: number;
  course_slug: string;
  course_title: string;
  course_image: string | null;
  course_category: string | null;
  instructor_name: string | null;
  enrolled_at: string;
}): Course {
  const categoryName = row.course_category?.trim() || null;

  return {
    id: row.course_id,
    slug: row.course_slug,
    title: row.course_title,
    excerpt: "",
    content: "",
    featuredImage: row.course_image,
    imageAlt: row.course_title,
    instructor: row.instructor_name
      ? {
          id: 0,
          name: row.instructor_name,
          slug: "",
          avatar: null,
        }
      : null,
    categories: categoryName
      ? [{ id: 0, name: categoryName, slug: "" }]
      : [],
    tags: [],
    wpLink: `/kurslar/${row.course_slug}`,
    publishedDate: row.enrolled_at,
  };
}

/**
 * Player course resolution order:
 * 1) courses_cache (fast, no WP dependency)
 * 2) WordPress with a longer timeout (player can wait)
 * 3) Current user's enrollment row (paid access must not 404 if WP is slow)
 */
export async function resolvePlayerCourse(
  slug: string,
  userId: string,
): Promise<Course | null> {
  const fromCache = await fetchLocalizedCourseBySlug(slug, "tr");
  if (fromCache) {
    return fromCache;
  }

  const fromWp = await fetchCourseBySlug(slug, {
    timeoutMs: PLAYER_WP_TIMEOUT_MS,
  });
  if (fromWp) {
    return fromWp;
  }

  const supabase = await createClient();
  const variants = getCourseSlugLookupVariants(slug);

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      "course_id, course_slug, course_title, course_image, course_category, instructor_name, enrolled_at",
    )
    .eq("user_id", userId)
    .in("course_slug", variants)
    .neq("status", "cancelled")
    .order("enrolled_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[resolvePlayerCourse] enrollment lookup failed:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return courseFromEnrollment(data);
}
