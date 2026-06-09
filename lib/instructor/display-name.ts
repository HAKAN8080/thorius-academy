export function formatNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .replace(/[._+-]/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function resolvePanelDisplayName(params: {
  loginEmail: string | null;
  profileName?: string | null;
  metadataName?: string | null;
  instructorName?: string | null;
  instructorEmail?: string | null;
}): string {
  const loginEmail = params.loginEmail?.trim() ?? "";
  const profileName = params.profileName?.trim() ?? "";
  const metadataName = params.metadataName?.trim() ?? "";
  const instructorName = params.instructorName?.trim() ?? "";
  const instructorEmail = params.instructorEmail?.trim().toLowerCase() ?? "";
  const loginNormalized = loginEmail.toLowerCase();

  const instructorMatchesLogin =
    !instructorEmail ||
    !loginNormalized ||
    instructorEmail === loginNormalized;

  if (!instructorMatchesLogin) {
    if (profileName && profileName.toLowerCase() !== instructorName.toLowerCase()) {
      return profileName;
    }
    if (metadataName && metadataName.toLowerCase() !== instructorName.toLowerCase()) {
      return metadataName;
    }
    if (loginEmail) {
      return formatNameFromEmail(loginEmail);
    }
  }

  return (
    profileName ||
    metadataName ||
    instructorName ||
    (loginEmail ? formatNameFromEmail(loginEmail) : "") ||
    loginEmail ||
    "Kullanıcı"
  );
}
