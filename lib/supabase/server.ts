import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";
import { mergeAuthCookieOptions } from "@/lib/supabase/auth-cookies";

/**
 * Sunucu tarafı Supabase istemcisi (Server Components, Server Actions).
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required",
    );
  }

  return createServerClient(supabaseUrl, publishableKey, {
    cookieOptions: mergeAuthCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, mergeAuthCookieOptions(options))
          );
        } catch {
          // Server Component içinde cookie yazımı yok sayılır
        }
      },
    },
  });
}
