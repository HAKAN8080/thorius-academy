import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getKnownInstructorWpUserId,
  isKnownInstructorEmail,
  KNOWN_INSTRUCTOR_EMAILS,
} from "@/lib/constants/instructor-allowlist";
import { getPreferredProfileName } from "@/lib/instructor/display-name";

export interface InstructorAccess {
  isInstructor: boolean;
  wpInstructorId: number | null;
  instructorName: string | null;
}

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

function getEnvInstructorEmails(): string[] {
  const fromEnv = (process.env.INSTRUCTOR_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(
    new Set([
      ...fromEnv,
      ...KNOWN_INSTRUCTOR_EMAILS.map((email) => email.toLowerCase()),
    ]),
  );
}

function getDefaultInstructorWpId(): number {
  const parsed = parseInt(process.env.DEFAULT_INSTRUCTOR_WP_ID ?? "277", 10);
  return Number.isNaN(parsed) ? 277 : parsed;
}

function getMetadataWpUserIds(
  metadata: Record<string, unknown> | undefined,
): number[] {
  const ids = new Set<number>();
  for (const key of ["wp_instructor_id", "wp_user_id"] as const) {
    const id = parsePositiveInt(metadata?.[key]);
    if (id) {
      ids.add(id);
    }
  }
  return Array.from(ids);
}

function emailsMatch(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  const a = normalizeEmail(left);
  const b = normalizeEmail(right);
  return Boolean(a && b && a === b);
}

async function ensureInstructorRow(
  admin: AdminClient,
  wpUserId: number,
  email: string | null,
  fullName: string | null,
): Promise<void> {
  const { data: existing } = await admin
    .from("instructors")
    .select("wp_user_id, email, full_name")
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

async function lookupInstructorByEmail(
  admin: AdminClient,
  email: string,
): Promise<InstructorRow | null> {
  const { data: instructor } = await admin
    .from("instructors")
    .select("wp_user_id, full_name, email")
    .ilike("email", email)
    .maybeSingle();

  return instructor?.wp_user_id ? (instructor as InstructorRow) : null;
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
  } else if (profileName) {
    payload.full_name = getPreferredProfileName({
      loginEmail,
      profileName,
      instructorName: instructor?.full_name,
    });
  }

  await admin.from("profiles").upsert(payload, { onConflict: "id" });
}

async function repairBorrowedProfileName(
  admin: AdminClient,
  userId: string,
  loginEmail: string | null,
  profile: ProfileRow | null | undefined,
): Promise<void> {
  const profileName = profile?.full_name?.trim() ?? "";
  if (!profileName) {
    return;
  }

  const preferred = getPreferredProfileName({
    loginEmail,
    profileName,
    instructorName: profileName,
  });

  if (!preferred || preferred === profileName) {
    return;
  }

  await admin
    .from("profiles")
    .update({ full_name: preferred })
    .eq("id", userId);
}

async function countInstructorCourses(
  admin: AdminClient,
  wpUserId: number,
): Promise<number> {
  const { count } = await admin
    .from("instructor_course_stats")
    .select("*", { count: "exact", head: true })
    .eq("instructor_wp_user_id", wpUserId);

  return count ?? 0;
}

async function lookupInstructorViaAllowlist(
  admin: AdminClient,
  loginEmail: string,
): Promise<InstructorRow | null> {
  const envEmails = getEnvInstructorEmails();
  if (!envEmails.includes(loginEmail) && !isKnownInstructorEmail(loginEmail)) {
    return null;
  }

  const mappedWpId = getKnownInstructorWpUserId(loginEmail);
  if (mappedWpId) {
    const mapped = await lookupInstructorByWpUserId(admin, mappedWpId);
    return {
      wp_user_id: mappedWpId,
      full_name: mapped?.full_name ?? null,
      email: loginEmail,
    };
  }

  const direct = await lookupInstructorByEmail(admin, loginEmail);
  if (direct && (await countInstructorCourses(admin, direct.wp_user_id)) > 0) {
    return direct;
  }

  const peers: InstructorRow[] = [];
  for (const allowedEmail of envEmails) {
    const row = await lookupInstructorByEmail(admin, allowedEmail);
    if (row) {
      peers.push(row);
    }
  }

  if (peers.length > 0) {
    let bestPeer = peers[0];
    let bestCount = await countInstructorCourses(admin, bestPeer.wp_user_id);

    for (const peer of peers.slice(1)) {
      const count = await countInstructorCourses(admin, peer.wp_user_id);
      if (count > bestCount) {
        bestPeer = peer;
        bestCount = count;
      }
    }

    if (bestCount > 0) {
      return bestPeer;
    }

    const uniqueIds = new Set(peers.map((peer) => peer.wp_user_id));
    if (uniqueIds.size === 1) {
      return peers[0];
    }
  }

  const defaultId = getDefaultInstructorWpId();
  const byDefault = await lookupInstructorByWpUserId(admin, defaultId);
  if (byDefault) {
    return {
      wp_user_id: defaultId,
      full_name: byDefault.full_name,
      email: loginEmail,
    };
  }

  return null;
}

async function resolveInstructorIdentity(
  admin: AdminClient,
  email: string | null,
  profile: ProfileRow | null | undefined,
  metadata: Record<string, unknown>,
): Promise<{ wpInstructorId: number; instructor: InstructorRow | null } | null> {
  if (email) {
    const viaAllowlist = await lookupInstructorViaAllowlist(admin, email);
    if (viaAllowlist) {
      return {
        wpInstructorId: viaAllowlist.wp_user_id,
        instructor: viaAllowlist,
      };
    }

    const byEmail = await lookupInstructorByEmail(admin, email);
    if (byEmail) {
      return { wpInstructorId: byEmail.wp_user_id, instructor: byEmail };
    }
  }

  for (const wpUserId of getMetadataWpUserIds(metadata)) {
    const instructor = await lookupInstructorByWpUserId(admin, wpUserId);
    if (instructor) {
      return { wpInstructorId: wpUserId, instructor };
    }
  }

  if (profile?.wp_instructor_id) {
    const instructor = await lookupInstructorByWpUserId(
      admin,
      profile.wp_instructor_id,
    );
    if (
      instructor &&
      (!instructor.email || !email || emailsMatch(email, instructor.email))
    ) {
      return {
        wpInstructorId: profile.wp_instructor_id,
        instructor,
      };
    }
  }

  return null;
}

async function grantInstructorAccess(
  userId: string,
  wpInstructorId: number,
  loginEmail: string | null,
  profile: ProfileRow | null | undefined,
  instructor: InstructorRow | null,
): Promise<InstructorAccess> {
  const admin = getSupabaseAdmin();

  await ensureInstructorRow(
    admin,
    wpInstructorId,
    instructor?.email ?? loginEmail,
    instructor?.full_name ?? profile?.full_name ?? null,
  );

  await persistInstructorProfile(
    userId,
    wpInstructorId,
    loginEmail,
    profile,
    instructor,
  );

  const displayName =
    emailsMatch(loginEmail, instructor?.email) && instructor?.full_name
      ? instructor.full_name
      : profile?.full_name ?? loginEmail;

  return {
    isInstructor: true,
    wpInstructorId,
    instructorName: displayName,
  };
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

  await grantInstructorAccess(
    userId,
    parsedId,
    email,
    profile,
    instructor,
  );
  return true;
}

export async function getInstructorAccess(): Promise<InstructorAccess> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isInstructor: false, wpInstructorId: null, instructorName: null };
  }

  let admin: AdminClient;
  try {
    admin = getSupabaseAdmin();
  } catch (error) {
    console.error("[Instructor Access] Admin client unavailable:", error);
    return { isInstructor: false, wpInstructorId: null, instructorName: null };
  }

  const { data: authUser } = await admin.auth.admin.getUserById(user.id);
  const metadata = {
    ...(authUser.user?.user_metadata ?? {}),
    ...(user.user_metadata ?? {}),
  } as Record<string, unknown>;

  let email = normalizeEmail(user.email);
  if (!email) {
    email = normalizeEmail(authUser.user?.email);
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("wp_instructor_id, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const resolved = await resolveInstructorIdentity(
    admin,
    email,
    profile,
    metadata,
  );

  if (!resolved) {
    await repairBorrowedProfileName(admin, user.id, email, profile);
    return { isInstructor: false, wpInstructorId: null, instructorName: null };
  }

  return grantInstructorAccess(
    user.id,
    resolved.wpInstructorId,
    email,
    profile,
    resolved.instructor,
  );
}

export async function requireInstructorAccess(): Promise<{
  wpInstructorId: number;
  instructorName: string | null;
}> {
  const access = await getInstructorAccess();
  if (!access.isInstructor || !access.wpInstructorId) {
    throw new Error("INSTRUCTOR_ACCESS_DENIED");
  }
  return {
    wpInstructorId: access.wpInstructorId,
    instructorName: access.instructorName,
  };
}
