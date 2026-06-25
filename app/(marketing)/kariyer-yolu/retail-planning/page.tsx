import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CareerPathView } from "@/components/marketing/career-path-view";
import { RETAIL_PLANNING_PATH } from "@/lib/content/career-paths";
import { getCareerPathPurchaseState } from "@/lib/career-path/career-path-purchase-state";
import { loadCareerPathBySlug } from "@/lib/course/load-career-path-by-slug";

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
  const [data, purchaseState] = await Promise.all([
    loadCareerPathBySlug("retail-planning", RETAIL_PLANNING_PATH),
    getCareerPathPurchaseState("retail-planning"),
  ]);
  if (!data) notFound();

  return (
    <CareerPathView
      path={data.path}
      steps={data.steps}
      productBySlug={data.productBySlug}
      pathProduct={purchaseState.pathProduct}
      isLoggedIn={purchaseState.isLoggedIn}
      customer={purchaseState.customer}
    />
  );
}
