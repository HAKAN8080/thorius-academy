import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInstructorAccess } from "@/lib/instructor/access";
import { getInstructorCourses } from "@/lib/actions/instructor-dashboard";
import { InstructorCourseCard } from "@/components/instructor/instructor-course-card";

export default async function InstructorReviewsHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/giris?redirect=/panel/egitmen");
  }

  const access = await getInstructorAccess();
  if (!access.isInstructor) {
    redirect("/panel/kurslarim");
  }

  const courses = await getInstructorCourses();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-[#0B1E3F]">Kurs Yorumları</h1>
      <p className="mb-6 text-sm text-primary-600">
        Öğrenci yorumlarını görmek için bir kurs seçin.
      </p>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary-200 bg-white p-10 text-center text-sm text-primary-500">
          Henüz senkronize edilmiş kurs yok.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <InstructorCourseCard key={course.wp_course_id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
