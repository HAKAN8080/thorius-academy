import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CareerPathView } from "@/components/marketing/career-path-view";
import { HR_CAREER_PATH } from "@/lib/content/career-paths";
import { getCareerPathPurchaseState } from "@/lib/career-path/career-path-purchase-state";
import { loadCareerPathBySlug } from "@/lib/course/load-career-path-by-slug";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "İnsan Kaynakları Kariyer Yolu",
  description:
    "İK fonksiyonundan dijital ve analitik İK uzmanlığına — işe alım, performans, İK analitiği ve AI destekli süreçler.",
  openGraph: {
    title: "İnsan Kaynakları Kariyer Yolu | Thorius Academy",
    description:
      "İK kariyerinizi adım adım inşa edin — işe alımdan dijital İK'ya.",
    type: "website",
  },
};

export default async function HrCareerPathPage() {
  const [data, purchaseState] = await Promise.all([
    loadCareerPathBySlug("insan-kaynaklari", HR_CAREER_PATH),
    getCareerPathPurchaseState("insan-kaynaklari"),
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
