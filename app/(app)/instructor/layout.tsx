import { requireInstructorLayoutAccess } from "@/lib/instructor/require-instructor-layout";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireInstructorLayoutAccess();
  return <>{children}</>;
}
