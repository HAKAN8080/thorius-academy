import type { Course, WPCategory, WPCourse } from "@/types/wordpress";
import {
  COURSE_CACHE_TAG,
  COURSE_CATEGORY_CACHE_TAG,
  courseSlugCacheTag,
} from "@/lib/wordpress/cache-tags";
import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import { decodeHtmlEntities } from "@/lib/utils/decode-html-entities";

const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://thorius.com.tr/wp-json/wp/v2";

const REVALIDATE_SECONDS = 3600;
/** Soft deadline so stalled JetPress never turns marketing/API callers into 503s. */
const WP_FETCH_TIMEOUT_MS = 1500;

async function wpFetch(
  url: string,
  init?: RequestInit & { next?: { revalidate?: number; tags?: string[] } },
): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(WP_FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    // Never throw — AbortSignal timeouts must not crash Server Actions / RSC pages.
    console.error("[wpFetch] failed:", url, error);
    return new Response(null, { status: 504, statusText: "WP timeout" });
  }
}

export const COURSES_PER_PAGE = 24;

const LISTING_COURSE_FIELDS =
  "id,slug,date,title,link,featured_media,course-category,course-tag,thorius_youtube";

/** Kategori kartında hangi sıradaki kursun görseli kullanılsın (0 = ilk kurs). */
const CATEGORY_IMAGE_COURSE_INDEX: Record<string, number> = {
  planlama: 1,
  bt: 1,
};

/** Belirli bir kurs slug'ının görseli zorunlu kılınır (kötü varsayılan kapakları override eder). */
export const CATEGORY_IMAGE_COURSE_SLUG: Record<string, string> = {
  "mit-egitimleri":
    "mit-making-science-and-engineering-pictures-video-25-a-solar-thermophotovoltaic-system-stvp-case-study",
};

function pickCategoryCoverCourse(
  category: WPCategory,
  courses: Course[],
): Course | undefined {
  const slugOverride = CATEGORY_IMAGE_COURSE_SLUG[category.slug];
  if (slugOverride) {
    const overrideCourse = courses.find((course) => course.slug === slugOverride);
    if (overrideCourse?.featuredImage) {
      return overrideCourse;
    }
  }

  const categoryCourses = courses.filter((course) =>
    course.categories.some((item) => item.id === category.id),
  );

  if (categoryCourses.length === 0) {
    return undefined;
  }

  const preferredIndex = CATEGORY_IMAGE_COURSE_INDEX[category.slug];
  if (
    preferredIndex != null &&
    categoryCourses[preferredIndex]?.featuredImage
  ) {
    return categoryCourses[preferredIndex];
  }

  return (
    categoryCourses.find((course) => course.featuredImage) ?? categoryCourses[0]
  );
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(html);
}

function parseExcerpt(html: string): string {
  return stripHtml(html).replace(/\s*(\[\.\.\.\]|…|\.{3,})\s*$/, "").trim();
}

function resolveFeaturedImageFromMaps(
  wpCourse: WPCourse,
  mediaById: Map<number, string>,
): string | null {
  const youtubeThumb = wpCourse.thorius_youtube?.thumbnail_url?.trim();
  if (youtubeThumb) {
    return youtubeThumb;
  }

  const videoId = wpCourse.thorius_youtube?.video_id?.trim();
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  const mediaId = wpCourse.featured_media ?? 0;
  if (mediaId > 0) {
    return mediaById.get(mediaId) ?? null;
  }

  return null;
}

function mapCourseCategories(
  wpCourse: WPCourse,
  categoryById: Map<number, WPCategory>,
): Course["categories"] {
  const categoryIds = wpCourse["course-category"] ?? [];

  return categoryIds
    .map((categoryId) => categoryById.get(categoryId))
    .filter((category): category is WPCategory => Boolean(category))
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));
}

function transformListingCourse(
  wpCourse: WPCourse,
  categoryById: Map<number, WPCategory>,
  mediaById: Map<number, string>,
): Course {
  const title = stripHtml(wpCourse.title.rendered);
  const featuredImage = resolveFeaturedImageFromMaps(wpCourse, mediaById);

  return {
    id: wpCourse.id,
    slug: wpCourse.slug,
    title,
    excerpt: "",
    content: "",
    featuredImage,
    imageAlt: title,
    instructor: null,
    categories: mapCourseCategories(wpCourse, categoryById),
    tags: [],
    wpLink: wpCourse.link,
    publishedDate: wpCourse.date,
    youtubeVideoId: wpCourse.thorius_youtube?.video_id?.trim() || null,
  };
}

