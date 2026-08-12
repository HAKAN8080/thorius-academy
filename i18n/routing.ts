import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  localePrefix: "always",
  // Path already encodes locale — skip Accept-Language cookie/redirects (CDN-friendlier).
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
