import type { CourseProduct } from "@/types/course-product";

export function getEffectiveCoursePrice(product: CourseProduct): number {
  if (product.price_sale !== null && product.price_sale > 0) {
    return product.price_sale;
  }
  if (product.price_normal !== null && product.price_normal > 0) {
    return product.price_normal;
  }
  return 0;
}

export function isFreeCourseProduct(product: CourseProduct): boolean {
  return getEffectiveCoursePrice(product) === 0;
}
