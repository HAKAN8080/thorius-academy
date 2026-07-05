import { createBrowserClient } from "@supabase/ssr";
import { mergeAuthCookieOptions } from "@/lib/supabase/auth-cookies";

/**
 * Tarayıcı tarafı Supabase istemcisi (Client Components).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: mergeAuthCookieOptions(),
    },
  );
}
