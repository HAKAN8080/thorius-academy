import { EnrollButton } from "@/components/enrollment/enroll-button";
import { BuyButton } from "@/components/course/buy-button";
import type { CourseProduct } from "@/types/course-product";

interface CoursePurchaseCtaProps {
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  courseImage?: string | null;
  courseCategory?: string | null;
  instructorName?: string | null;
  isLoggedIn: boolean;
  isAlreadyEnrolled: boolean;
  courseProduct: CourseProduct | null;
}

export function CoursePurchaseCta({
  courseId,
  courseSlug,
  courseTitle,
  courseImage,
  courseCategory,
  instructorName,
  isLoggedIn,
  isAlreadyEnrolled,
  courseProduct,
}: CoursePurchaseCtaProps) {
  if (isAlreadyEnrolled) {
    return (
      <EnrollButton
        courseId={courseId}
        courseSlug={courseSlug}
        courseTitle={courseTitle}
        courseImage={courseImage}
        courseCategory={courseCategory}
        instructorName={instructorName}
        isLoggedIn={isLoggedIn}
        isAlreadyEnrolled={true}
      />
    );
  }

  if (courseProduct) {
    return (
      <BuyButton
        wcProductId={courseProduct.wc_product_id}
        priceNormal={courseProduct.price_normal}
        priceSale={courseProduct.price_sale}
        courseTitle={courseTitle}
      />
    );
  }

  return (
    <EnrollButton
      courseId={courseId}
      courseSlug={courseSlug}
      courseTitle={courseTitle}
      courseImage={courseImage}
      courseCategory={courseCategory}
      instructorName={instructorName}
      isLoggedIn={isLoggedIn}
      isAlreadyEnrolled={false}
    />
  );
}
