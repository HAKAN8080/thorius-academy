import {
  defaultLocale,
  prefixWithLocale,
  stripLocalePrefix,
} from "@/lib/i18n/locale";

/** Oturum gerektiren Academy uygulama yolları. */
export function isProtectedAppPath(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  return (
    stripped === "/panel" ||
    stripped.startsWith("/panel/") ||
    stripped === "/instructor" ||
    stripped.startsWith("/instructor/")
  );
}

export function buildLoginRedirectPath(
  pathname: string,
  search = "",
  locale = defaultLocale,
): string {
  const target = `${pathname}${search}`;
  return prefixWithLocale("/giris", locale) + `?redirect=${encodeURIComponent(target)}`;
}
