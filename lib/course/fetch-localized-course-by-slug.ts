import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import {
  resolveCourseContent,
  type CourseContentSource,
} from "@/lib/course/resolve-course-content";
import { slugifyCategoryName } from "@/lib/course/category-slug";
import type { AppLocale } from "@/i18n/routing";
import { getSupabasePublicClient } from "@/lib/supabase/public";
import { fetchCourseBySlug } from "@/lib/wordpress/api";
import type { Course } from "@/types/wordpress";

function toAppLocale(locale: string): AppLocale {
  return locale === "en" ? "en" : "tr";
}

const CACHE_DETAIL_SELECT =
  "id,course_slug,wp_course_id,title,subtitle,description_md,title_en,subtitle_en,description_md_en,cover_image_url,category,instructor_wp_user_id,updated_at";

export interface LocalizedCourse extends Course {
  hasLocaleContent: boolean;
}

function stableNumericId(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

async function getPublicCourseCacheBySlug(
  slug: string,
): Promise<(CourseContentSource & Record<string, unknown>) | null> {
  const supabase = getSupabasePublicClient();

  for (const variant of getCourseSlugLookupVariants(slug)) {
    const { data } = await supabase
      .from("courses_cache")
      .select(CACHE_DETAIL_SELECT)
      .eq("course_slug", variant)
      .eq("published", true)
      .eq("visibility", "public")
      .maybeSingle();

    if (data) {
      return data as CourseContentSource & Record<string, unknown>;
    }
  }

  return null;
}

function courseFromCacheRow(
  row: CourseContentSource & Record<string, unknown>,
  resolved: ReturnType<typeof resolveCourseContent>,
): Course {
  const slug = String(row.course_slug ?? "").trim();
  const wpCourseId =
    row.wp_course_id == null || row.wp_course_id === ""
      ? null
      : Number(row.wp_course_id);
  const id =
    wpCourseId != null && wpCourseId > 0
      ? wpCourseId
      : stableNumericId(slug || resolved.title);
  const categoryName = (row.category as string | null)?.trim();

  return {
    id,
    slug,
    title: resolved.title,
    excerpt: resolved.excerpt,
    content: resolved.contentHtml,
    featuredImage: (row.cover_image_url as string | null) ?? null,
    imageAlt: resolved.title,
    instructor: null,
    categories: categoryName
      ? [
          {
            id: stableNumericId(slugifyCategoryName(categoryName)),
            name: categoryName,
            slug: slugifyCategoryName(categoryName),
          },
        ]
      : [],
    tags: [],
    wpLink: `/kurslar/${slug}`,
    publishedDate:
      (row.updated_at as string | undefined) ?? new Date().toISOString(),
  };
}

export async function fetchLocalizedCourseBySlug(
  slug: string,
  locale: string,
): Promise<LocalizedCourse | null> {
  const appLocale = toAppLocale(locale);
  // Academy pages must stay fast under RSC prefetch — prefer Supabase, WP only as fallback.
  const cacheRow = await getPublicCourseCacheBySlug(slug);

  if (cacheRow) {
    const resolved = resolveCourseContent(cacheRow, appLocale);
    const base = courseFromCacheRow(cacheRow, resolved);

    return {
      ...base,
      title: resolved.title || base.title,
      excerpt: resolved.excerpt || base.excerpt,
      content: resolved.contentHtml || base.content,
      featuredImage:
        base.featuredImage || (cacheRow.cover_image_url as string | null),
      imageAlt: resolved.title || base.imageAlt,
      hasLocaleContent: resolved.hasLocaleContent,
    };
  }

  const wpCourse = await fetchCourseBySlug(slug);
  if (!wpCourse) {
    return null;
  }

  return {
    ...wpCourse,
    hasLocaleContent: appLocale === "tr",
  };
}
