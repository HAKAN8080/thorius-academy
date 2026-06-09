import { requireInstructorLayoutAccess } from "@/lib/instructor/require-instructor-layout";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { InstructorShell } from "@/components/instructor/instructor-shell";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await requireInstructorLayoutAccess();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let instructorName: string | null = null;

  if (access.wpInstructorId) {
    const admin = getSupabaseAdmin();
    const { data: instructor } = await admin
      .from("instructors")
      .select("full_name")
      .eq("wp_user_id", access.wpInstructorId)
      .maybeSingle();
    instructorName = instructor?.full_name ?? null;
  }

  return (
    <InstructorShell
      instructorName={instructorName}
      instructorEmail={user?.email ?? null}
    >
      {children}
    </InstructorShell>
  );
}
