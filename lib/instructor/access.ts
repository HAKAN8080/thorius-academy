import { createClient } from "@/lib/supabase/server";

export interface InstructorAccess {
  isInstructor: boolean;
  wpInstructorId: number | null;
  instructorName: string | null;
}

export async function getInstructorAccess(): Promise<InstructorAccess> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isInstructor: false, wpInstructorId: null, instructorName: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("wp_instructor_id, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.wp_instructor_id) {
    const { data: instructor } = await supabase
      .from("instructors")
      .select("full_name")
      .eq("wp_user_id", profile.wp_instructor_id)
      .maybeSingle();

    return {
      isInstructor: true,
      wpInstructorId: profile.wp_instructor_id,
      instructorName:
        instructor?.full_name ?? profile.full_name ?? user.email ?? null,
    };
  }

  if (user.email) {
    const { data: instructor } = await supabase
      .from("instructors")
      .select("wp_user_id, full_name")
      .eq("email", user.email)
      .maybeSingle();

    if (instructor?.wp_user_id) {
      return {
        isInstructor: true,
        wpInstructorId: instructor.wp_user_id,
        instructorName: instructor.full_name ?? profile?.full_name ?? null,
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