async function fetchFeaturedMediaMap(
  mediaIds: number[],
): Promise<Map<number, string>> {
  const uniqueIds = Array.from(new Set(mediaIds.filter((id) => id > 0)));
  const mediaById = new Map<number, string>();

  if (uniqueIds.length === 0) {
    return mediaById;
  }

  for (let offset = 0; offset < uniqueIds.length; offset += 100) {
    const chunk = uniqueIds.slice(offset, offset + 100);
    const res = await wpFetch(
      `${WP_API_BASE}/media?include=${chunk.join(",")}&per_page=100&_fields=id,source_url,media_details`,
      {
        next: { revalidate: REVALIDATE_SECONDS, tags: [COURSE_CACHE_TAG] },
      },
    );

    if (!res.ok) {
      console.error("WP media API error:", res.status, res.statusText);
      continue;
    }

    const items: Array<{
      id: number;
      source_url?: string;
      media_details?: {
        sizes?: {
          medium?: { source_url: string };
          large?: { source_url: string };
        };
      };
    }> = await res.json();

    for (const item of items) {
      const url =
        item.media_details?.sizes?.medium?.source_url ||
        item.media_details?.sizes?.large?.source_url ||
        item.source_url ||
        null;

      if (url) {
        mediaById.set(item.id, url);
      }
    }
  }

  return mediaById;
}

function resolveFeaturedImage(wpCourse: WPCourse): string | null {
  const embedded = wpCourse._embedded;
  const featuredMedia = embedded?.["wp:featuredmedia"]?.[0];
  const imageSizes = featuredMedia?.media_details?.sizes;
  const embeddedImage =
    imageSizes?.large?.source_url ||
    imageSizes?.medium?.source_url ||
    imageSizes?.full?.source_url ||
    featuredMedia?.source_url ||
    null;

  if (embeddedImage) {
    return embeddedImage;
  }

  const youtubeThumb = wpCourse.thorius_youtube?.thumbnail_url?.trim();
  if (youtubeThumb) {
    return youtubeThumb;
  }

  const videoId = wpCourse.thorius_youtube?.video_id?.trim();
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  return null;
}

function transformCourse(
  wpCourse: WPCourse,
  options: { includeContent?: boolean } = {},
): Course {
  const { includeContent = true } = options;
  const embedded = wpCourse._embedded;
  const featuredImage = resolveFeaturedImage(wpCourse);
  const featuredMedia = embedded?.["wp:featuredmedia"]?.[0];

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
    content: includeContent ? (wpCourse.content?.rendered ?? "") : "",
    featuredImage,
    imageAlt: featuredMedia?.alt_text || stripHtml(wpCourse.title.rendered),
    instructor,
    categories,
    tags,
    wpLink: wpCourse.link,
    publishedDate: wpCourse.date,
    youtubeVideoId: wpCourse.thorius_youtube?.video_id?.trim() || null,
  };
}

async function fetchWPCourses(url: string): Promise<WPCourse[]> {
  const separator = url.includes("?") ? "&" : "?";
  const firstRes = await wpFetch(`${url}${separator}page=1`, {
    next: { revalidate: REVALIDATE_SECONDS, tags: [COURSE_CACHE_TAG] },
  });

  if (!firstRes.ok) {
    console.error("WP API error:", firstRes.status, firstRes.statusText, url);
    return [];
  }

  const totalPages = parseInt(firstRes.headers.get("X-WP-TotalPages") || "1", 10);
  const firstBatch: WPCourse[] = await firstRes.json();

  if (totalPages <= 1) {
    return firstBatch;
  }

  const remainingBatches = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => {
      const page = index + 2;
      return wpFetch(`${url}${separator}page=${page}`, {
        next: { revalidate: REVALIDATE_SECONDS, tags: [COURSE_CACHE_TAG] },
      }).then(async (res) => {
        if (!res.ok) {
          console.error("WP API error:", res.status, res.statusText, url);
          return [] as WPCourse[];
        }
        return res.json() as Promise<WPCourse[]>;
      });
    }),
  );

  return [...firstBatch, ...remainingBatches.flat()];
}

