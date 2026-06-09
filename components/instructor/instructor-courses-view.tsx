import Link from "next/link";
import type { InstructorCourseListItem } from "@/types/instructor-course";
import { InstructorCourseGridCard } from "@/components/instructor/instructor-course-grid-card";

type CourseTab = "publish" | "pending" | "draft" | "future";

const tabs: { id: CourseTab; label: string }[] = [
  { id: "publish", label: "Yayında" },
  { id: "pending", label: "Bekliyor" },
  { id: "draft", label: "Taslak" },
  { id: "future", label: "Zamanlanmış" },
];

interface InstructorCoursesViewProps {
  courses: InstructorCourseListItem[];
  activeTab: CourseTab;
  instructorLinked: boolean;
}

function countByStatus(
  courses: InstructorCourseListItem[],
  status: CourseTab,
): number {
  return courses.filter((course) => course.status === status).length;
}

export function InstructorCoursesView({
  courses,
  activeTab,
  instructorLinked,
}: InstructorCoursesViewProps) {
  const filtered = courses.filter((course) => course.status === activeTab);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#0B1E3F]">Kurslarım</h2>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex min-w-max gap-1 border-b border-primary-200">
          {tabs.map((tab) => {
            const count = countByStatus(courses, tab.id);
            const active = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/instructor/courses?status=${tab.id}`}
                className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "border-[#D4AF37] text-[#0B1E3F]"
                    : "border-transparent text-primary-500 hover:text-[#0B1E3F]"
                }`}
              >
                {tab.label} ({count})
              </Link>
            );
          })}
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary-200 bg-white p-12 text-center">
          <p className="text-lg font-semibold text-[#0B1E3F]">
            Henüz kurs görünmüyor
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-primary-500">
            {instructorLinked
              ? "Tutor LMS verileri henüz Academy'ye aktarılmamış olabilir. Birkaç dakika bekleyin veya yönetici Tutor sync'i tetiklesin."
              : "Hesabınız henüz bir Tutor eğitmen profiline bağlanmamış. Giriş e-postanızın instructors tablosunda kayıtlı olduğundan emin olun."}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary-200 bg-white p-12 text-center">
          <p className="text-lg font-semibold text-[#0B1E3F]">
            Bu sekmede kurs yok
          </p>
          <p className="mt-2 text-sm text-primary-500">
            Başka bir sekmeye geçin veya yeni kurs oluşturun.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <InstructorCourseGridCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
