import { CourseCardV2 } from "@/components/course/course-card-v2";
import { mapCourseToCardProps } from "@/lib/course/map-course-card";
import type { CourseProduct } from "@/types/course-product";
import type { Course } from "@/types/wordpress";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  className?: string;
  product?: CourseProduct | null;
  isEnrolled?: boolean;
  level?: string;
  lessonCount?: number;
  duration?: string;
  rating?: number;
  ratingCount?: number;
}

export function CourseCard({
  course,
  className,
  product,
  isEnrolled,
  level,
  lessonCount,
  duration,
  rating,
  ratingCount,
}: CourseCardProps) {
  return (
    <CourseCardV2
      {...mapCourseToCardProps(course, {
        product,
        isEnrolled,
        level,
        lessonCount,
        duration,
        rating,
        ratingCount,
      })}
      className={cn(className)}
    />
  );
}
