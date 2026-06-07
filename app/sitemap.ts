import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-url";
import {
  fetchBlogSitemapEntries,
  fetchCourseSitemapEntries,
} from "@/lib/seo/sitemap-sources";

export const revalidate = 3600;

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/kurslar", changeFrequency: "daily", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/kurumsal", changeFrequency: "monthly", priority: 0.7 },
  { path: "/hakkimizda", changeFrequency: "monthly", priority: 0.7 },
  { path: "/kariyer-yolu", changeFrequency: "monthly", priority: 0.85 },
  {
    path: "/kariyer-yolu/retail-planning",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/kariyer-yolu/insan-kaynaklari",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/kariyer-yolu/yapay-zeka",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  { path: "/iletisim", changeFrequency: "monthly", priority: 0.6 },
  {
    path: "/egitmen-destek-kilavuzu",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  { path: "/gizlilik", changeFrequency: "yearly", priority: 0.3 },
  { path: "/kvkk", changeFrequency: "yearly", priority: 0.3 },
  { path: "/kullanim-kosullari", changeFrequency: "yearly", priority: 0.3 },
  { path: "/mesafeli-satis", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [courses, blogPosts] = await Promise.all([
    fetchCourseSitemapEntries(),
    fetchBlogSitemapEntries(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const courseEntries: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${siteUrl}/kurslar/${course.slug}`,
    lastModified: course.lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...courseEntries, ...blogEntries];
}
