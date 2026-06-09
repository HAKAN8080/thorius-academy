import { requireInstructorLayoutAccess } from "@/lib/instructor/require-instructor-layout";
import {
  getInstructorCourseList,
  getInstructorDashboardStats,
} from "@/lib/actions/instructor-courses";
import { InstructorCourseGridCard } from "@/components/instructor/instructor-course-grid-card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InstructorDashboardPage() {
  await requireInstructorLayoutAccess();
  const [stats, courses] = await Promise.all([
    getInstructorDashboardStats(),
    getInstructorCourseList(),
  ]);

  const cards = [
    { label: "Kayıtlı Kurslar", value: stats.totalCourses },
    { label: "Aktif Kurslar", value: stats.activeCourses },
    { label: "Toplam Öğrenci", value: stats.totalStudents },
    {
      label: "Toplam Kazanç",
      value: `₺${stats.totalEarnings.toLocaleString("tr-TR")}`,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[#0B1E3F]">Eğitmen Özeti</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-primary-100 bg-white p-5"
          >
            <p className="text-sm text-primary-600">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-[#0B1E3F]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#0B1E3F]">Son Kurslar</h2>
        <Link
          href="/instructor/courses"
          className="text-sm font-semibold text-[#D4AF37] hover:underline"
        >
          Kurslarım →
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {courses.slice(0, 6).map((course) => (
          <InstructorCourseGridCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
