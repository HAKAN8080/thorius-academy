"use server";

import { getInstructorAccess } from "@/lib/instructor/access";
import { getUserEnrollments } from "@/lib/actions/enrollment";

export interface InstructorAccessSummary {
  isInstructor: boolean;
  hasStudentCourses: boolean;
}

export async function getInstructorAccessSummary(): Promise<InstructorAccessSummary> {
  const access = await getInstructorAccess();

  if (!access.isInstructor) {
    return { isInstructor: false, hasStudentCourses: false };
  }

  const enrollments = await getUserEnrollments();
  return {
    isInstructor: true,
    hasStudentCourses: enrollments.length > 0,
  };
}
