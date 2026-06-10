import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth/app-url";
import { ensureUserProfile } from "@/lib/profile/ensure-profile";
import { createClient } from "@/lib/supabase/server";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

const VERIFICATION_ERROR =
  "Doğrulama başarısız, lütfen tekrar deneyin.";

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return (
    value === "signup" ||
    value === "invite" ||
    value === "magiclink" ||
    value === "recovery" ||
    value === "email_change" ||
    value === "email"
  );
}

async function finalizeVerifiedSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  origin: string,
  next: string,
): Promise<NextResponse> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const fullName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null;
    await ensureUserProfile(user.id, {
      email: user.email,
      fullName,
    });
  }

  return NextResponse.redirect(`${origin}${next}`);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");

  const supabaseUrl = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();

  if (!supabaseUrl || !publishableKey) {
    return NextResponse.redirect(
      `${requestUrl.origin}/giris?error=${encodeURIComponent(VERIFICATION_ERROR)}`,
    );
  }

  try {
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

    if (tokenHash && isEmailOtpType(type)) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (!error) {
        return finalizeVerifiedSession(supabase, requestUrl.origin, next);
      }

      console.error("[Auth callback] verifyOtp failed:", error.message);
    }

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return finalizeVerifiedSession(supabase, requestUrl.origin, next);
      }

      console.error("[Auth callback] exchangeCodeForSession failed:", error.message);
    }

    return NextResponse.redirect(
      `${requestUrl.origin}/giris?error=${encodeURIComponent(VERIFICATION_ERROR)}`,
    );
  } catch (error) {
    console.error("[Auth callback] unexpected error:", error);
    return NextResponse.redirect(
      `${requestUrl.origin}/giris?error=${encodeURIComponent(VERIFICATION_ERROR)}`,
    );
  }
}
