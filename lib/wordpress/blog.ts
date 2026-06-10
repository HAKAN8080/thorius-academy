import type { BlogPost, WPPost } from "@/types/blog";
import { BLOG_CACHE_TAG, blogSlugCacheTag } from "@/lib/wordpress/cache-tags";
import { decodeHtmlEntities } from "@/lib/utils/decode-html-entities";

const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://thorius.com.tr/wp-json/wp/v2";

const REVALIDATE_SECONDS = 3600;
const WP_FETCH_TIMEOUT_MS = 25_000;

async function fetchWpJson<T>(
  url: string,
  tags: string[] = [BLOG_CACHE_TAG],
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS, tags },
      signal: AbortSignal.timeout(WP_FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error("WP API error:", res.status, res.statusText, url);
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error("WP fetch failed:", url, error);
    return null;
  }
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(html);
}

function parseExcerpt(html: string): string {
  return stripHtml(html).replace(/\s*(\[\.\.\.\]|…|\.{3,})\s*$/, "").trim();
}

function transformListingPost(wpPost: WPPost): BlogPost {
  const title = stripHtml(wpPost.title.rendered);

  return {
    id: wpPost.id,
    slug: wpPost.slug,
    title,
    excerpt: parseExcerpt(wpPost.excerpt.rendered),
    content: "",
    featuredImage: null,
    imageAlt: title,
    author: null,
    publishedDate: wpPost.date,
    wpLink: wpPost.link ?? "",
  };
}

function transformPost(wpPost: WPPost): BlogPost {
  const title = stripHtml(wpPost.title.rendered);
  const author = wpPost._embedded?.author?.[0];

  return {
    id: wpPost.id,
    slug: wpPost.slug,
    title,
    excerpt: parseExcerpt(wpPost.excerpt.rendered),
    content: wpPost.content.rendered,
    featuredImage: null,
    imageAlt: title,
    author: author
      ? {
          id: author.id,
          name: author.name,
          avatar: null,
        }
      : null,
    publishedDate: wpPost.date,
    wpLink: wpPost.link,
  };
}

export async function getBlogPosts(limit = 20): Promise<BlogPost[]> {
  const posts = await fetchWpJson<WPPost[]>(
    `${WP_API_BASE}/posts?per_page=${limit}&orderby=date&order=desc&_fields=id,slug,date,title,excerpt`,
  );

  if (!posts?.length) {
    return [];
  }

  return posts.map(transformListingPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await fetchWpJson<WPPost[]>(
    `${WP_API_BASE}/posts?slug=${encodeURIComponent(slug)}&_fields=id,slug,date,title,excerpt,content,link&_embed=author`,
    [BLOG_CACHE_TAG, blogSlugCacheTag(slug)],
  );

  const post = posts?.[0];
  return post ? transformPost(post) : null;
}
