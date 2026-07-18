import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getSiteUrl } from "@/lib/seo/site-url";
import {
  getKitaplikOrigin,
  getShopOrigin,
  getSiteModeFromHost,
} from "@/lib/site/site-mode";

export default function robots(): MetadataRoute.Robots {
  const host = headers().get("host");
  const mode = getSiteModeFromHost(host);

  if (mode === "kitaplik") {
    const siteUrl = getKitaplikOrigin();
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/panel/",
            "/giris",
            "/kayit",
            "/auth/",
            "/api/",
            "/oku/",
            "/dinle/",
            "/kitaplarim",
            "/kitaplik-yonetim",
          ],
        },
      ],
      sitemap: `${siteUrl}/sitemap.xml`,
      host: siteUrl,
    };
  }

  if (mode === "shop") {
    const siteUrl = getShopOrigin();
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/api/", "/giris", "/kayit", "/auth/"],
        },
      ],
      sitemap: `${siteUrl}/sitemap.xml`,
      host: siteUrl,
    };
  }

  const siteUrl = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/panel/",
          "/giris",
          "/kayit",
          "/auth/",
          "/api/",
          "/tesekkurler",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
