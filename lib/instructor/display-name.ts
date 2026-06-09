export function formatNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .replace(/[._+-]/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeName(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function isBorrowedInstructorName(
  name: string,
  loginEmail: string | null,
  instructorName: string | null,
): boolean {
  const normalized = normalizeName(name);
  if (!normalized) {
    return false;
  }

  const instructorNormalized = normalizeName(instructorName);
  if (instructorNormalized && normalized === instructorNormalized) {
    const email = loginEmail?.toLowerCase() ?? "";
    if (email && !email.includes("sirius") && normalized.includes("sirius")) {
      return true;
    }
    if (instructorNormalized.includes("sirius") && email && !email.includes("sirius")) {
      return true;
    }
  }

  if (normalized === "sirius" || normalized === "sİrius") {
    const email = loginEmail?.toLowerCase() ?? "";
    return Boolean(email && !email.includes("sirius"));
  }

  return false;
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

  const cleanProfile = isBorrowedInstructorName(
    profileName,
    loginEmail,
    instructorName,
  )
    ? ""
    : profileName;

  const cleanMetadata = isBorrowedInstructorName(
    metadataName,
    loginEmail,
    instructorName,
  )
    ? ""
    : metadataName;

  if (!instructorMatchesLogin) {
    if (cleanProfile) {
      return cleanProfile;
    }
    if (cleanMetadata) {
      return cleanMetadata;
    }
    if (loginEmail) {
      return formatNameFromEmail(loginEmail);
    }
    return "Kullanıcı";
  }

  return (
    cleanProfile ||
    cleanMetadata ||
    instructorName ||
    (loginEmail ? formatNameFromEmail(loginEmail) : "") ||
    loginEmail ||
    "Kullanıcı"
  );
}

export function getPreferredProfileName(params: {
  loginEmail: string | null;
  profileName?: string | null;
  instructorName?: string | null;
}): string | null {
  const loginEmail = params.loginEmail?.trim() ?? "";
  const profileName = params.profileName?.trim() ?? "";

  if (
    profileName &&
    !isBorrowedInstructorName(
      profileName,
      loginEmail,
      params.instructorName ?? null,
    )
  ) {
    return profileName;
  }

  if (loginEmail) {
    return formatNameFromEmail(loginEmail);
  }

  return null;
}
