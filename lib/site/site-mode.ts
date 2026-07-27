import {
  defaultLocale,
  prefixWithLocale,
  stripLocalePrefix,
} from "@/lib/i18n/locale";

export type SiteMode = "company" | "academy" | "shop" | "kitaplik";

const COMPANY_HOSTS = new Set(["thorius.com.tr", "www.thorius.com.tr"]);
const SHOP_HOSTS = new Set(["shop.thorius.com.tr"]);
const KITAPLIK_HOSTS = new Set(["kitaplik.thorius.com.tr"]);

export function normalizeHost(host: string | null | undefined): string {
  return (host ?? "").toLowerCase().split(":")[0] ?? "";
}

export function getSiteModeFromHost(host: string | null | undefined): SiteMode {
  const override = process.env.NEXT_PUBLIC_SITE_MODE?.trim().toLowerCase();
  if (
    override === "company" ||
    override === "academy" ||
    override === "shop" ||
    override === "kitaplik"
  ) {
    return override;
  }

  const normalized = normalizeHost(host);
  if (KITAPLIK_HOSTS.has(normalized)) {
    return "kitaplik";
  }
  if (SHOP_HOSTS.has(normalized)) {
    return "shop";
  }
  if (COMPANY_HOSTS.has(normalized)) {
    return "company";
  }

  return "academy";
}

export function isCompanySiteHost(host: string | null | undefined): boolean {
  return getSiteModeFromHost(host) === "company";
}

export function isShopSiteHost(host: string | null | undefined): boolean {
  return getSiteModeFromHost(host) === "shop";
}

export function isKitaplikSiteHost(host: string | null | undefined): boolean {
  return getSiteModeFromHost(host) === "kitaplik";
}

/** Academy uygulaması (panel, kurslar, auth) — her zaman academy subdomain. */
export function getAcademyOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  return configured || "https://academy.thorius.com.tr";
}

/** Kurumsal vitrin (şirket tanıtımı). */
export function getCompanyOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_COMPANY_SITE_URL?.replace(/\/$/, "");
  return configured || "https://thorius.com.tr";
}

/** Kitap mağazası vitrin. */
export function getShopOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SHOP_SITE_URL?.replace(/\/$/, "");
  return configured || "https://shop.thorius.com.tr";
}

/** Koçluk platformu. */
export function getCoachingOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_COACHING_SITE_URL?.replace(
    /\/$/,
    "",
  );
  return configured || "https://coaching.thorius.com.tr";
}

/** E-kitap + basılı kitap vitrin. */
export function getKitaplikOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_KITAPLIK_SITE_URL?.replace(
    /\/$/,
    "",
  );
  return configured || "https://kitaplik.thorius.com.tr";
}

export function kitaplikPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getKitaplikOrigin()}${normalized}`;
}

export function shopPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getShopOrigin()}${normalized}`;
}

export function academyPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getAcademyOrigin()}${normalized}`;
}

/** LMS / öğrenci uygulaması — kurumsal vitrinde academy subdomain'e yönlendirilir. */
export const ACADEMY_ONLY_PATH_PREFIXES = [
  "/kurslar",
  "/kariyer-yolu",
  "/panel",
  "/instructor",
  "/giris",
  "/kayit",
  "/yeni-parola",
  "/auth",
  "/tesekkurler",
  "/belge",
  "/egitmen-destek-kilavuzu",
] as const;

export function isAcademyOnlyPath(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  return ACADEMY_ONLY_PATH_PREFIXES.some(
    (prefix) => stripped === prefix || stripped.startsWith(`${prefix}/`),
  );
}

export function resolveAcademyHref(
  href: string,
  isCompanySite: boolean,
): string {
  if (!isCompanySite) {
    return href;
  }

  const [pathAndQuery] = href.split("#");
  const [pathname] = pathAndQuery.split("?");

  if (!isAcademyOnlyPath(pathname)) {
    return href;
  }

  const localizedHref = prefixWithLocale(pathname, defaultLocale);
  return academyPath(
    href.includes("#")
      ? localizedHref + href.slice(href.indexOf("#"))
      : localizedHref,
  );
}

/** WordPress (WooCommerce checkout, REST API) — apex taşındıktan sonra alt domain. */
export function getWordPressOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_WP_SITE_URL?.replace(/\/$/, "");
  return configured || "https://wp.thorius.com.tr";
}

export function wordPressPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getWordPressOrigin()}${normalized}`;
}

/** thorius.com.tr → WordPress alt domain (ödeme, wp-json, admin). */
export const COMPANY_REDIRECT_TO_WORDPRESS_PREFIXES = [
  "/odeme",
  "/wp-json",
  "/wp-admin",
  "/wp-content",
  "/wp-includes",
  "/wp-login.php",
] as const;

