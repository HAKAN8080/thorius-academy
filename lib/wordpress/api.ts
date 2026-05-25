import type { Course, WPCategory, WPCourse } from "@/types/wordpress";
import {
  COURSE_CACHE_TAG,
  COURSE_CATEGORY_CACHE_TAG,
  courseSlugCacheTag,
} from "@/lib/wordpress/cache-tags";

const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://thorius.com.tr/wp-json/wp/v2";

const REVALIDATE_SECONDS = 3600;

/** Kategori kartında hangi sıradaki kursun görseli kullanılsın (0 = ilk kurs). */
const CATEGORY_IMAGE_COURSE_INDEX: Record<string, number> = {
  planlama: 1,
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&hellip;/g, "...")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parseExcerpt(html: string): string {
  return stripHtml(html).replace(/\s*(\[\.\.\.\]|…|\.{3,})\s*$/, "").trim();
}

function transformCourse(wpCourse: WPCourse): Course {
  const embedded = wpCourse._embedded;

  const featuredMedia = embedded?.["wp:featuredmedia"]?.[0];
  const imageSizes = featuredMedia?.media_details?.sizes;
  const featuredImage =
    imageSizes?.large?.source_url ||
    imageSizes?.medium?.source_url ||
    imageSizes?.full?.source_url ||
    featuredMedia?.source_url ||
    null;

  const author = embedded?.author?.[0];
  const instructor = author
    ? {
        id: author.id,
        name: author.name,
        slug: author.slug,
        avatar: author.avatar_urls?.["96"] || null,
      }
    : null;

  const terms = embedded?.["wp:term"] || [];
  const categories = terms
    .flat()
    .filter((t) => t.taxonomy === "course-category")
    .map((t) => ({ id: t.id, name: t.name, slug: t.slug }));
  const tags = terms
    .flat()
    .filter((t) => t.taxonomy === "course-tag")
    .map((t) => ({ id: t.id, name: t.name, slug: t.slug }));

  return {
    id: wpCourse.id,
    slug: wpCourse.slug,
    title: stripHtml(wpCourse.title.rendered),
    excerpt: parseExcerpt(wpCourse.excerpt.rendered),
    content: wpCourse.content.rendered,
    featuredImage,
    imageAlt: featuredMedia?.alt_text || stripHtml(wpCourse.title.rendered),
    instructor,
    categories,
    tags,
    wpLink: wpCourse.link,
    publishedDate: wpCourse.date,
  };
}

async function fetchWPCourses(url: string): Promise<WPCourse[]> {
  const allCourses: WPCourse[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const separator = url.includes("?") ? "&" : "?";
    const res = await fetch(`${url}${separator}page=${page}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [COURSE_CACHE_TAG] },
    });

    if (!res.ok) {
      console.error("WP API error:", res.status, res.statusText, url);
      break;
    }

    totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
    const batch: WPCourse[] = await res.json();
    allCourses.push(...batch);
    page += 1;
  }

  return allCourses;
}

export async function fetchAllCourses(): Promise<Course[]> {
  try {
    const wpCourses = await fetchWPCourses(
      `${WP_API_BASE}/courses?_embed=true&per_page=100&status=publish`
    );
    return wpCourses.map(transformCourse);
  } catch (error) {
    console.error("fetchAllCourses error:", error);
    return [];
  }
}

export async function fetchCourseBySlug(slug: string): Promise<Course | null> {
  try {
    const res = await fetch(
      `${WP_API_BASE}/courses?slug=${encodeURIComponent(slug)}&_embed=true`,
      {
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: [COURSE_CACHE_TAG, courseSlugCacheTag(slug)],
        },
      },
    );

    if (!res.ok) return null;

    const wpCourses: WPCourse[] = await res.json();
    if (!wpCourses.length) return null;

    return transformCourse(wpCourses[0]);
  } catch (error) {
    console.error("fetchCourseBySlug error:", error);
    return null;
  }
}

export async function fetchAllCategories(): Promise<WPCategory[]> {
  try {
    const res = await fetch(
      `${WP_API_BASE}/course-category?per_page=100&hide_empty=true`,
      {
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: [COURSE_CATEGORY_CACHE_TAG],
        },
      },
    );

    if (!res.ok) return [];

    const categories: WPCategory[] = await res.json();
    return enrichCategoriesWithImages(categories);
  } catch (error) {
    console.error("fetchAllCategories error:", error);
    return [];
  }
}

async function fetchCategoryImage(
  categoryId: number,
  categorySlug: string,
): Promise<string | null> {
  try {
    const courseIndex = CATEGORY_IMAGE_COURSE_INDEX[categorySlug] ?? 0;
    const perPage = Math.max(1, courseIndex + 1);
    const res = await fetch(
      `${WP_API_BASE}/courses?_embed=true&per_page=${perPage}&course-category=${categoryId}`,
      {
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: [COURSE_CATEGORY_CACHE_TAG],
        },
      },
    );

    if (!res.ok) return null;

    const courses: WPCourse[] = await res.json();
    if (!courses.length) return null;

    const course = courses[courseIndex] ?? courses[0];
    return transformCourse(course).featuredImage;
  } catch {
    return null;
  }
}

async function enrichCategoriesWithImages(
  categories: WPCategory[],
): Promise<WPCategory[]> {
  const images = await Promise.all(
    categories.map((category) =>
      fetchCategoryImage(category.id, category.slug),
    ),
  );

  return categories.map((category, index) => ({
    ...category,
    image: images[index],
  }));
}

export async function fetchCoursesByCategory(
  categorySlug: string
): Promise<Course[]> {
  try {
    const catRes = await fetch(
      `${WP_API_BASE}/course-category?slug=${encodeURIComponent(categorySlug)}`,
      {
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: [COURSE_CATEGORY_CACHE_TAG],
        },
      },
    );
    if (!catRes.ok) return [];

    const cats: WPCategory[] = await catRes.json();
    if (!cats.length) return [];

    const catId = cats[0].id;
    const wpCourses = await fetchWPCourses(
      `${WP_API_BASE}/courses?_embed=true&per_page=100&course-category=${catId}`
    );

    return wpCourses.map(transformCourse);
  } catch (error) {
    console.error("fetchCoursesByCategory error:", error);
    return [];
  }
}
