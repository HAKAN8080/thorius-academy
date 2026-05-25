import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getServiceRoleKey(): string {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }
  return key;
}

function getSupabaseUrl(): string {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  }
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function createSupabaseAdmin(): SupabaseClient {
  return createClient(getSupabaseUrl(), getServiceRoleKey(), {
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
