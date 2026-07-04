import { getAllCourseProducts } from "@/lib/actions/course-products";
import {
  isFreeCourseProduct,
  isPurchasableCourseProduct,
} from "@/lib/course/course-product-utils";
import type { CatalogCourseItem } from "@/lib/course/courses-cache-catalog";

export async function enrichCatalogWithCourseProducts(
  courses: CatalogCourseItem[],
): Promise<CatalogCourseItem[]> {
  const products = await getAllCourseProducts();
  const productBySlug = new Map(products.map((product) => [product.course_slug, product]));

  return courses.map((course) => {
    const product = productBySlug.get(course.slug);
    if (!product) {
      return course;
    }

    if (isPurchasableCourseProduct(product)) {
      return {
        ...course,
        pricingModel: "paid",
        price: product.price_normal ?? 0,
        salePrice: product.price_sale,
      };
    }

    if (isFreeCourseProduct(product)) {
      return {
        ...course,
        pricingModel: "free",
        price: 0,
        salePrice: null,
      };
    }

    return course;
  });
}
