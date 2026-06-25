import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fetchCourseBySlug } from "@/lib/wordpress/api";

export interface CourseEnrollmentMeta {
  course_id: number;
  course_slug: string;
  course_title: string;
  course_image: string | null;
  course_category: string | null;
  instructor_name: string | null;
}

export async function resolveCourseEnrollmentMeta(
  courseSlug: string,
): Promise<CourseEnrollmentMeta | null> {
  const admin = getSupabaseAdmin();
  const slugVariants = getCourseSlugLookupVariants(courseSlug);

  const { data: cacheRow } = await admin
    .from("courses_cache")
    .select("wp_course_id, course_slug, title, cover_image_url, category")
    .in("course_slug", slugVariants)
    .limit(1)
    .maybeSingle();

  if (cacheRow?.wp_course_id) {
    const wpCourse = await fetchCourseBySlug(
      (cacheRow.course_slug as string) || courseSlug,
    );

    return {
      course_id: cacheRow.wp_course_id as number,
      course_slug: (cacheRow.course_slug as string) || courseSlug,
      course_title:
        (cacheRow.title as string) || wpCourse?.title || courseSlug,
      course_image:
        (cacheRow.cover_image_url as string | null) ??
        wpCourse?.featuredImage ??
        null,
      course_category:
        (cacheRow.category as string | null) ??
        wpCourse?.categories[0]?.name ??
        null,
      instructor_name: wpCourse?.instructor?.name ?? null,
    };
  }

  const course = await fetchCourseBySlug(courseSlug);
  if (!course) {
    return null;
  }

  return {
    course_id: course.id,
    course_slug: course.slug,
    course_title: course.title,
    course_image: course.featuredImage ?? null,
    course_category: course.categories[0]?.name ?? null,
    instructor_name: course.instructor?.name ?? null,
  };
}
