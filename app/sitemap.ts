import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { routing } from "@/i18n/routing";
import { listPublishedLibraryBooks } from "@/lib/kitaplik/repository";
import { getSiteUrl } from "@/lib/seo/site-url";
import {
  fetchBlogSitemapEntries,
  fetchCourseSitemapEntries,
} from "@/lib/seo/sitemap-sources";
import {
  getKitaplikOrigin,
  getShopOrigin,
  getSiteModeFromHost,
} from "@/lib/site/site-mode";

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
  { path: "/sss", changeFrequency: "monthly", priority: 0.7 },
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

function localizedPath(locale: string, path: string) {
  if (path === "/") {
    return `/${locale}`;
  }

  return `/${locale}${path}`;
}

function buildLocalizedEntry(
  siteUrl: string,
  path: string,
  options: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: `${siteUrl}${localizedPath(locale, path)}`,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((item) => [
          item,
          `${siteUrl}${localizedPath(item, path)}`,
        ]),
      ),
    },
    ...options,
  }));
}

async function buildKitaplikSitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getKitaplikOrigin();
  const books = await listPublishedLibraryBooks();

  const home: MetadataRoute.Sitemap[number] = {
    url: `${siteUrl}/`,
    changeFrequency: "daily",
    priority: 1,
  };

  const bookEntries: MetadataRoute.Sitemap = books.map((book) => ({
    url: `${siteUrl}/kitap/${book.slug}`,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [home, ...bookEntries];
}

async function buildShopSitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getShopOrigin();
  return [
    {
      url: `${siteUrl}/`,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = headers().get("host");
  const mode = getSiteModeFromHost(host);

  if (mode === "kitaplik") {
    return buildKitaplikSitemap();
  }

  if (mode === "shop") {
    return buildShopSitemap();
  }

  const siteUrl = getSiteUrl();
  const [courses, blogPosts] = await Promise.all([
    fetchCourseSitemapEntries(),
    fetchBlogSitemapEntries(),
  ]);

  const staticEntries = staticRoutes.flatMap((route) =>
    buildLocalizedEntry(siteUrl, route.path, {
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }),
  );

  const courseEntries = courses.flatMap((course) =>
    buildLocalizedEntry(siteUrl, `/kurslar/${course.slug}`, {
      lastModified: course.lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  const blogEntries = blogPosts.flatMap((post) =>
    buildLocalizedEntry(siteUrl, `/blog/${post.slug}`, {
      lastModified: post.lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  );

  return [...staticEntries, ...courseEntries, ...blogEntries];
}
