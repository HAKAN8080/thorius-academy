export function getSupabaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return url ? url.replace(/\/$/, "") : null;
}

export function getSupabasePublishableKey(): string | null {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const trimmed = key?.trim();
  return trimmed || null;
}

export function getSupabaseServiceRoleKey(): string | null {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  const trimmed = key?.trim();
  return trimmed || null;
}

export function getSupabaseProjectRef(): string | null {
  const url = getSupabaseUrl();
  if (!url) return null;

  try {
    return new URL(url).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}
