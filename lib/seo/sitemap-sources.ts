import {
  BLOG_CACHE_TAG,
  COURSE_CACHE_TAG,
} from "@/lib/wordpress/cache-tags";

const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://thorius.com.tr/wp-json/wp/v2";

const REVALIDATE_SECONDS = 3600;

export interface SitemapContentEntry {
  slug: string;
  lastModified: Date;
}

interface WPSitemapItem {
  slug: string;
  date: string;
  modified?: string;
}

async function fetchAllWpItems(
  endpoint: string,
  fields: string,
  cacheTag: string,
  extraQuery = "",
): Promise<WPSitemapItem[]> {
  const baseUrl = `${WP_API_BASE}/${endpoint}?per_page=100&_fields=${fields}${extraQuery}`;
  const separator = baseUrl.includes("?") ? "&" : "?";
  const firstRes = await fetch(`${baseUrl}${separator}page=1`, {
    next: { revalidate: REVALIDATE_SECONDS, tags: [cacheTag] },
  });

  if (!firstRes.ok) {
    console.error("Sitemap WP API error:", firstRes.status, endpoint);
    return [];
  }

  const totalPages = parseInt(firstRes.headers.get("X-WP-TotalPages") || "1", 10);
  const firstBatch = (await firstRes.json()) as WPSitemapItem[];

  if (totalPages <= 1) {
    return firstBatch;
  }

  const remainingBatches = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => {
      const page = index + 2;
      return fetch(`${baseUrl}${separator}page=${page}`, {
        next: { revalidate: REVALIDATE_SECONDS, tags: [cacheTag] },
      }).then(async (res) => {
        if (!res.ok) {
          return [] as WPSitemapItem[];
        }
        return res.json() as Promise<WPSitemapItem[]>;
      });
    }),
  );

  return [...firstBatch, ...remainingBatches.flat()];
}

function toLastModified(item: WPSitemapItem): Date {
  return new Date(item.modified || item.date);
}

export async function fetchCourseSitemapEntries(): Promise<SitemapContentEntry[]> {
  try {
    const items = await fetchAllWpItems(
      "courses",
      "slug,date,modified",
      COURSE_CACHE_TAG,
      "&status=publish",
    );

    return items
      .filter((item) => item.slug)
      .map((item) => ({
        slug: item.slug,
        lastModified: toLastModified(item),
      }));
  } catch (error) {
    console.error("fetchCourseSitemapEntries error:", error);
    return [];
  }
}

export async function fetchBlogSitemapEntries(): Promise<SitemapContentEntry[]> {
  try {
    const items = await fetchAllWpItems(
      "posts",
      "slug,date,modified",
      BLOG_CACHE_TAG,
    );

    return items
      .filter((item) => item.slug)
      .map((item) => ({
        slug: item.slug,
        lastModified: toLastModified(item),
      }));
  } catch (error) {
    console.error("fetchBlogSitemapEntries error:", error);
    return [];
  }
}
