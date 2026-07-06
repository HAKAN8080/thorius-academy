import { cookies } from "next/headers";
import { mergeAuthCookieOptions } from "@/lib/supabase/auth-cookies";

/** coaching.thorius.com.tr oturum çerezi (thorius-app). */
export const COACHING_AUTH_COOKIE = "auth-token";

export function getCoachingAuthCookieClearOptions() {
  return mergeAuthCookieOptions({
    maxAge: 0,
  });
}

/** Tüm ekosistemden çıkış — coaching JWT çerezini de temizler. */
export async function clearCoachingAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COACHING_AUTH_COOKIE, "", getCoachingAuthCookieClearOptions());
}
