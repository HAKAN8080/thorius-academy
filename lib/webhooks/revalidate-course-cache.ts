import { revalidatePath, revalidateTag } from "next/cache";
import {
  COURSE_CACHE_TAG,
  COURSE_CATEGORY_CACHE_TAG,
  COURSE_PRODUCTS_CACHE_TAG,
  COURSE_STATS_CACHE_TAG,
  courseSlugCacheTag,
} from "@/lib/wordpress/cache-tags";

export interface RevalidateCourseCacheOptions {
  slug?: string;
  previousSlug?: string;
}

export interface RevalidateCourseCacheResult {
  revalidated: {
    tags: string[];
    paths: string[];
  };
}

function revalidateSlug(slug: string, tags: string[], paths: string[]): void {
  const slugTag = courseSlugCacheTag(slug);
  tags.push(slugTag);
  revalidateTag(slugTag);

  const coursePath = `/kurslar/${slug}`;
  paths.push(coursePath);
  revalidatePath(coursePath);
}

export function revalidateCourseCache(
  options: RevalidateCourseCacheOptions = {},
): RevalidateCourseCacheResult {
  const { slug, previousSlug } = options;
  const tags = [
    COURSE_CACHE_TAG,
    COURSE_CATEGORY_CACHE_TAG,
    COURSE_STATS_CACHE_TAG,
    COURSE_PRODUCTS_CACHE_TAG,
  ];
  const paths = ["/", "/kurslar"];

  for (const tag of tags) {
    revalidateTag(tag);
  }

  if (
    previousSlug &&
    previousSlug !== slug
  ) {
    revalidateSlug(previousSlug, tags, paths);
  }

  if (slug) {
    revalidateSlug(slug, tags, paths);
  }

  for (const path of ["/", "/kurslar"]) {
    revalidatePath(path);
  }

  revalidatePath("/kurslar", "layout");

  return { revalidated: { tags, paths } };
}
