/**
 * E-posta doğrulama ve OAuth yönlendirmeleri için uygulama kök URL'si.
 */
import {
  getAcademyOrigin,
  getCoachingOrigin,
  getCompanyOrigin,
  getKitaplikOrigin,
  getShopOrigin,
} from "@/lib/site/site-mode";

export function getAppOrigin(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (appUrl) {
    return appUrl;
  }
  return "http://localhost:3000";
}

function getTrustedRedirectOrigins(): Set<string> {
  return new Set(
    [
      getAppOrigin(),
      getAcademyOrigin(),
      getKitaplikOrigin(),
      getShopOrigin(),
      getCompanyOrigin(),
      getCoachingOrigin(),
      "http://localhost:3000",
    ].map((origin) => origin.replace(/\/$/, "")),
  );
}

function isTrustedAbsoluteUrl(value: string): boolean {
  try {
    const { origin } = new URL(value);
    return getTrustedRedirectOrigins().has(origin);
  } catch {
    return false;
  }
}

/** Giriş / kayıt sonrası — göreli yol veya güvenilir tam URL. */
export function safeRedirectTarget(next: string | null | undefined): string {
  const trimmed = next?.trim();
  if (!trimmed) {
    return "/panel";
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  if (isTrustedAbsoluteUrl(trimmed)) {
    return trimmed;
  }

  return "/panel";
}

export function redirectResponseUrl(next: string, requestOrigin: string): string {
  const target = safeRedirectTarget(next);
  if (target.startsWith("http://") || target.startsWith("https://")) {
    return target;
  }

  const origin = requestOrigin.replace(/\/$/, "");
  return `${origin}${target.startsWith("/") ? target : `/${target}`}`;
}

export function getAuthCallbackUrl(nextPath: string): string {
  return `${getAppOrigin()}/auth/callback?next=${encodeURIComponent(safeRedirectTarget(nextPath))}`;
}

export function getEmailRedirectUrl(nextPath = "/panel"): string {
  return getAuthCallbackUrl(nextPath);
}

/**
 * Yalnızca göreli yollar (parola sıfırlama vb.).
 * E-posta / OAuth dönüşü için `safeRedirectTarget` kullanın —
 * Kitaplik gibi güvenilir absolute URL'ler korunur.
 */
export function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/panel";
  }
  return next;
}
