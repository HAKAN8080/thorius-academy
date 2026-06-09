import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

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
  return (process.env.INSTRUCTOR_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
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

async function ensureProfileInstructorLink(
  userId: string,
  wpInstructorId: number,
  fullName?: string | null,
): Promise<void> {
  const admin = getSupabaseAdmin();
  const payload: {
    id: string;
    wp_instructor_id: number;
    full_name?: string;
  } = {
    id: userId,
    wp_instructor_id: wpInstructorId,
  };

  if (fullName?.trim()) {
    payload.full_name = fullName.trim();
  }

  await admin.from("profiles").upsert(payload, { onConflict: "id" });
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

  const { count } = await admin
    .from("instructor_course_stats")
    .select("*", { count: "exact", head: true })
    .eq("instructor_wp_user_id", wpUserId);

  if ((count ?? 0) > 0) {
    return {
      wp_user_id: wpUserId,
      full_name: null,
      email: null,
    };
  }

  return null;
}

async function grantInstructorAccess(
  userId: string,
  wpInstructorId: number,
  instructor: Pick<InstructorRow, "full_name" | "email"> | null,
  profile: { full_name: string | null } | null | undefined,
  email: string | null,
): Promise<InstructorAccess> {
  await ensureProfileInstructorLink(
    userId,
    wpInstructorId,
    instructor?.full_name ?? profile?.full_name,
  );

  return {
    isInstructor: true,
    wpInstructorId,
    instructorName:
      instructor?.full_name ?? profile?.full_name ?? email,
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

  await ensureProfileInstructorLink(
    userId,
    parsedId,
    instructor.full_name,
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

  if (profile?.wp_instructor_id) {
    const { data: instructor } = await admin
      .from("instructors")
      .select("full_name, email")
      .eq("wp_user_id", profile.wp_instructor_id)
      .maybeSingle();

    return {
      isInstructor: true,
      wpInstructorId: profile.wp_instructor_id,
      instructorName:
        profile.full_name ??
        instructor?.full_name ??
        email ??
        user.email ??
        null,
    };
  }

  for (const wpUserId of getMetadataWpUserIds(metadata)) {
    const instructor = await lookupInstructorByWpUserId(admin, wpUserId);
    if (instructor) {
      return grantInstructorAccess(
        user.id,
        wpUserId,
        instructor,
        profile,
        email,
      );
    }
  }

  if (email) {
    const { data: instructor } = await admin
      .from("instructors")
      .select("wp_user_id, full_name, email")
      .ilike("email", email)
      .maybeSingle();

    if (instructor?.wp_user_id) {
      return grantInstructorAccess(
        user.id,
        instructor.wp_user_id,
        instructor as InstructorRow,
        profile,
        email,
      );
    }

    const envEmails = getEnvInstructorEmails();
    if (envEmails.includes(email)) {
      const { data: envInstructor } = await admin
        .from("instructors")
        .select("wp_user_id, full_name, email")
        .ilike("email", email)
        .maybeSingle();

      if (envInstructor?.wp_user_id) {
        return grantInstructorAccess(
          user.id,
          envInstructor.wp_user_id,
          envInstructor as InstructorRow,
          profile,
          email,
        );
      }

      const wpInstructorId = getDefaultInstructorWpId();
      const { data: fallbackInstructor } = await admin
        .from("instructors")
        .select("full_name, email")
        .eq("wp_user_id", wpInstructorId)
        .maybeSingle();

      return grantInstructorAccess(
        user.id,
        wpInstructorId,
        fallbackInstructor as InstructorRow | null,
        profile,
        email,
      );
    }
  }

  return { isInstructor: false, wpInstructorId: null, instructorName: null };
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
