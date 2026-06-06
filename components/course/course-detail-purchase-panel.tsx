import { Suspense } from "react";
import { getCoursePurchaseState } from "@/lib/course/course-purchase-state";
import { CoursePurchaseCta } from "@/components/course/course-purchase-cta";
import type { Course } from "@/types/wordpress";

interface CourseDetailPurchasePanelProps {
  course: Pick<
    Course,
    | "id"
    | "slug"
    | "title"
    | "featuredImage"
    | "categories"
    | "instructor"
    | "youtubeVideoId"
  >;
}

export async function CourseDetailPurchasePanel({
  course,
}: CourseDetailPurchasePanelProps) {
  const purchaseState = await getCoursePurchaseState(course);

  return (
    <CoursePurchaseCta
      courseId={course.id}
      courseSlug={course.slug}
      courseTitle={course.title}
      courseImage={course.featuredImage}
      courseCategory={course.categories[0]?.name}
      instructorName={course.instructor?.name}
      isFreeYoutubeCourse={Boolean(course.youtubeVideoId)}
      {...purchaseState}
    />
  );
}

export function CourseDetailPurchasePanelSkeleton() {
  return (
    <div
      className="h-12 w-48 animate-pulse rounded-xl bg-primary-800/40"
      aria-hidden="true"
    />
  );
}

export function CourseDetailPurchaseSection({
  course,
}: CourseDetailPurchasePanelProps) {
  return (
    <Suspense fallback={<CourseDetailPurchasePanelSkeleton />}>
      <CourseDetailPurchasePanel course={course} />
    </Suspense>
  );
}
