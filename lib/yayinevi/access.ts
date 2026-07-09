const DEFAULT_YAYINEVI_EDITOR_EMAILS = ["mhakan_ugur@yahoo.com"];

function parseEditorEmails(): string[] {
  const raw = process.env.YAYINEVI_EDITOR_EMAILS?.trim();
  if (!raw) return DEFAULT_YAYINEVI_EDITOR_EMAILS;
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function canAccessYayinevi(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return parseEditorEmails().includes(normalized);
}
