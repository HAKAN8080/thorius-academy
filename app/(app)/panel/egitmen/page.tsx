import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInstructorAccess } from "@/lib/instructor/access";

export default async function LegacyInstructorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/giris?redirect=/instructor/courses");
  }

  const access = await getInstructorAccess();
  if (!access.isInstructor) {
    redirect("/panel/kurslarim");
  }

  redirect("/instructor/courses");
}
