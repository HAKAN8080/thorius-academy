import { createBrowserClient } from "@supabase/ssr";

/**
 * Tarayıcı tarafı Supabase istemcisi (Client Components).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
