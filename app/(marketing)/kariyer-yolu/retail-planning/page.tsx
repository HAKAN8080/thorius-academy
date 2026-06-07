import type { Metadata } from "next";
import { CareerPathView } from "@/components/marketing/career-path-view";
import { RETAIL_PLANNING_PATH } from "@/lib/content/career-paths";
import { loadCareerPathPage } from "@/lib/course/load-career-path-page";

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
  const { path, steps, productBySlug } = await loadCareerPathPage(
    RETAIL_PLANNING_PATH,
  );

  return <CareerPathView path={path} steps={steps} productBySlug={productBySlug} />;
}
