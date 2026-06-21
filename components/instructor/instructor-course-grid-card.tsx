import Link from "next/link";
import { Clock, Star, Users } from "lucide-react";
import type { InstructorCourseListItem } from "@/types/instructor-course";
import { InstructorCourseDeleteButton } from "@/components/instructor/instructor-course-delete-button";

interface InstructorCourseGridCardProps {
  course: InstructorCourseListItem;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function InstructorCourseGridCard({ course }: InstructorCourseGridCardProps) {
  const publishedLabel = formatDate(course.published_at);

  return (
    <article className="overflow-hidden rounded-xl border border-primary-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[16/10] bg-primary-100">
        {course.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.cover_image_url}
            alt={course.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-bold text-primary-300">
            T
          </div>
        )}
        {course.status !== "publish" ? (
          <span className="absolute left-3 top-3 rounded bg-amber-500 px-2 py-1 text-xs font-semibold text-white">
            {course.status === "draft"
              ? "Taslak"
              : course.status === "pending"
                ? "Bekliyor"
                : course.status === "future"
                  ? "Zamanlanmış"
                  : course.status}
          </span>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <h2 className="line-clamp-2 min-h-[3rem] text-base font-semibold leading-snug text-[#0B1E3F]">
          {course.title}
        </h2>

        {publishedLabel ? (
          <p className="flex items-center gap-1.5 text-xs text-primary-500">
            <Clock className="h-3.5 w-3.5" />
            {publishedLabel}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 text-xs text-primary-600">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course.enrollment_count}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {course.rating_avg > 0 ? course.rating_avg.toFixed(1) : "—"}
            {course.rating_count > 0 ? ` (${course.rating_count})` : ""}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-primary-50 pt-3">
          <Link
            href={`/instructor/courses/${course.id}/basics`}
            className="flex-1 rounded-lg bg-[#D4AF37] px-3 py-2 text-center text-sm font-semibold text-[#0B1E3F] hover:bg-[#D4AF37]/90"
          >
            Düzenle
          </Link>
          <Link
            href={`/instructor/courses/${course.id}/ogrenciler`}
            className="rounded-lg border border-[#0B1E3F]/20 px-3 py-2 text-sm font-medium text-[#0B1E3F] hover:border-[#D4AF37]"
          >
            Öğrenciler ({course.enrollment_count})
          </Link>
          {course.status === "publish" && course.course_slug ? (
            <Link
              href={`/panel/egitmen/${course.course_slug}`}
              className="rounded-lg border border-[#0B1E3F]/20 px-3 py-2 text-sm font-medium text-[#0B1E3F] hover:border-[#D4AF37]"
            >
              Yorumlar
            </Link>
          ) : null}
          {course.status !== "publish" ? (
            <InstructorCourseDeleteButton
              courseId={course.id}
              courseTitle={course.title}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
