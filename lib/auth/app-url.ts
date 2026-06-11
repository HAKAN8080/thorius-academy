/**
 * E-posta doğrulama ve OAuth yönlendirmeleri için uygulama kök URL'si.
 */
export function getAppOrigin(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (appUrl) {
    return appUrl;
  }
  return "http://localhost:3000";
}

export function getAuthCallbackUrl(nextPath: string): string {
  return `${getAppOrigin()}/auth/callback?next=${encodeURIComponent(safeNextPath(nextPath))}`;
}

export function getEmailRedirectUrl(nextPath = "/panel"): string {
  return getAuthCallbackUrl(safeNextPath(nextPath));
}

export function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/panel";
  }
  return next;
}
