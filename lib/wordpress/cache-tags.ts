export const COURSE_CACHE_TAG = "courses";
export const COURSE_CATEGORY_CACHE_TAG = "course-categories";
export const COURSE_STATS_CACHE_TAG = "course-stats";
export const COURSE_PRODUCTS_CACHE_TAG = "course-products";

export function courseSlugCacheTag(slug: string): string {
  return `course-${slug}`;
}
