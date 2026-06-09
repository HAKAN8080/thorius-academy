import { notFound } from "next/navigation";
import { requireInstructorLayoutAccess } from "@/lib/instructor/require-instructor-layout";
import { getCourseBasics } from "@/lib/actions/instructor-courses";
import { getBuilderCurriculum } from "@/lib/actions/instructor-builder";
import { BuilderCurriculumEditor } from "@/components/instructor/course-builder/builder-curriculum-editor";

interface Props {
  params: Promise<{ courseId: string }>;
}

export const dynamic = "force-dynamic";

export default async function InstructorCurriculumPage({ params }: Props) {
  await requireInstructorLayoutAccess();
  const { courseId } = await params;

  const courseResult = await getCourseBasics(courseId);
  if ("error" in courseResult) {
    notFound();
  }

  const curriculumResult = await getBuilderCurriculum(courseId);
  if ("error" in curriculumResult) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <BuilderCurriculumEditor
        courseCacheId={courseId}
        courseTitle={courseResult.title}
        initialSections={curriculumResult.sections}
        initialLessons={curriculumResult.lessons}
      />
    </div>
  );
}
