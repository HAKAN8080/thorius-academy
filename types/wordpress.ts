export interface WPCourse {
  id: number;
  date: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  "course-category": number[];
  "course-tag": number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      id: number;
      source_url: string;
      media_details?: {
        sizes?: {
          medium?: { source_url: string; width: number; height: number };
          large?: { source_url: string; width: number; height: number };
          full?: { source_url: string; width: number; height: number };
        };
      };
      alt_text?: string;
    }>;
    author?: Array<{
      id: number;
      name: string;
      slug: string;
      description?: string;
      avatar_urls?: { "24": string; "48": string; "96": string };
    }>;
    "wp:term"?: Array<
      Array<{
        id: number;
        name: string;
        slug: string;
        taxonomy: string;
      }>
    >;
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  taxonomy: string;
}

export interface WPAuthor {
  id: number;
  name: string;
  slug: string;
  description: string;
  avatar_urls?: { "24": string; "48": string; "96": string };
}

export interface Course {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  imageAlt: string;
  instructor: {
    id: number;
    name: string;
    slug: string;
    avatar: string | null;
  } | null;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  wpLink: string;
  publishedDate: string;
}
