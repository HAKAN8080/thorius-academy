import type { Metadata } from "next";
import { CareerPathView } from "@/components/marketing/career-path-view";
import { RETAIL_PLANNING_STEPS } from "@/lib/content/retail-planning-career-path";
import { resolveCareerPathSteps } from "@/lib/course/resolve-career-path-courses";
import { getAllCourseProducts } from "@/lib/actions/course-products";
import type { CourseProduct } from "@/types/course-product";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Retail Planning Kariyer Yolu",
  description:
    "Perakende planlamada başlangıçtan uzmanlığa adım adım öğrenme yolu. OTB, range plan, envanter ve AI destekli planlama yetkinlikleri.",
  openGraph: {
    title: "Retail Planning Kariyer Yolu | Thorius Academy",
    description:
      "Perakende planlamada uzmanlaşın — OTB, range plan, envanter ve AI ile forecast.",
    type: "website",
  },
};

export default async function RetailPlanningCareerPathPage() {
  const [steps, products] = await Promise.all([
    resolveCareerPathSteps(RETAIL_PLANNING_STEPS),
    getAllCourseProducts(),
  ]);

  const productBySlug = new Map<string, CourseProduct>(
    products.map((product) => [product.course_slug, product]),
  );

  return <CareerPathView steps={steps} productBySlug={productBySlug} />;
}
