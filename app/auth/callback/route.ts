import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth/app-url";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

const VERIFICATION_ERROR =
  "Doğrulama başarısız, lütfen tekrar deneyin.";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = safeNextPath(requestUrl.searchParams.get("next"));

    if (!code) {
      return NextResponse.redirect(
        `${requestUrl.origin}/giris?error=${encodeURIComponent(VERIFICATION_ERROR)}`
      );
    }

    const supabaseUrl = getSupabaseUrl();
    const publishableKey = getSupabasePublishableKey();

    if (!supabaseUrl || !publishableKey) {
      return NextResponse.redirect(
        `${requestUrl.origin}/giris?error=${encodeURIComponent(VERIFICATION_ERROR)}`
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, publishableKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }

    return NextResponse.redirect(
      `${requestUrl.origin}/giris?error=${encodeURIComponent(VERIFICATION_ERROR)}`
    );
  } catch {
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(
      `${origin}/giris?error=${encodeURIComponent(VERIFICATION_ERROR)}`
    );
  }
}
