/** Production eğitmen giriş e-postaları (Vercel env yedek listesi). */
export const KNOWN_INSTRUCTOR_EMAILS = [
  "siriusdanismanlik.tr@gmail.com",
  "mhakan_ugur@yahoo.com",
] as const;

/**
 * Aynı kişinin birden fazla e-postası → Tutor WP eğitmen user ID.
 * DB sync öncesi panel erişimi için kullanılır.
 */
export const KNOWN_INSTRUCTOR_WP_USER_IDS: Record<string, number> = {
  "siriusdanismanlik.tr@gmail.com": 277,
  "mhakan_ugur@yahoo.com": 277,
};

export function getKnownInstructorWpUserId(email: string): number | null {
  const normalized = email.trim().toLowerCase();
  const mapped = KNOWN_INSTRUCTOR_WP_USER_IDS[normalized];
  return typeof mapped === "number" && mapped > 0 ? mapped : null;
}

export function isKnownInstructorEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  const normalized = email.trim().toLowerCase();
  return (
    KNOWN_INSTRUCTOR_EMAILS.some(
      (known) => known.toLowerCase() === normalized,
    ) || normalized in KNOWN_INSTRUCTOR_WP_USER_IDS
  );
}

/** WP legacy sync: aynı kişinin tüm bilinen e-postalarını dene. */
export function getLegacySyncEmails(loginEmail: string): string[] {
  const normalized = loginEmail.trim().toLowerCase();
  const emails = new Set<string>([normalized]);

  if (isKnownInstructorEmail(normalized)) {
    for (const alias of KNOWN_INSTRUCTOR_EMAILS) {
      emails.add(alias.toLowerCase());
    }
  }

  return Array.from(emails);
}
