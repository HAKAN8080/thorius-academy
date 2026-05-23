/**
 * E-posta doğrulama ve OAuth yönlendirmeleri için uygulama kök URL'si.
 */
export function getAppOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export function getEmailRedirectUrl(): string {
  return `${getAppOrigin()}/auth/callback?next=/panel`;
}

export function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/panel";
  }
  return next;
}
