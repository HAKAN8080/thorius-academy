import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { buildLoginRedirectPath } from "@/lib/auth/protected-paths";
import { getCurriculumAccess } from "@/lib/instructor/curriculum-access";

export async function requireInstructorLayoutAccess() {
  const access = await getCurriculumAccess();

  if (!access.userId) {
    const headerStore = await headers();
    const pathname = headerStore.get("x-pathname") ?? "/instructor/courses";
    redirect(buildLoginRedirectPath(pathname));
  }

  if (!access.canManage) {
    redirect("/panel");
  }

  return access;
}
