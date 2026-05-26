import Link from "next/link";
import Image from "next/image";
import { Calendar, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { InstructorCourseStats } from "@/types/instructor";

interface InstructorCourseCardProps {
  course: InstructorCourseStats;
}

function formatRating(avg: number): string {
  if (avg <= 0) return "—";
  return avg.toFixed(1);
}

export function InstructorCourseCard({ course }: InstructorCourseCardProps) {
  const publishedLabel = course.published_at
    ? new Date(course.published_at).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white transition-all duration-300 hover:shadow-xl">
      <div className="relative aspect-video bg-primary-50">
        {course.image_url ? (
          <Image
            src={course.image_url}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <span className="text-4xl font-bold text-primary-300">T</span>
          </div>
        )}
        {course.status !== "publish" && (
          <div className="absolute left-3 top-3">
            <Badge className="border-0 bg-amber-500 text-white">
              {course.status}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-grow flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-primary-950">
          {course.title}
        </h3>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {course.enrollment_count} öğrenci
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {formatRating(Number(course.rating_avg))}
            {course.rating_count > 0 && (
              <span className="text-xs">({course.rating_count} puan)</span>
            )}
          </span>
        </div>

        {publishedLabel && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Yayın: {publishedLabel}</span>
          </div>
        )}

        <div className="mt-auto border-t border-primary-50 pt-3">
          <Link
            href={`/panel/egitmen/${course.course_slug}`}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary-950 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-900"
          >
            Yorumları Gör
          </Link>
        </div>
      </div>
    </article>
  );
}
