import type { CourseProduct } from "@/types/course-product";

export const FREE_COURSE_WC_PRODUCT_ID = 0;

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
  return (
    product.wc_product_id === FREE_COURSE_WC_PRODUCT_ID ||
    getEffectiveCoursePrice(product) === 0
  );
}

export function isPurchasableCourseProduct(product: CourseProduct): boolean {
  return !isFreeCourseProduct(product) && product.wc_product_id > 0;
}
