import type { CookieOptions } from "@supabase/ssr";

const AUTH_COOKIE_CHUNK_COUNT = 5;

/** Tüm thorius.com.tr alt alanlarında paylaşılan Supabase auth çerezleri. */
export function getSharedAuthCookieOptions(): CookieOptions {
  const options: CookieOptions = {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };

  if (process.env.NODE_ENV === "production") {
    options.domain =
      process.env.SUPABASE_AUTH_COOKIE_DOMAIN?.trim() || ".thorius.com.tr";
  }

  return options;
}

export function mergeAuthCookieOptions(
  options?: CookieOptions,
): CookieOptions {
  return {
    ...getSharedAuthCookieOptions(),
    ...options,
  };
}

function getSupabaseProjectRefFromPublicUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return null;

  try {
    return new URL(url).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

export function getSupabaseAuthStorageKey(): string | null {
  const projectRef = getSupabaseProjectRefFromPublicUrl();
  return projectRef ? `sb-${projectRef}-auth-token` : null;
}

function expireBrowserCookie(name: string, domain?: string) {
  if (typeof document === "undefined") return;

  const secure =
    window.location.protocol === "https:" ? "; Secure" : "";
  const domainPart = domain ? `; domain=${domain}` : "";
  document.cookie = `${name}=; path=/${domainPart}; max-age=0; SameSite=Lax${secure}`;
}

/** Eski host-only çerezler yeni domain çerezleriyle çakışınca oturum okunamaz. */
export function clearStaleSupabaseAuthCookies(): void {
  if (typeof document === "undefined") return;

  const storageKey = getSupabaseAuthStorageKey();
  if (!storageKey) return;

  const names = [
    storageKey,
    `${storageKey}-code-verifier`,
    ...Array.from(
      { length: AUTH_COOKIE_CHUNK_COUNT },
      (_, index) => `${storageKey}.${index}`,
    ),
  ];

  const sharedDomain =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SUPABASE_AUTH_COOKIE_DOMAIN?.trim() ||
        ".thorius.com.tr"
      : undefined;

  for (const name of names) {
    expireBrowserCookie(name);
    if (sharedDomain) {
      expireBrowserCookie(name, sharedDomain);
    }
  }
}
