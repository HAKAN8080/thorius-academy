import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";
import { mergeAuthCookieOptions } from "@/lib/supabase/auth-cookies";

export const dynamic = "force-dynamic";

function jsonWithSessionCookies(
  source: NextResponse,
  body: Record<string, unknown>,
  init?: ResponseInit,
) {
  const response = NextResponse.json(body, init);
  source.cookies.getAll().forEach(({ name, value }) => {
    response.cookies.set(name, value, mergeAuthCookieOptions());
  });
  return response;
}

export async function POST(request: NextRequest) {
  const supabaseUrl = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();

  if (!supabaseUrl || !publishableKey) {
    return NextResponse.json(
      { error: "Kimlik doğrulama yapılandırması eksik." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 },
    );
  }

  const email =
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof body.email === "string"
      ? body.email.trim()
      : "";
  const password =
    typeof body === "object" &&
    body !== null &&
    "password" in body &&
    typeof body.password === "string"
      ? body.password
      : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Geçerli e-posta ve parola girin." },
      { status: 400 },
    );
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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return jsonWithSessionCookies(
      supabaseResponse,
      { error: error.message },
      { status: 401 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonWithSessionCookies(
      supabaseResponse,
      { error: "Oturum oluşturulamadı. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }

  return jsonWithSessionCookies(supabaseResponse, { ok: true });
}
