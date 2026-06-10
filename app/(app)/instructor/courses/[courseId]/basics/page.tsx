import { notFound } from "next/navigation";
import { requireInstructorLayoutAccess } from "@/lib/instructor/require-instructor-layout";
import { getCourseBasics } from "@/lib/actions/instructor-courses";
import { CourseBasicsForm } from "@/components/instructor/course-builder/course-basics-form";
import { fetchCategoryList } from "@/lib/wordpress/api";

interface Props {
  params: Promise<{ courseId: string }>;
}

export const dynamic = "force-dynamic";

export default async function InstructorCourseBasicsPage({ params }: Props) {
  await requireInstructorLayoutAccess();
  const { courseId } = await params;
  const [result, categories] = await Promise.all([
    getCourseBasics(courseId),
    fetchCategoryList(),
  ]);

  if ("error" in result) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <CourseBasicsForm course={result} categories={categories} />
    </div>
  );
}
