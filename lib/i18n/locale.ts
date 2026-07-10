import { routing, type AppLocale } from "@/i18n/routing";

export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;

export function stripLocalePrefix(pathname: string): string {
  for (const locale of locales) {
    if (pathname === `/${locale}`) {
      return "/";
    }

    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || "/";
    }
  }

  return pathname;
}

export function getLocaleFromPathname(pathname: string): AppLocale | null {
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }

  return null;
}

export function prefixWithLocale(
  pathname: string,
  locale: AppLocale = defaultLocale,
): string {
  const stripped = stripLocalePrefix(pathname);
  if (stripped === "/") {
    return `/${locale}`;
  }

  return `/${locale}${stripped}`;
}

export function isLocalePrefixedPath(pathname: string): boolean {
  return getLocaleFromPathname(pathname) !== null;
}
