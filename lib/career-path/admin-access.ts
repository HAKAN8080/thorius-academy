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
  const access = await getInstructorAccess();
  return isCareerPathAdminForAccess(access, await getLoginEmail());
}

async function getLoginEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email?.trim().toLowerCase() ?? null;
}

export function isCareerPathAdminForAccess(
  access: Awaited<ReturnType<typeof getInstructorAccess>>,
  email: string | null | undefined,
): boolean {
  if (access.isInstructor) {
    return true;
  }

  const normalized = email?.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return getAdminEmails().includes(normalized);
}

export async function requireCareerPathAdmin(): Promise<void> {
  const allowed = await isCareerPathAdmin();
  if (!allowed) {
    throw new Error("CAREER_PATH_ADMIN_DENIED");
  }
}
