import type { Metadata } from "next";
import { CareerPathView } from "@/components/marketing/career-path-view";
import { HR_CAREER_PATH } from "@/lib/content/career-paths";
import { loadCareerPathPage } from "@/lib/course/load-career-path-page";

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
  const { path, steps, productBySlug } = await loadCareerPathPage(HR_CAREER_PATH);

  return <CareerPathView path={path} steps={steps} productBySlug={productBySlug} />;
}
