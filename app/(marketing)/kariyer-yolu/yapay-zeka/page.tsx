import type { Metadata } from "next";
import { CareerPathView } from "@/components/marketing/career-path-view";
import { AI_CAREER_PATH } from "@/lib/content/career-paths";
import { loadCareerPathPage } from "@/lib/course/load-career-path-page";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Yapay Zeka Kariyer Yolu",
  description:
    "AI okuryazarlığından LLM geliştirmeye — prompt, üretken AI ve büyük dil modelleri uzmanlık yolu.",
  openGraph: {
    title: "Yapay Zeka Kariyer Yolu | Thorius Academy",
    description:
      "Yapay zeka uzmanlığınızı adım adım inşa edin — prompt'tan LLM'e.",
    type: "website",
  },
};

export default async function AiCareerPathPage() {
  const { path, steps, productBySlug } = await loadCareerPathPage(AI_CAREER_PATH);

  return <CareerPathView path={path} steps={steps} productBySlug={productBySlug} />;
}