export interface CoursesListingPage {
  courses: Course[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

function normalizeWpSearchTerm(query: string): string {
  const cleaned = query
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || query;
}

function courseMatchesSearchQuery(
  course: Pick<Course, "title" | "slug">,
  query: string,
): boolean {
  const haystack = `${course.title} ${course.slug}`.toLowerCase();
  const needle = query.toLowerCase().trim();

  if (!needle) {
    return true;
  }

  if (haystack.includes(needle)) {
    return true;
  }

  return needle
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

async function fetchCoursesSearchListingPage(options: {
  page: number;
  perPage: number;
  categorySlug?: string;
  search: string;
}): Promise<CoursesListingPage> {
  const wpSearchTerm = normalizeWpSearchTerm(options.search);
  const baseUrl = `${WP_API_BASE}/courses?per_page=100&status=publish&_fields=${LISTING_COURSE_FIELDS}`;

  const searchUrls = new Set([
    `${baseUrl}&search=${encodeURIComponent(wpSearchTerm)}`,
  ]);

  if (wpSearchTerm !== options.search) {
    searchUrls.add(
      `${baseUrl}&search=${encodeURIComponent(options.search)}`,
    );
  }

  const [wpCourseGroups, categories] = await Promise.all([
    Promise.all(
      Array.from(searchUrls).map((url) => fetchWPCourses(url)),
    ),
    fetchCategoryList(),
  ]);

  const wpCoursesById = new Map<number, WPCourse>();
  for (const group of wpCourseGroups) {
    for (const course of group) {
      wpCoursesById.set(course.id, course);
    }
  }

  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const wpCourses = Array.from(wpCoursesById.values());
  const mediaIds = wpCourses
    .filter(
      (course) =>
        !course.thorius_youtube?.thumbnail_url &&
        !course.thorius_youtube?.video_id &&
        (course.featured_media ?? 0) > 0,
    )
    .map((course) => course.featured_media);
  const mediaById = await fetchFeaturedMediaMap(mediaIds);

  let courses = wpCourses
    .map((course) => transformListingCourse(course, categoryById, mediaById))
    .filter((course) => courseMatchesSearchQuery(course, options.search));

  if (options.categorySlug) {
    courses = courses.filter((course) =>
      course.categories.some(
        (category) => category.slug === options.categorySlug,
      ),
    );
  }

  const total = courses.length;
  const totalPages = total > 0 ? Math.ceil(total / options.perPage) : 0;
  const start = (options.page - 1) * options.perPage;

  return {
    courses: courses.slice(start, start + options.perPage),
    page: options.page,
    perPage: options.perPage,
    total,
    totalPages,
  };
}

async function resolveCategoryId(categorySlug: string): Promise<number | null> {
  const res = await wpFetch(
    `${WP_API_BASE}/course-category?slug=${encodeURIComponent(categorySlug)}`,
    {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: [COURSE_CATEGORY_CACHE_TAG],
      },
    },
  );

  if (!res.ok) {
    return null;
  }

  const categories: WPCategory[] = await res.json();
  return categories[0]?.id ?? null;
}

export async function fetchPublishedCourseTotal(): Promise<number> {
  try {
    const res = await wpFetch(
      `${WP_API_BASE}/courses?per_page=1&status=publish&_fields=id`,
      {
        next: { revalidate: REVALIDATE_SECONDS, tags: [COURSE_CACHE_TAG] },
      },
    );

    if (!res.ok) {
      return 0;
    }

    return parseInt(res.headers.get("X-WP-Total") || "0", 10);
  } catch (error) {
    console.error("fetchPublishedCourseTotal error:", error);
    return 0;
  }
}

export async function fetchCoursesListingPage(options: {
  page?: number;
  perPage?: number;
  categorySlug?: string;
  search?: string;
}): Promise<CoursesListingPage> {
  const perPage = options.perPage ?? COURSES_PER_PAGE;
  const requestedPage = Math.max(1, options.page ?? 1);
  const search = options.search?.trim();

  try {
    if (search) {
      return fetchCoursesSearchListingPage({
        page: requestedPage,
        perPage,
        categorySlug: options.categorySlug,
        search,
      });
    }

    let url = `${WP_API_BASE}/courses?per_page=${perPage}&status=publish&page=${requestedPage}&_fields=${LISTING_COURSE_FIELDS}`;

    if (options.categorySlug) {
      const categoryId = await resolveCategoryId(options.categorySlug);
      if (!categoryId) {
        return {
          courses: [],
          page: requestedPage,
          perPage,
          total: 0,
          totalPages: 0,
        };
      }
      url += `&course-category=${categoryId}`;
    }

    const [res, categories] = await Promise.all([
      wpFetch(url, {
        next: { revalidate: REVALIDATE_SECONDS, tags: [COURSE_CACHE_TAG] },
      }),
      fetchCategoryList(),
    ]);

    if (!res.ok) {
      console.error("WP listing page error:", res.status, res.statusText, url);
      return {
        courses: [],
        page: requestedPage,
        perPage,
        total: 0,
        totalPages: 0,
      };
    }

    const total = parseInt(res.headers.get("X-WP-Total") || "0", 10);
    const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "0", 10);
    const wpCourses: WPCourse[] = await res.json();
    const categoryById = new Map(
      categories.map((category) => [category.id, category]),
    );
    const mediaIds = wpCourses
      .filter(
        (course) =>
          !course.thorius_youtube?.thumbnail_url &&
          !course.thorius_youtube?.video_id &&
          (course.featured_media ?? 0) > 0,
      )
      .map((course) => course.featured_media);
    const mediaById = await fetchFeaturedMediaMap(mediaIds);
    const courses = wpCourses.map((course) =>
      transformListingCourse(course, categoryById, mediaById),
    );

    return {
      courses,
      page: requestedPage,
      perPage,
      total,
      totalPages,
    };
  } catch (error) {
    console.error("fetchCoursesListingPage error:", error);
    return {
      courses: [],
      page: requestedPage,
      perPage,
      total: 0,
      totalPages: 0,
    };
  }
}

export async function fetchCoursesForListing(): Promise<Course[]> {
  try {
    const [wpCourses, categories] = await Promise.all([
      fetchWPCourses(
        `${WP_API_BASE}/courses?per_page=100&status=publish&_fields=${LISTING_COURSE_FIELDS}`,
      ),
      fetchCategoryList(),
    ]);

    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const mediaIds = wpCourses
      .filter(
        (course) =>
          !course.thorius_youtube?.thumbnail_url &&
          !course.thorius_youtube?.video_id &&
          (course.featured_media ?? 0) > 0,
      )
      .map((course) => course.featured_media);

    const mediaById = await fetchFeaturedMediaMap(mediaIds);

    return wpCourses.map((course) =>
      transformListingCourse(course, categoryById, mediaById),
    );
  } catch (error) {
    console.error("fetchCoursesForListing error:", error);
    return [];
  }
}

/** Build/deploy için yalnızca slug listesi — tam kurs gövdesi çekilmez. */
export async function fetchAllCourseSlugs(): Promise<string[]> {
  try {
    const wpCourses = await fetchWPCourses(
      `${WP_API_BASE}/courses?per_page=100&status=publish&_fields=slug`,
    );
    return wpCourses.map((course) => course.slug);
  } catch (error) {
    console.error("fetchAllCourseSlugs error:", error);
    return [];
  }
}

export async function fetchAllCourses(): Promise<Course[]> {
  return fetchCoursesForListing();
}

export async function fetchCourseBySlug(
  slug: string,
  options?: { timeoutMs?: number },
): Promise<Course | null> {
  const timeoutMs = options?.timeoutMs ?? WP_FETCH_TIMEOUT_MS;

  for (const variant of getCourseSlugLookupVariants(slug)) {
    try {
      const res = await wpFetch(
        `${WP_API_BASE}/courses?slug=${encodeURIComponent(variant)}&_embed=true`,
        {
          signal: AbortSignal.timeout(timeoutMs),
          next: {
            revalidate: REVALIDATE_SECONDS,
            tags: [COURSE_CACHE_TAG, courseSlugCacheTag(variant)],
          },
        },
      );

      if (!res.ok) continue;

      const wpCourses: WPCourse[] = await res.json();
      if (wpCourses.length) {
        return transformCourse(wpCourses[0]);
      }
    } catch (error) {
      console.error("fetchCourseBySlug error:", error);
    }
  }

  return null;
}

export async function fetchCategoryList(): Promise<WPCategory[]> {
  try {
    const res = await wpFetch(
      `${WP_API_BASE}/course-category?per_page=100&hide_empty=true`,
      {
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: [COURSE_CATEGORY_CACHE_TAG],
        },
      },
    );

    if (!res.ok) {
      return [];
    }

    return (await res.json()) as WPCategory[];
  } catch (error) {
    console.error("fetchCategoryList error:", error);
    return [];
  }
}

