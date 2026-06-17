import { slugifyCourseTitle } from "@/lib/instructor/slugify-course-title";

/**
 * WordPress `course-category` slug → Supabase katalog slug (kategori adından üretilir).
 * WP kısa slug'ları (bt, ai, ist…) sidebar'daki slugify(name) ile uyuşmaz.
 */
const WORDPRESS_CATEGORY_SLUG_ALIASES: Record<string, string> = {
  bt: "bilgi-teknolojileri",
  ist: "istatistik",
  ai: "yapay-zeka",
  yoga: "wellness",
  "mit-egitimleri": "mit-open-course-ware",
  /** Slugify öncesi Türkçe İ hatası */
  "i-nsan-kaynaklari": "insan-kaynaklari",
};

export function slugifyCategoryName(name: string): string {
  return slugifyCourseTitle(name);
}

export function catalogSlugFromWordPressCategory(category: {
  name: string;
  slug: string;
}): string {
  const wpSlug = category.slug.trim().toLowerCase();
  return (
    WORDPRESS_CATEGORY_SLUG_ALIASES[wpSlug] ?? slugifyCategoryName(category.name)
  );
}

export function canonicalizeCategorySlug(slug: string): string {
  const trimmed = slug.trim().toLowerCase();
  return WORDPRESS_CATEGORY_SLUG_ALIASES[trimmed] ?? trimmed;
}
