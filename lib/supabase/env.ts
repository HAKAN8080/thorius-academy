function normalizeEnvValue(value: string | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim().replace(/^['"]|['"]$/g, "");
  return trimmed || null;
}

export function getSupabaseUrl(): string | null {
  const url = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  return url ? url.replace(/\/$/, "") : null;
}

export function getSupabasePublishableKey(): string | null {
  const key = normalizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return key || null;
}

export function getSupabaseServiceRoleKey(): string | null {
  const key = normalizeEnvValue(
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY,
  );

  return key || null;
}

export function describeSupabaseKey(
  key: string | null,
  expected: "publishable" | "service",
): string {
  if (!key) return "eksik";

  if (key.startsWith("sb_publishable_")) {
    return expected === "publishable"
      ? "yeni publishable key"
      : "YANLIŞ — publishable key service role yerine kullanılmış";
  }

  if (key.startsWith("sb_secret_")) {
    return expected === "service"
      ? "yeni secret key"
      : "YANLIŞ — secret key publishable yerine kullanılmış";
  }

  if (key.startsWith("eyJ")) {
    return expected === "publishable"
      ? "legacy anon key"
      : "legacy service_role key";
  }

  return "bilinmeyen format — anahtarı yeniden kopyalayın";
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
