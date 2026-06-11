import type { CourseStudentRow } from "@/lib/actions/instructor-course-students";
import type { CoursesCache } from "@/types/instructor-course";
import { CourseBuilderNav } from "@/components/instructor/course-builder/course-builder-nav";
import { Users } from "lucide-react";

interface CourseStudentsViewProps {
  course: CoursesCache;
  students: CourseStudentRow[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: string): string {
  if (status === "completed") return "Tamamlandı";
  if (status === "cancelled") return "İptal";
  return "Aktif";
}

export function CourseStudentsView({ course, students }: CourseStudentsViewProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm font-medium text-[#D4AF37]">Kurs Oluşturucu</p>
        <h1 className="mt-1 text-2xl font-bold text-[#0B1E3F]">{course.title}</h1>
        <p className="mt-2 text-sm text-primary-600">
          Bu kursa kayıtlı öğrencileri ve ilerleme durumlarını görüntüleyin.
        </p>
      </div>

      <CourseBuilderNav courseId={course.id} current="students" />

      <div className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#0B1E3F]">
            <Users className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold">
              Öğrenciler ({students.length})
            </h2>
          </div>
          <p className="text-xs text-primary-500">
            E-posta adresleri yalnızca kurs eğitmeni tarafından görülebilir.
          </p>
        </div>

        {students.length === 0 ? (
          <div className="rounded-xl border border-dashed border-primary-200 bg-primary-50/40 px-6 py-12 text-center">
            <p className="font-medium text-[#0B1E3F]">Henüz kayıtlı öğrenci yok</p>
            <p className="mt-2 text-sm text-primary-600">
              Satın alma veya kayıt sonrası öğrenciler burada listelenir.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary-100 text-xs uppercase tracking-wide text-primary-500">
                  <th className="px-3 py-3 font-semibold">Öğrenci</th>
                  <th className="px-3 py-3 font-semibold">E-posta</th>
                  <th className="px-3 py-3 font-semibold">Kayıt</th>
                  <th className="px-3 py-3 font-semibold">İlerleme</th>
                  <th className="px-3 py-3 font-semibold">Durum</th>
                  <th className="px-3 py-3 font-semibold">Kaynak</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.enrollment_id}
                    className="border-b border-primary-50 last:border-0"
                  >
                    <td className="px-3 py-3 font-medium text-[#0B1E3F]">
                      {student.full_name?.trim() || "—"}
                    </td>
                    <td className="px-3 py-3 text-primary-700">{student.email}</td>
                    <td className="px-3 py-3 text-primary-600">
                      {formatDate(student.enrolled_at)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex min-w-[120px] items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-100">
                          <div
                            className="h-full rounded-full bg-[#D4AF37]"
                            style={{
                              width: `${Math.min(100, Math.max(0, student.progress))}%`,
                            }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs font-semibold text-[#0B1E3F]">
                          {student.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-primary-700">
                      {statusLabel(student.status)}
                    </td>
                    <td className="px-3 py-3 text-primary-600">
                      {student.source ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
