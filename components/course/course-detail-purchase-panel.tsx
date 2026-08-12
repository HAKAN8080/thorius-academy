import { Suspense } from "react";
import { getCoursePurchaseState } from "@/lib/course/course-purchase-state";
import { CoursePurchaseCta } from "@/components/course/course-purchase-cta";
import { CourseDetailPurchasePanelSkeleton } from "@/components/course/course-detail-purchase-skeleton";
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
  theme?: "light" | "dark";
}

export async function CourseDetailPurchasePanel({
  course,
  theme = "light",
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
      theme={theme}
      {...purchaseState}
    />
  );
}

export { CourseDetailPurchasePanelSkeleton } from "@/components/course/course-detail-purchase-skeleton";

export function CourseDetailPurchaseSection({
  course,
  theme = "light",
}: CourseDetailPurchasePanelProps) {
  return (
    <Suspense fallback={<CourseDetailPurchasePanelSkeleton />}>
      <CourseDetailPurchasePanel course={course} theme={theme} />
    </Suspense>
  );
}
