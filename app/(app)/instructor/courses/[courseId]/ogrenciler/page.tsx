import { notFound } from "next/navigation";
import { getCourseStudents } from "@/lib/actions/instructor-course-students";
import { requireInstructorLayoutAccess } from "@/lib/instructor/require-instructor-layout";
import { CourseStudentsView } from "@/components/instructor/course-builder/course-students-view";

interface Props {
  params: Promise<{ courseId: string }>;
}

export const dynamic = "force-dynamic";

export default async function InstructorCourseStudentsPage({ params }: Props) {
  await requireInstructorLayoutAccess();
  const { courseId } = await params;
  const result = await getCourseStudents(courseId);

  if ("error" in result) {
    notFound();
  }

  return <CourseStudentsView course={result.course} students={result.students} />;
}
