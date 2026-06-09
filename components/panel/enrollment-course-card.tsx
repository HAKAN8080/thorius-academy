import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Enrollment } from "@/types/enrollment";

interface EnrollmentCourseCardProps {
  enrollment: Enrollment;
  compact?: boolean;
}

function enrollmentStatusLabel(enrollment: Enrollment): string {
  if (enrollment.status === "completed") return "Tamamlandı";
  if (enrollment.progress >= 100) return "Tamamlandı";
  if (enrollment.progress > 0) return "Devam ediyor";
  return "Başlanmadı";
}

export function EnrollmentCourseCard({
  enrollment,
  compact = false,
}: EnrollmentCourseCardProps) {
  const progress = Math.min(100, Math.max(0, enrollment.progress ?? 0));

  return (
    <article
      className={
        compact
          ? "flex flex-col overflow-hidden rounded-xl border border-primary-100 bg-white transition hover:shadow-md sm:flex-row"
          : "group flex flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white transition-all duration-300 hover:shadow-xl"
      }
    >
      <div
        className={
          compact
            ? "relative aspect-video w-full shrink-0 bg-primary-50 sm:w-44 sm:aspect-square"
            : "relative aspect-video bg-primary-50"
        }
      >
        {enrollment.course_image ? (
          <Image
            src={enrollment.course_image}
            alt={enrollment.course_title}
            fill
            sizes={
              compact
                ? "176px"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <span className="text-3xl font-bold text-primary-300">T</span>
          </div>
        )}
        {enrollment.course_category ? (
          <div className="absolute left-3 top-3">
            <Badge className="border-0 bg-primary-950/90 text-white backdrop-blur-sm">
              {enrollment.course_category}
            </Badge>
          </div>
        ) : null}
      </div>

      <div className={compact ? "flex flex-1 flex-col gap-2 p-4" : "flex flex-grow flex-col gap-3 p-5"}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3
            className={
              compact
                ? "line-clamp-2 text-base font-bold text-primary-950"
                : "line-clamp-2 text-lg font-bold text-primary-950"
            }
          >
            {enrollment.course_title}
          </h3>
          <Badge
            variant="outline"
            className={
              enrollment.status === "completed" || progress >= 100
                ? "border-green-200 bg-green-50 text-green-700"
                : progress > 0
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-primary-100 text-primary-600"
            }
          >
            {enrollmentStatusLabel(enrollment)}
          </Badge>
        </div>

        {enrollment.instructor_name ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{enrollment.instructor_name}</span>
          </div>
        ) : null}

        {!compact ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Kayıt:{" "}
              {new Date(enrollment.enrolled_at).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        ) : null}

        <div className={compact ? "mt-1" : "mt-2"}>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>İlerleme</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-primary-100">
            <div
              className="h-full bg-gradient-to-r from-accent-400 to-accent-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className={compact ? "mt-auto pt-1" : "mt-auto border-t border-primary-50 pt-3"}>
          <Button
            asChild
            size={compact ? "sm" : "sm"}
            className="w-full bg-primary-950 text-white hover:bg-primary-900"
          >
            <Link href={`/panel/kurslarim/${enrollment.course_slug}`}>
              Kursa Devam Et
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
