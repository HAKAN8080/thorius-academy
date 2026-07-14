import { safeRedirectTarget } from "@/lib/auth/app-url";
import { isProtectedAppPath } from "@/lib/auth/protected-paths";
import {
  defaultLocale,
  getLocaleFromPathname,
  stripLocalePrefix,
} from "@/lib/i18n/locale";
import { mergeAuthCookieOptions } from "@/lib/supabase/auth-cookies";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/giris", "/kayit"] as const;
const PUBLIC_PREFIXES = ["/auth/callback"] as const;

function isPublicPath(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);

  if (AUTH_ROUTES.some((route) => stripped === route)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => stripped.startsWith(prefix));
}

function applySessionCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach(({ name, value }) => {
    target.cookies.set(name, value, mergeAuthCookieOptions());
  });
}

/**
 * Only resolve the Supabase user when auth routing needs it.
 * Public marketing/RSC traffic must not wait on auth.getUser() — that path
 * caused intermittent 503 timeouts under navigation prefetch load.
 */
function needsAuthUserLookup(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);

  if (isProtectedAppPath(stripped)) {
    return true;
  }

  if (AUTH_ROUTES.includes(stripped as (typeof AUTH_ROUTES)[number])) {
    return true;
  }

  if (stripped === "/auth" || stripped.startsWith("/auth/")) {
    return true;
  }

  return false;
}

/**
 * Middleware session refresh — Supabase auth cookies for protected/auth routes.
 */
export async function updateSession(
  request: NextRequest,
  initialResponse?: NextResponse,
) {
  const { pathname, search } = request.nextUrl;
  const strippedPath = stripLocalePrefix(pathname);
  const locale = getLocaleFromPathname(pathname) ?? defaultLocale;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const supabaseResponse =
    initialResponse ??
    NextResponse.next({
      request: { headers: requestHeaders },
    });

  if (!needsAuthUserLookup(pathname)) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: mergeAuthCookieOptions(),
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(
              name,
              value,
              mergeAuthCookieOptions(options),
            );
          });
        },
      },
    },
  );

  let user = null;
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("getUser timeout")), 1500);
      }),
    ]);
    user = result.data.user;
  } catch (error) {
    console.error("[middleware] supabase.auth.getUser failed:", error);
    if (isProtectedAppPath(strippedPath)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `/${locale}/giris`;
      loginUrl.search = "";
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      loginUrl.searchParams.delete("error");
      const redirectResponse = NextResponse.redirect(loginUrl);
      applySessionCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }
    return supabaseResponse;
  }

  if (
    user &&
    AUTH_ROUTES.includes(strippedPath as (typeof AUTH_ROUTES)[number])
  ) {
    const redirectTo = safeRedirectTarget(
      request.nextUrl.searchParams.get("redirect"),
    );
    if (redirectTo.startsWith("http://") || redirectTo.startsWith("https://")) {
      const redirectResponse = NextResponse.redirect(redirectTo);
      applySessionCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }
    const destination = request.nextUrl.clone();
    destination.pathname = redirectTo.startsWith("/")
      ? redirectTo
      : `/${redirectTo}`;
    destination.search = "";
    const redirectResponse = NextResponse.redirect(destination);
    applySessionCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  if (isPublicPath(pathname)) {
    return supabaseResponse;
  }

  if (isProtectedAppPath(strippedPath) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/giris`;
    loginUrl.search = "";
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    loginUrl.searchParams.delete("error");
    const redirectResponse = NextResponse.redirect(loginUrl);
    applySessionCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  return supabaseResponse;
}
