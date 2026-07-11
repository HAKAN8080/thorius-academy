const DEFAULT_KITAPLIK_ADMIN_EMAILS = ["mhakan_ugur@yahoo.com"];

function parseAdminEmails(): string[] {
  const raw = process.env.KITAPLIK_ADMIN_EMAILS?.trim();
  if (!raw) return DEFAULT_KITAPLIK_ADMIN_EMAILS;
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function canAccessKitaplikAdmin(
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return parseAdminEmails().includes(normalized);
}
