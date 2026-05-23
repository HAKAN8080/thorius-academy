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

function isProtectedPath(pathname: string): boolean {
  return pathname === "/panel" || pathname.startsWith("/panel/");
}

/**
 * Middleware oturum yenileme — Supabase auth cookie'lerini günceller.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return supabaseResponse;
  }

  if (isProtectedPath(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/giris";
    loginUrl.searchParams.delete("error");
    return NextResponse.redirect(loginUrl);
  }

  if (user && AUTH_ROUTES.includes(pathname as (typeof AUTH_ROUTES)[number])) {
    const panelUrl = request.nextUrl.clone();
    panelUrl.pathname = "/panel";
    panelUrl.search = "";
    return NextResponse.redirect(panelUrl);
  }

  return supabaseResponse;
}
