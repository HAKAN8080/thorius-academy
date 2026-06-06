export const COURSE_CACHE_TAG = "courses";
export const COURSE_CATEGORY_CACHE_TAG = "course-categories";
export const COURSE_STATS_CACHE_TAG = "course-stats";
export const COURSE_PRODUCTS_CACHE_TAG = "course-products";
export const COURSE_LISTING_CACHE_TAG = "course-listing";
export const BLOG_CACHE_TAG = "blog-posts";

export function courseSlugCacheTag(slug: string): string {
  return `course-${slug}`;
}

export function blogSlugCacheTag(slug: string): string {
  return `blog-${slug}`;
}
