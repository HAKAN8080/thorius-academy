import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

/** Cookie-free Supabase client for static/ISR pages (build-safe). */
let publicClient: SupabaseClient | null = null;

export function getSupabasePublicClient(): SupabaseClient {
  if (publicClient) {
    return publicClient;
  }

  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required",
    );
  }

  publicClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return publicClient;
}