export function enrichCategoriesFromCourses(
  categories: WPCategory[],
  courses: Course[],
): WPCategory[] {
  const imageByCategoryId = new Map<number, string | null>();

  for (const category of categories) {
    const pickedCourse = pickCategoryCoverCourse(category, courses);
    imageByCategoryId.set(category.id, pickedCourse?.featuredImage ?? null);
  }

  return categories.map((category) => ({
    ...category,
    image: imageByCategoryId.get(category.id) ?? null,
  }));
}

export async function fetchAllCategories(
  courses?: Course[],
): Promise<WPCategory[]> {
  try {
    const categories = await fetchCategoryList();
    if (courses?.length) {
      return enrichCategoriesFromCourses(categories, courses);
    }
    return categories;
  } catch (error) {
    console.error("fetchAllCategories error:", error);
    return [];
  }
}

export async function fetchCoursesByCategory(
  categorySlug: string,
): Promise<Course[]> {
  try {
    const catRes = await wpFetch(
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
      `${WP_API_BASE}/courses?_embed=true&per_page=100&course-category=${catId}`,
    );

    return wpCourses.map((course) =>
      transformCourse(course, { includeContent: false }),
    );
  } catch (error) {
    console.error("fetchCoursesByCategory error:", error);
    return [];
  }
}
