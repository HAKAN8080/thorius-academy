import { slugifyCourseTitle } from "@/lib/instructor/slugify-course-title";

/** Slugs produced before Turkish-locale slugify (İ → i + combining dot → hyphen). */
const LEGACY_CATEGORY_SLUG_ALIASES: Record<string, string> = {
  "i-nsan-kaynaklari": "insan-kaynaklari",
};

export function slugifyCategoryName(name: string): string {
  return slugifyCourseTitle(name);
}

export function canonicalizeCategorySlug(slug: string): string {
  const trimmed = slug.trim().toLowerCase();
  return LEGACY_CATEGORY_SLUG_ALIASES[trimmed] ?? trimmed;
}
