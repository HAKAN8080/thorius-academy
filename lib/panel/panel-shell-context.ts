import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isCareerPathAdmin } from "@/lib/career-path/admin-access";
import { getInstructorAccess } from "@/lib/instructor/access";
import { resolvePanelDisplayName } from "@/lib/instructor/display-name";

export interface PanelShellContext {
  userEmail: string | null;
  userName: string | null;
  avatarUrl: string | null;
  isInstructor: boolean;
  isCareerPathAdmin: boolean;
}

export const getPanelShellContext = cache(async (): Promise<PanelShellContext> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userEmail: null,
      userName: null,
      avatarUrl: null,
      isInstructor: false,
      isCareerPathAdmin: false,
    };
  }

  const [access, careerPathAdmin] = await Promise.all([
    getInstructorAccess(),
    isCareerPathAdmin(),
  ]);
  const loginEmail = user.email ?? null;

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : null;

  let instructorName: string | null = null;
  let instructorEmail: string | null = null;
  let avatarUrl: string | null = null;

  if (access.isInstructor && access.wpInstructorId) {
    const { data: instructor } = await admin
      .from("instructors")
      .select("full_name, avatar_url, email")
      .eq("wp_user_id", access.wpInstructorId)
      .maybeSingle();

    instructorName = instructor?.full_name ?? access.instructorName;
    instructorEmail = instructor?.email ?? null;

    if (
      instructorEmail &&
      loginEmail &&
      instructorEmail.toLowerCase() === loginEmail.toLowerCase()
    ) {
      avatarUrl = instructor?.avatar_url ?? null;
    }
  }

  const userName = resolvePanelDisplayName({
    loginEmail,
    profileName: profile?.full_name,
    metadataName,
    instructorName,
    instructorEmail,
  });

  return {
    userEmail: loginEmail,
    userName,
    avatarUrl: profile?.avatar_url ?? avatarUrl,
    isInstructor: access.isInstructor,
    isCareerPathAdmin: careerPathAdmin,
  };
});
