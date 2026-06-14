import type { CourseProduct } from "@/types/course-product";
import type { Course } from "@/types/wordpress";
import type { CourseCardV2Props } from "@/types/course-card";

interface MapCourseCardOptions {
  product?: CourseProduct | null;
  isEnrolled?: boolean;
  level?: string;
  lessonCount?: number;
  duration?: string;
  rating?: number;
  ratingCount?: number;
}

export function mapCourseToCardProps(
  course: Course,
  options: MapCourseCardOptions = {},
): CourseCardV2Props {
  const product = options.product;

  return {
    slug: course.slug,
    title: course.title,
    excerpt: course.excerpt.slice(0, 100),
    thumbnail: course.featuredImage || undefined,
    imageAlt: course.imageAlt,
    category: course.categories[0]?.name,
    level: options.level ?? course.level ?? "Başlangıç",
    instructor: course.instructor
      ? {
          name: course.instructor.name,
          avatar: course.instructor.avatar ?? undefined,
        }
      : undefined,
    rating: options.rating ?? course.rating ?? 0,
    ratingCount: options.ratingCount ?? course.ratingCount ?? 0,
    lessonCount: options.lessonCount ?? course.lessonCount,
    duration: options.duration ?? course.duration,
    priceNormal: product?.price_normal ?? null,
    priceSale: product?.price_sale ?? null,
    isEnrolled: options.isEnrolled,
  };
}
