import { notFound } from "next/navigation";
import { requireInstructorLayoutAccess } from "@/lib/instructor/require-instructor-layout";
import { getCourseBasics } from "@/lib/actions/instructor-courses";
import { CourseBasicsForm } from "@/components/instructor/course-builder/course-basics-form";

interface Props {
  params: Promise<{ courseId: string }>;
}

export const dynamic = "force-dynamic";

export default async function InstructorCourseBasicsPage({ params }: Props) {
  await requireInstructorLayoutAccess();
  const { courseId } = await params;
  const result = await getCourseBasics(courseId);

  if ("error" in result) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1E3F]">Kurs Oluşturucu</h1>
        <p className="mt-1 text-sm text-primary-600">
          Temel kurs bilgilerini doldurun.
        </p>
      </div>
      <CourseBasicsForm course={result} />
    </div>
  );
}
