import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BookOpen, Star, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getInstructorAccess } from "@/lib/instructor/access";
import {
  getCourseReviews,
  getInstructorCourseBySlug,
} from "@/lib/actions/instructor-dashboard";
import { getCourseCacheIdByWpCourseId } from "@/lib/instructor/course-cache-access";
import { InstructorReviewsList } from "@/components/instructor/instructor-reviews-list";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function InstructorCourseDetailPage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/giris?redirect=/panel/egitmen/${slug}`);
  }

  const access = await getInstructorAccess();
  if (!access.isInstructor) {
    redirect("/panel/kurslarim");
  }

  const course = await getInstructorCourseBySlug(slug);
  if (!course) notFound();

  const reviews = await getCourseReviews(course.wp_course_id);
  const courseCacheId =
    (await getCourseCacheIdByWpCourseId(course.wp_course_id)) ??
    String(course.wp_course_id);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/panel/egitmen"
        className="mb-6 inline-flex items-center gap-2 text-sm text-primary-700 hover:text-accent-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Eğitmen Paneli
      </Link>

      <div className="mb-8 overflow-hidden rounded-2xl border border-primary-100 bg-white">
        <div className="grid gap-0 md:grid-cols-[280px_1fr]">
          <div className="relative aspect-video bg-primary-50 md:aspect-auto md:min-h-[180px]">
            {course.image_url ? (
              <Image
                src={course.image_url}
                alt={course.title}
                fill
                sizes="280px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                <span className="text-4xl font-bold text-primary-300">T</span>
              </div>
            )}
          </div>
          <div className="p-6">
            <h1 className="mb-3 text-2xl font-bold text-primary-950 md:text-3xl">
              {course.title}
            </h1>
            <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {course.enrollment_count} öğrenci
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {Number(course.rating_avg) > 0
                  ? Number(course.rating_avg).toFixed(1)
                  : "—"}
                {course.rating_count > 0 && (
                  <span>({course.rating_count} puan)</span>
                )}
              </span>
            </div>
            <Link
              href={`/instructor/courses/${courseCacheId}/curriculum`}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0B1E3F] px-4 py-2 text-sm font-semibold text-[#D4AF37] transition hover:bg-[#0B1E3F]/90"
            >
              <BookOpen className="h-4 w-4" />
              Müfredatı Yönet
            </Link>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold text-primary-950">
          Öğrenci Yorumları ({reviews.length})
        </h2>
        <InstructorReviewsList reviews={reviews} />
      </section>
    </div>
  );
}
