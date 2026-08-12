import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import {
  defaultLocale,
  getLocaleFromPathname,
  prefixWithLocale,
  stripLocalePrefix,
} from "@/lib/i18n/locale";
import { updateSession } from "@/lib/supabase/middleware";
import {
  getAcademyOrigin,
  getCompanyOrigin,
  getKitaplikOrigin,
  getShopOrigin,
  getSiteModeFromHost,
  getWordPressOrigin,
  isCompanyAllowedPath,
  isCompanyRedirectToAcademyPath,
  isCompanyRedirectToWordPressPath,
  isCompanySiteHost,
  isKitaplikAllowedPath,
  isKitaplikSiteHost,
  isShopAllowedPath,
  isShopSiteHost,
  isSitePublicAssetPath,
} from "@/lib/site/site-mode";

const intlMiddleware = createIntlMiddleware(routing);

const LOCALE_EXEMPT_PREFIXES = [
  "/panel",
  "/instructor",
  "/api",
  "/auth",
  "/yayinevi",
] as const;

function isLocaleExempt(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  if (isSitePublicAssetPath(stripped)) {
    return true;
  }
  return LOCALE_EXEMPT_PREFIXES.some(
    (prefix) => stripped === prefix || stripped.startsWith(`${prefix}/`),
  );
}

function shouldApplyIntlRouting(host: string | null, pathname: string): boolean {
  if (isLocaleExempt(pathname)) {
    return false;
  }

  return getSiteModeFromHost(host) === "academy";
}

function rewriteToDefaultLocale(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (getLocaleFromPathname(pathname)) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.pathname = prefixWithLocale(pathname, defaultLocale);
  return NextResponse.rewrite(url);
}

function redirectToAcademy(request: NextRequest) {
  const pathname = prefixWithLocale(
    stripLocalePrefix(request.nextUrl.pathname),
    defaultLocale,
  );
  const destination = new URL(
    `${pathname}${request.nextUrl.search}`,
    getAcademyOrigin(),
  );
  return NextResponse.redirect(destination);
}

function redirectToWordPress(request: NextRequest) {
  const destination = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    getWordPressOrigin(),
  );
  return NextResponse.redirect(destination);
}

function redirectToCompanyHome() {
  return NextResponse.redirect(new URL("/", getCompanyOrigin()));
}

function redirectToShopHome() {
  return NextResponse.redirect(new URL("/", getShopOrigin()));
}

function redirectToKitaplikHome() {
  return NextResponse.redirect(new URL("/", getKitaplikOrigin()));
}

function redirectCompanyKitaplikPath() {
  return NextResponse.redirect(new URL("/", getKitaplikOrigin()), 308);
}

function resolveSiteModePath(pathname: string): string {
  return stripLocalePrefix(pathname);
}

function isLegacyCompanyKitaplikPath(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  return stripped === "/kitaplik" || stripped.startsWith("/kitaplik/");
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const { pathname } = request.nextUrl;
  const sitePath = resolveSiteModePath(pathname);

  // Cheap reject for scrapers that burn Fluid CPU (robots.txt is advisory only).
  const ua = request.headers.get("user-agent") ?? "";
  if (
    /amazonbot|baiduspider|seranking-backlinks|serankingbacklinks/i.test(ua)
  ) {
    return new NextResponse(null, {
      status: 403,
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  }

  if (isKitaplikSiteHost(host)) {
    if (isCompanyRedirectToAcademyPath(sitePath)) {
      return redirectToAcademy(request);
    }

    if (!isKitaplikAllowedPath(sitePath)) {
      return redirectToKitaplikHome();
    }
  }

  if (isShopSiteHost(host)) {
    if (isCompanyRedirectToAcademyPath(sitePath)) {
      return redirectToAcademy(request);
    }

    if (!isShopAllowedPath(sitePath)) {
      return redirectToShopHome();
    }
  }

  if (isCompanySiteHost(host)) {
    if (isLegacyCompanyKitaplikPath(sitePath)) {
      return redirectCompanyKitaplikPath();
    }

    if (isCompanyRedirectToWordPressPath(sitePath)) {
      return redirectToWordPress(request);
    }

    if (isCompanyRedirectToAcademyPath(sitePath)) {
      return redirectToAcademy(request);
    }

    if (!isCompanyAllowedPath(sitePath)) {
      return redirectToCompanyHome();
    }
  }

  let response: NextResponse;

  if (shouldApplyIntlRouting(host, pathname)) {
    response = intlMiddleware(request);
  } else if (!isLocaleExempt(pathname)) {
    response = rewriteToDefaultLocale(request) ?? NextResponse.next();
  } else {
    response = NextResponse.next();
  }

  return await updateSession(request, response);
}

export const config = {
  matcher: [
    /*
     * Skip static assets, SEO files, and OG/Twitter image routes so CDN can
     * cache them without middleware cookies/rewrites.
     */
    "/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|manifest\\.json|images/|videos/|media/|api/|.*(?:opengraph-image|twitter-image).*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|mov|m4v|css|js|mjs|map|woff|woff2|ttf|otf|txt|xml)$).*)",
  ],
};
