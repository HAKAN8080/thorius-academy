import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

function requireServiceRoleKey(): string {
  const key = getSupabaseServiceRoleKey();
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }
  return key;
}

function requireSupabaseUrl(): string {
  const url = getSupabaseUrl();
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  }
  return url;
}

export function createSupabaseAdmin(): SupabaseClient {
  return createClient(requireSupabaseUrl(), requireServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** Webhook handler için singleton admin client */
let adminClient: ReturnType<typeof createSupabaseAdmin> | null = null;

export function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createSupabaseAdmin();
  }
  return adminClient;
}
