import { getPreferredProfileName } from "@/lib/instructor/display-name";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof getSupabaseAdmin>;

type InstructorRow = {
  wp_user_id: number;
  full_name: string | null;
  email: string | null;
};

type ProfileRow = {
  wp_instructor_id: number | null;
  full_name: string | null;
};

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return null;
}

function emailsMatch(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  const a = normalizeEmail(left);
  const b = normalizeEmail(right);
  return Boolean(a && b && a === b);
}

async function hasInstructorCourses(
  admin: AdminClient,
  wpUserId: number,
): Promise<boolean> {
  const { count } = await admin
    .from("instructor_course_stats")
    .select("*", { count: "exact", head: true })
    .eq("instructor_wp_user_id", wpUserId);

  return (count ?? 0) > 0;
}

async function lookupInstructorByWpUserId(
  admin: AdminClient,
  wpUserId: number,
): Promise<InstructorRow | null> {
  const { data: instructor } = await admin
    .from("instructors")
    .select("wp_user_id, full_name, email")
    .eq("wp_user_id", wpUserId)
    .maybeSingle();

  if (instructor?.wp_user_id) {
    return instructor as InstructorRow;
  }

  if (await hasInstructorCourses(admin, wpUserId)) {
    return {
      wp_user_id: wpUserId,
      full_name: null,
      email: null,
    };
  }

  return null;
}

async function ensureInstructorRow(
  admin: AdminClient,
  wpUserId: number,
  email: string | null,
  fullName: string | null,
): Promise<void> {
  const { data: existing } = await admin
    .from("instructors")
    .select("wp_user_id")
    .eq("wp_user_id", wpUserId)
    .maybeSingle();

  if (existing?.wp_user_id) {
    return;
  }

  await admin.from("instructors").upsert(
    {
      wp_user_id: wpUserId,
      email,
      full_name: fullName,
      synced_at: new Date().toISOString(),
    },
    { onConflict: "wp_user_id" },
  );
}

async function persistInstructorProfile(
  userId: string,
  wpInstructorId: number,
  loginEmail: string | null,
  profile: ProfileRow | null | undefined,
  instructor: InstructorRow | null,
): Promise<void> {
  const admin = getSupabaseAdmin();
  const payload: {
    id: string;
    wp_instructor_id: number;
    full_name?: string | null;
    role?: string;
  } = {
    id: userId,
    wp_instructor_id: wpInstructorId,
    role: "instructor",
  };

  const linkedName =
    instructor &&
    emailsMatch(loginEmail, instructor.email) &&
    instructor.full_name?.trim()
      ? instructor.full_name.trim()
      : null;

  const profileName = profile?.full_name?.trim() ?? "";
  const wrongLinkedName =
    instructor?.full_name?.trim() &&
    profileName.toLowerCase() === instructor.full_name.trim().toLowerCase() &&
    !emailsMatch(loginEmail, instructor.email);

  if (linkedName) {
    payload.full_name = linkedName;
  } else if (wrongLinkedName) {
    payload.full_name = getPreferredProfileName({
      loginEmail,
      profileName,
      instructorName: instructor?.full_name,
    });
  }

  await admin.from("profiles").upsert(payload, { onConflict: "id" });
}

export async function linkInstructorProfileFromWpUserId(
  userId: string,
  wpUserId: number,
): Promise<boolean> {
  const parsedId = parsePositiveInt(wpUserId);
  if (!parsedId) {
    return false;
  }

  let admin: AdminClient;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return false;
  }

  const instructor = await lookupInstructorByWpUserId(admin, parsedId);
  if (!instructor) {
    return false;
  }

  const { data: authUser } = await admin.auth.admin.getUserById(userId);
  const email = normalizeEmail(authUser.user?.email);
  const { data: profile } = await admin
    .from("profiles")
    .select("wp_instructor_id, full_name")
    .eq("id", userId)
    .maybeSingle();

  await ensureInstructorRow(
    admin,
    parsedId,
    instructor.email ?? email,
    instructor.full_name ?? profile?.full_name ?? null,
  );

  await persistInstructorProfile(
    userId,
    parsedId,
    email,
    profile,
    instructor,
  );

  return true;
}
