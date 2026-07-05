import type { CookieOptions } from "@supabase/ssr";

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
