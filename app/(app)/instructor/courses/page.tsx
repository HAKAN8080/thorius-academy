import { getCurriculumAccess } from "@/lib/instructor/curriculum-access";
import { getInstructorCourseList } from "@/lib/actions/instructor-courses";
import { InstructorCoursesView } from "@/components/instructor/instructor-courses-view";

export const dynamic = "force-dynamic";

type CourseTab = "publish" | "pending" | "draft" | "future";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

function parseTab(value: string | undefined): CourseTab {
  if (value === "pending" || value === "draft" || value === "future") {
    return value;
  }
  return "publish";
}

export default async function InstructorCoursesPage({ searchParams }: Props) {
  const access = await getCurriculumAccess();
  const { status } = await searchParams;
  const activeTab = parseTab(status);
  const courses = await getInstructorCourseList();

  return (
    <InstructorCoursesView
      courses={courses}
      activeTab={activeTab}
      instructorLinked={Boolean(access.wpInstructorId)}
    />
  );
}
