import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getSiteUrl } from "@/lib/seo/site-url";
import {
  getKitaplikOrigin,
  getShopOrigin,
  getSiteModeFromHost,
} from "@/lib/site/site-mode";

type RobotRule = {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
};

/** Low-value scrapers — Disallow everything. Good bots stay on the * rule. */
const BLOCKED_BOTS = [
  "Amazonbot",
  "Baiduspider",
  "seranking-backlinks",
  "SERankingBacklinks",
] as const;

function withBlockedBots(defaultRule: RobotRule): MetadataRoute.Robots["rules"] {
  const rules: RobotRule[] = [
    ...BLOCKED_BOTS.map((userAgent) => ({
      userAgent,
      disallow: "/",
    })),
    defaultRule,
  ];
  return rules as MetadataRoute.Robots["rules"];
}

export default function robots(): MetadataRoute.Robots {
  const host = headers().get("host");
  const mode = getSiteModeFromHost(host);

  if (mode === "kitaplik") {
    const siteUrl = getKitaplikOrigin();
    return {
      rules: withBlockedBots({
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
      }),
      sitemap: `${siteUrl}/sitemap.xml`,
      host: siteUrl,
    };
  }

  if (mode === "shop") {
    const siteUrl = getShopOrigin();
    return {
      rules: withBlockedBots({
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/giris", "/kayit", "/auth/"],
      }),
      sitemap: `${siteUrl}/sitemap.xml`,
      host: siteUrl,
    };
  }

  const siteUrl = getSiteUrl();
  return {
    rules: withBlockedBots({
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
    }),
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
