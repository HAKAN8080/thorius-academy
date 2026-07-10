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
 * Middleware oturum yenileme — Supabase auth cookie'lerini günceller.
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
