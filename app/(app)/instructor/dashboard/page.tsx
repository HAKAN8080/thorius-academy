import Link from "next/link";
import { BookOpen, DollarSign, GraduationCap, Layers } from "lucide-react";
import { requireInstructorLayoutAccess } from "@/lib/instructor/require-instructor-layout";
import {
  getInstructorCourseList,
  getInstructorDashboardStats,
} from "@/lib/actions/instructor-courses";
import { InstructorCourseGridCard } from "@/components/instructor/instructor-course-grid-card";

export const dynamic = "force-dynamic";

export default async function InstructorDashboardPage() {
  await requireInstructorLayoutAccess();
  const [stats, courses] = await Promise.all([
    getInstructorDashboardStats(),
    getInstructorCourseList(),
  ]);

  const cards = [
    { label: "Kayıtlı Kurslar", value: stats.totalCourses, icon: Layers },
    { label: "Aktif Kurslar", value: stats.activeCourses, icon: BookOpen },
    { label: "Toplam Öğrenci", value: stats.totalStudents, icon: GraduationCap },
    {
      label: "Toplam Kazanç",
      value: `₺${stats.totalEarnings.toLocaleString("tr-TR")}`,
      icon: DollarSign,
    },
  ];

  const recentCourses = courses.slice(0, 6);

  return (
    <div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-primary-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-primary-600">{card.label}</p>
              <card.icon className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <p className="text-2xl font-bold text-[#0B1E3F]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#0B1E3F]">Son Kurslar</h2>
        <Link
          href="/instructor/courses"
          className="text-sm font-semibold text-[#D4AF37] hover:underline"
        >
          Tümünü Gör →
        </Link>
      </div>

      {recentCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary-200 bg-white p-10 text-center">
          <p className="font-semibold text-[#0B1E3F]">Henüz kurs görünmüyor</p>
          <p className="mt-2 text-sm text-primary-500">
            Tutor LMS verileri senkronize edildiğinde kurslarınız burada listelenir.
          </p>
          <Link
            href="/instructor/courses"
            className="mt-4 inline-flex rounded-lg bg-[#0B1E3F] px-4 py-2 text-sm font-semibold text-[#D4AF37]"
          >
            Kurslarım
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {recentCourses.map((course) => (
            <InstructorCourseGridCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
