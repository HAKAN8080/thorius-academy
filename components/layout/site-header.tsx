import { createClient } from "@/lib/supabase/server";
import { getInstructorAccess } from "@/lib/instructor/access";
import { Header } from "@/components/layout/header";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = user ? await getInstructorAccess() : { isInstructor: false };

  return <Header isInstructor={access.isInstructor} />;
}
