import { getAllCourseProducts } from "@/lib/actions/course-products";
import type { CareerPathDefinition } from "@/lib/content/career-path-types";
import { resolveCareerPathSteps } from "@/lib/course/resolve-career-path-courses";
import type { CourseProduct } from "@/types/course-product";
import type { ResolvedCareerPathStep } from "@/lib/course/resolve-career-path-courses";

export interface CareerPathPageData {
  path: CareerPathDefinition;
  steps: ResolvedCareerPathStep[];
  productBySlug: Map<string, CourseProduct>;
}

export async function loadCareerPathPage(
  path: CareerPathDefinition,
): Promise<CareerPathPageData> {
  const [steps, products] = await Promise.all([
    resolveCareerPathSteps(path.steps),
    getAllCourseProducts(),
  ]);

  const productBySlug = new Map<string, CourseProduct>(
    products.map((product) => [product.course_slug, product]),
  );

  return { path, steps, productBySlug };
}
