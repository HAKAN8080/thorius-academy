import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getInstructorAccess } from "@/lib/instructor/access";

export interface PanelShellContext {
  userEmail: string | null;
  userName: string | null;
  avatarUrl: string | null;
  isInstructor: boolean;
}

export async function getPanelShellContext(): Promise<PanelShellContext> {
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
    };
  }

  const access = await getInstructorAccess();
  let userName = user.user_metadata?.full_name as string | undefined;
  let avatarUrl: string | null = null;

  if (access.wpInstructorId) {
    const admin = getSupabaseAdmin();
    const { data: instructor } = await admin
      .from("instructors")
      .select("full_name, avatar_url")
      .eq("wp_user_id", access.wpInstructorId)
      .maybeSingle();

    userName = instructor?.full_name ?? userName ?? null;
    avatarUrl = instructor?.avatar_url ?? null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userEmail: user.email ?? null,
    userName: userName ?? profile?.full_name ?? null,
    avatarUrl,
    isInstructor: access.isInstructor,
  };
}
