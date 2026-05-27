import type { BlogPost, WPPost } from "@/types/blog";
import { BLOG_CACHE_TAG, blogSlugCacheTag } from "@/lib/wordpress/cache-tags";
import { decodeHtmlEntities } from "@/lib/utils/decode-html-entities";

const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://thorius.com.tr/wp-json/wp/v2";

const REVALIDATE_SECONDS = 3600;

function stripHtml(html: string): string {
  return decodeHtmlEntities(html);
}

function parseExcerpt(html: string): string {
  return stripHtml(html).replace(/\s*(\[\.\.\.\]|…|\.{3,})\s*$/, "").trim();
}

function transformPost(wpPost: WPPost): BlogPost {
  const title = stripHtml(wpPost.title.rendered);
  const featuredMedia = wpPost._embedded?.["wp:featuredmedia"]?.[0];
  const author = wpPost._embedded?.author?.[0];

  return {
    id: wpPost.id,
    slug: wpPost.slug,
    title,
    excerpt: parseExcerpt(wpPost.excerpt.rendered),
    content: wpPost.content.rendered,
    featuredImage: featuredMedia?.source_url ?? null,
    imageAlt: featuredMedia?.alt_text?.trim() || title,
    author: author
      ? {
          id: author.id,
          name: author.name,
          avatar: author.avatar_urls?.["96"] ?? null,
        }
      : null,
    publishedDate: wpPost.date,
    wpLink: wpPost.link,
  };
}

export async function getBlogPosts(limit = 20): Promise<BlogPost[]> {
  const res = await fetch(
    `${WP_API_BASE}/posts?per_page=${limit}&_embed=1&orderby=date&order=desc`,
    {
      next: { revalidate: REVALIDATE_SECONDS, tags: [BLOG_CACHE_TAG] },
    },
  );

  if (!res.ok) {
    console.error("WP posts API error:", res.status, res.statusText);
    return [];
  }

  const posts = (await res.json()) as WPPost[];
  return posts.map(transformPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const res = await fetch(
    `${WP_API_BASE}/posts?slug=${encodeURIComponent(slug)}&_embed=1`,
    {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: [BLOG_CACHE_TAG, blogSlugCacheTag(slug)],
      },
    },
  );

  if (!res.ok) {
    console.error("WP post API error:", res.status, res.statusText);
    return null;
  }

  const posts = (await res.json()) as WPPost[];
  const post = posts[0];
  return post ? transformPost(post) : null;
}
