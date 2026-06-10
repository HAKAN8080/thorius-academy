import Link from "next/link";
import { BookOpen, DollarSign, GraduationCap, Layers } from "lucide-react";
import {
  getInstructorCourseList,
  getInstructorDashboardStats,
} from "@/lib/actions/instructor-courses";
import { getUserEnrollments } from "@/lib/actions/enrollment";
import { getPanelShellContext } from "@/lib/panel/panel-shell-context";
import { InstructorCourseGridCard } from "@/components/instructor/instructor-course-grid-card";
import { EnrollmentCourseCard } from "@/components/panel/enrollment-course-card";

export const dynamic = "force-dynamic";

export default async function PanelDashboardPage() {
  const shell = await getPanelShellContext();

  const [enrollments, instructorStats, instructorCourses] = await Promise.all([
    getUserEnrollments(),
    shell.isInstructor ? getInstructorDashboardStats() : Promise.resolve(null),
    shell.isInstructor ? getInstructorCourseList() : Promise.resolve([]),
  ]);

  const activeEnrollments = enrollments.filter((e) => e.status !== "cancelled");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[#0B1E3F]">Kontrol Paneli</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-primary-100 bg-white p-5">
          <div className="mb-2 flex items-center justify-between text-sm text-primary-600">
            Kayıtlı Kurslarım
            <BookOpen className="h-4 w-4 text-[#D4AF37]" />
          </div>
          <p className="text-2xl font-bold text-[#0B1E3F]">
            {activeEnrollments.length}
          </p>
        </div>

        {instructorStats ? (
          <>
            <div className="rounded-xl border border-primary-100 bg-white p-5">
              <div className="mb-2 flex items-center justify-between text-sm text-primary-600">
                Verdiğim Kurslar
                <Layers className="h-4 w-4 text-[#D4AF37]" />
              </div>
              <p className="text-2xl font-bold text-[#0B1E3F]">
                {instructorStats.totalCourses}
              </p>
            </div>
            <div className="rounded-xl border border-primary-100 bg-white p-5">
              <div className="mb-2 flex items-center justify-between text-sm text-primary-600">
                Toplam Öğrenci
                <GraduationCap className="h-4 w-4 text-[#D4AF37]" />
              </div>
              <p className="text-2xl font-bold text-[#0B1E3F]">
                {instructorStats.totalStudents}
              </p>
            </div>
            <div className="rounded-xl border border-primary-100 bg-white p-5">
              <div className="mb-2 flex items-center justify-between text-sm text-primary-600">
                Toplam Kazanç
                <DollarSign className="h-4 w-4 text-[#D4AF37]" />
              </div>
              <p className="text-2xl font-bold text-[#0B1E3F]">
                ₺{instructorStats.totalEarnings.toLocaleString("tr-TR")}
              </p>
            </div>
          </>
        ) : null}
      </div>

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0B1E3F]">
            {shell.isInstructor ? "Öğrenci Kurslarım" : "Kurslarım"}
          </h2>
          {activeEnrollments.length > 0 ? (
            <Link
              href="/panel/kurslarim"
              className="text-sm font-semibold text-[#D4AF37] hover:underline"
            >
              Tümünü Gör
            </Link>
          ) : null}
        </div>

        {activeEnrollments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-primary-200 bg-white p-6">
            <p className="mb-4 text-sm text-primary-600">
              Henüz kayıtlı kursunuz yok. Katalogdan bir kurs seçerek
              başlayabilirsiniz.
            </p>
            <Link
              href="/kurslar"
              className="text-sm font-semibold text-[#D4AF37] hover:underline"
            >
              Kurslara Göz At →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeEnrollments.slice(0, 5).map((enrollment) => (
              <EnrollmentCourseCard
                key={enrollment.id}
                enrollment={enrollment}
                compact
              />
            ))}
          </div>
        )}
      </section>

      {shell.isInstructor && instructorCourses.length > 0 ? (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0B1E3F]">
              Yayında Olan Kurslarım
            </h2>
            <Link
              href="/instructor/courses?status=publish"
              className="text-sm font-semibold text-[#D4AF37] hover:underline"
            >
              Tümünü Gör
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {instructorCourses
              .filter((c) => c.status === "publish")
              .slice(0, 6)
              .map((course) => (
                <InstructorCourseGridCard key={course.id} course={course} />
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
