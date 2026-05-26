import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Presentation } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getInstructorAccess } from "@/lib/instructor/access";
import { getInstructorCourses } from "@/lib/actions/instructor-dashboard";
import { InstructorCourseCard } from "@/components/instructor/instructor-course-card";

export const metadata: Metadata = {
  title: "Eğitmen Paneli",
  description: "Kurslarınız, öğrenci sayıları ve değerlendirmeler.",
};

export default async function InstructorDashboardPage() {
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
  const totalStudents = courses.reduce(
    (sum, course) => sum + course.enrollment_count,
    0,
  );
  const totalReviews = courses.reduce(
    (sum, course) => sum + course.rating_count,
    0,
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-accent-500/10 p-2">
            <Presentation className="h-6 w-6 text-accent-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary-950 md:text-4xl">
            Eğitmen Paneli
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          {access.instructorName
            ? `Hoş geldiniz, ${access.instructorName} — verdiğiniz kurslar`
            : "Verdiğiniz kurslar, öğrenci sayıları ve geri bildirimler"}
        </p>
        {courses.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-primary-700">
            <span>{courses.length} kurs</span>
            <span>{totalStudents} toplam öğrenci</span>
            <span>{totalReviews} değerlendirme</span>
          </div>
        )}
      </header>

      {courses.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-primary-100 bg-primary-50/50 p-12 text-center">
          <h2 className="mb-2 text-xl font-semibold text-primary-950">
            Henüz kurs verisi yok
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            Tutor LMS verileri saatlik olarak senkronize edilir. İlk senkron
            tamamlandığında kurslarınız burada görünecektir.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <InstructorCourseCard key={course.wp_course_id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
