import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface InstructorAccess {
  isInstructor: boolean;
  wpInstructorId: number | null;
  instructorName: string | null;
}

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
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

async function ensureProfileInstructorId(
  userId: string,
  wpInstructorId: number,
): Promise<void> {
  const admin = getSupabaseAdmin();
  await admin.from("profiles").upsert(
    {
      id: userId,
      wp_instructor_id: wpInstructorId,
    },
    { onConflict: "id" },
  );
}

export async function getInstructorAccess(): Promise<InstructorAccess> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isInstructor: false, wpInstructorId: null, instructorName: null };
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (error) {
    console.error("[Instructor Access] Admin client unavailable:", error);
    return { isInstructor: false, wpInstructorId: null, instructorName: null };
  }

  let email = normalizeEmail(user.email);
  if (!email) {
    const { data: authUser } = await admin.auth.admin.getUserById(user.id);
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
      .select("full_name")
      .eq("wp_user_id", profile.wp_instructor_id)
      .maybeSingle();

    return {
      isInstructor: true,
      wpInstructorId: profile.wp_instructor_id,
      instructorName:
        instructor?.full_name ?? profile.full_name ?? email ?? user.email ?? null,
    };
  }

  if (email) {
    const { data: instructor } = await admin
      .from("instructors")
      .select("wp_user_id, full_name, email")
      .ilike("email", email)
      .maybeSingle();

    if (instructor?.wp_user_id) {
      await ensureProfileInstructorId(user.id, instructor.wp_user_id);

      return {
        isInstructor: true,
        wpInstructorId: instructor.wp_user_id,
        instructorName: instructor.full_name ?? profile?.full_name ?? email,
      };
    }

    const envEmails = getEnvInstructorEmails();
    if (envEmails.includes(email)) {
      const wpInstructorId = getDefaultInstructorWpId();
      await ensureProfileInstructorId(user.id, wpInstructorId);

      const { data: instructor } = await admin
        .from("instructors")
        .select("full_name")
        .eq("wp_user_id", wpInstructorId)
        .maybeSingle();

      return {
        isInstructor: true,
        wpInstructorId,
        instructorName: instructor?.full_name ?? profile?.full_name ?? email,
      };
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