export function isCompanyRedirectToWordPressPath(pathname: string): boolean {
  return COMPANY_REDIRECT_TO_WORDPRESS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** thorius.com.tr üzerinde açık kalacak sayfalar. */
export const COMPANY_ALLOWED_PATH_PREFIXES = [
  "/hakkimizda",
  "/kurumsal",
  "/iletisim",
  "/gizlilik",
  "/kvkk",
  "/kullanim-kosullari",
] as const;

/** Academy subdomain'e yönlendirilecek (LMS / academy içerik) yollar. */
export const COMPANY_REDIRECT_TO_ACADEMY_PREFIXES = [
  ...ACADEMY_ONLY_PATH_PREFIXES,
  "/blog",
  "/blog-yazilari",
  "/mesafeli-satis",
] as const;

export function isCompanyAllowedPath(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  if (stripped === "/") {
    return true;
  }

  return COMPANY_ALLOWED_PATH_PREFIXES.some(
    (prefix) =>
      stripped === prefix || stripped.startsWith(`${prefix}/`),
  );
}

export function isCompanyRedirectToAcademyPath(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  return COMPANY_REDIRECT_TO_ACADEMY_PREFIXES.some(
    (prefix) => stripped === prefix || stripped.startsWith(`${prefix}/`),
  );
}

export interface CompanyNavLink {
  href: string;
  label: string;
  external?: boolean;
}

/** thorius.com.tr ana menüsü — academy yolları runtime'da academyPath ile çözülür. */
export function getCompanyNavLinks(): CompanyNavLink[] {
  return [
    { href: "/#hizmetler", label: "Hizmetler" },
    { href: "/#yaklasim", label: "Yaklaşım" },
    { href: "/#referanslar", label: "Referanslar" },
    { href: "/kurslar", label: "Academy", external: true },
    {
      href: "https://coaching.thorius.com.tr",
      label: "Coaching",
      external: true,
    },
    {
      href: shopPath("/"),
      label: "Mağaza",
      external: true,
    },
    { href: "/hakkimizda", label: "Hakkımızda" },
    { href: "/iletisim", label: "İletişim" },
  ];
}

export function resolveCompanyNavHref(
  link: CompanyNavLink,
): CompanyNavLink {
  if (link.external && link.href.startsWith("http")) {
    return link;
  }

  if (link.href === "/kurslar" || link.href.startsWith("/kurslar")) {
    return { ...link, href: academyPath(link.href), external: true };
  }

  return link;
}

/** shop.thorius.com.tr üzerinde açık kalacak sayfalar. */
export const SHOP_ALLOWED_PATH_PREFIXES = ["/kitap"] as const;

export function isShopAllowedPath(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  if (stripped === "/") {
    return true;
  }

  if (isSitePublicAssetPath(stripped)) {
    return true;
  }

  return SHOP_ALLOWED_PATH_PREFIXES.some(
    (prefix) => stripped === prefix || stripped.startsWith(`${prefix}/`),
  );
}

/** kitaplik.thorius.com.tr üzerinde açık kalacak sayfalar.
 * Auth (/giris, /kayit, …) ACADEMY_ONLY — middleware academy'ye yönlendirir.
 */
export const KITAPLIK_ALLOWED_PATH_PREFIXES = [
  "/kitap",
  "/kitaplarim",
  "/oku",
  "/dinle",
  "/kitaplik-yonetim",
] as const;

/** SEO / favicon — subdomain allow-list'inde unutulursa botlar ana sayfaya düşer. */
export const SITE_PUBLIC_ASSET_PATHS = [
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/icon",
  "/icon.png",
  "/apple-icon",
  "/apple-icon.png",
  "/favicon-32.png",
  "/manifest.webmanifest",
  "/manifest.json",
] as const;

export function isSitePublicAssetPath(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  if (SITE_PUBLIC_ASSET_PATHS.some((path) => stripped === path)) {
    return true;
  }
  // Next.js icon route variants: /icon-xxx, /apple-icon-xxx
  return (
    stripped.startsWith("/icon") ||
    stripped.startsWith("/apple-icon") ||
    stripped.startsWith("/favicon")
  );
}

export function isKitaplikAllowedPath(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  if (stripped === "/") {
    return true;
  }

  if (isSitePublicAssetPath(stripped)) {
    return true;
  }

  return KITAPLIK_ALLOWED_PATH_PREFIXES.some(
    (prefix) => stripped === prefix || stripped.startsWith(`${prefix}/`),
  );
}
