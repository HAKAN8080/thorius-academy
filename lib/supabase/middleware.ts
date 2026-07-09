import { safeRedirectTarget } from "@/lib/auth/app-url";
import { isProtectedAppPath } from "@/lib/auth/protected-paths";
import { mergeAuthCookieOptions } from "@/lib/supabase/auth-cookies";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/giris", "/kayit"] as const;
const PUBLIC_PREFIXES = ["/auth/callback"] as const;

function isPublicPath(pathname: string): boolean {
  if (AUTH_ROUTES.some((route) => pathname === route)) {
    return true;
  }
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function applySessionCookies(
  source: NextResponse,
  target: NextResponse,
) {
  source.cookies.getAll().forEach(({ name, value }) => {
    target.cookies.set(name, value, mergeAuthCookieOptions());
  });
}

/**
 * Middleware oturum yenileme — Supabase auth cookie'lerini günceller.
 */
export async function updateSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  let supabaseResponse = NextResponse.next({
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
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
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

  if (user && AUTH_ROUTES.includes(pathname as (typeof AUTH_ROUTES)[number])) {
    const redirectTo = safeRedirectTarget(
      request.nextUrl.searchParams.get("redirect"),
    );
    if (redirectTo.startsWith("http://") || redirectTo.startsWith("https://")) {
      const redirectResponse = NextResponse.redirect(redirectTo);
      applySessionCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }
    const destination = request.nextUrl.clone();
    destination.pathname = redirectTo;
    destination.search = "";
    const redirectResponse = NextResponse.redirect(destination);
    applySessionCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  if (isPublicPath(pathname)) {
    return supabaseResponse;
  }

  if (isProtectedAppPath(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/giris";
    loginUrl.search = "";
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    loginUrl.searchParams.delete("error");
    const redirectResponse = NextResponse.redirect(loginUrl);
    applySessionCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  return supabaseResponse;
}
