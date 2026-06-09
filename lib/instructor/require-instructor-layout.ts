import { redirect } from "next/navigation";
import { getCurriculumAccess } from "@/lib/instructor/curriculum-access";

export async function requireInstructorLayoutAccess() {
  const access = await getCurriculumAccess();

  if (!access.userId) {
    redirect("/giris?redirect=/instructor/dashboard");
  }

  if (!access.canManage) {
    redirect("/panel/kurslarim");
  }

  return access;
}
