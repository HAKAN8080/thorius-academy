import type { Course, WPCategory, WPCourse } from "@/types/wordpress";

const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://thorius.com.tr/wp-json/wp/v2";

const REVALIDATE_SECONDS = 3600;

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
    excerpt: stripHtml(wpCourse.excerpt.rendered),
    content: stripHtml(wpCourse.content.rendered),
    contentHtml: wpCourse.content.rendered,
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
      next: { revalidate: REVALIDATE_SECONDS },
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
      { next: { revalidate: REVALIDATE_SECONDS } }
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
      { next: { revalidate: REVALIDATE_SECONDS } }
    );

    if (!res.ok) return [];

    return await res.json();
  } catch (error) {
    console.error("fetchAllCategories error:", error);
    return [];
  }
}

export async function fetchCoursesByCategory(
  categorySlug: string
): Promise<Course[]> {
  try {
    const catRes = await fetch(
      `${WP_API_BASE}/course-category?slug=${encodeURIComponent(categorySlug)}`,
      { next: { revalidate: REVALIDATE_SECONDS } }
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
