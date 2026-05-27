export interface WPPost {
  id: number;
  date: string;
  slug: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  author: number;
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      id: number;
      source_url: string;
      alt_text?: string;
    }>;
    author?: Array<{
      id: number;
      name: string;
      slug: string;
      avatar_urls?: { "48": string; "96": string };
    }>;
  };
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  imageAlt: string;
  author: {
    id: number;
    name: string;
    avatar: string | null;
  } | null;
  publishedDate: string;
  wpLink: string;
}
