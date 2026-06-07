import { createClient } from "@/lib/supabase/server";
import { getInstructorAccess } from "@/lib/instructor/access";

function getAdminEmails(): string[] {
  const fromEnv = (process.env.CAREER_PATH_ADMIN_EMAILS ?? process.env.INSTRUCTOR_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return fromEnv;
}

export async function isCareerPathAdmin(): Promise<boolean> {
  const instructor = await getInstructorAccess();
  if (instructor.isInstructor) {
    return true;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.trim().toLowerCase();
  if (!email) {
    return false;
  }

  return getAdminEmails().includes(email);
}

export async function requireCareerPathAdmin(): Promise<void> {
  const allowed = await isCareerPathAdmin();
  if (!allowed) {
    throw new Error("CAREER_PATH_ADMIN_DENIED");
  }
}
