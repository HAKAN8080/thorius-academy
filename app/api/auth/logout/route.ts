import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { clearCoachingAuthCookie } from "@/lib/auth/ecosystem-cookies";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";
import { mergeAuthCookieOptions } from "@/lib/supabase/auth-cookies";

export const dynamic = "force-dynamic";

/**
 * Fast client logout: local session + cookies, no server-action round trip.
 */
export async function POST(request: NextRequest) {
  const supabaseUrl = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();

  if (!supabaseUrl || !publishableKey) {
    return NextResponse.json({ error: "Auth yapılandırması eksik." }, { status: 500 });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, publishableKey, {
    cookieOptions: mergeAuthCookieOptions(),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(
            name,
            value,
            mergeAuthCookieOptions(options),
          );
        });
      },
    },
  });

  await supabase.auth.signOut({ scope: "local" });
  await clearCoachingAuthCookie();

  const response = NextResponse.json({ ok: true });
  supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
    response.cookies.set(name, value, mergeAuthCookieOptions());
  });
  return response;
}
