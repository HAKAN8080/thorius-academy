const DEFAULT_WP_SITE_URL = "https://thorius.com.tr";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

export function getWpSiteUrl(): string {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_WP_SITE_URL ?? DEFAULT_WP_SITE_URL,
  );
}

/** Academy eğitmen paneli (kurs yönetimi). */
export function getInstructorPortalUrl(): string {
  return "/instructor/courses";
}

/** Academy öğrenci paneli. */
export function getStudentPortalUrl(): string {
  return "/panel/kurslarim";
}

/** Tutor LMS kontrol paneli (kazanç, ödeme, profil). */
export function getTutorDashboardUrl(): string {
  const path =
    process.env.NEXT_PUBLIC_TUTOR_DASHBOARD_PATH ?? "/kontrol-paneli/";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getWpSiteUrl()}${normalizedPath.endsWith("/") ? normalizedPath : `${normalizedPath}/`}`;
}

export function isStudentPortalPath(pathname: string): boolean {
  if (pathname.startsWith("/panel/egitmen")) return false;
  return (
    pathname.startsWith("/panel/kurslarim") ||
    pathname === "/panel" ||
    (pathname.startsWith("/panel/") && !pathname.startsWith("/panel/egitmen"))
  );
}

export function isInstructorPortalPath(pathname: string): boolean {
  return (
    pathname.startsWith("/instructor") || pathname.startsWith("/panel/egitmen")
  );
}
