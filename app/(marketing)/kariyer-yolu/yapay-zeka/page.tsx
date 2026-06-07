import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CareerPathView } from "@/components/marketing/career-path-view";
import { AI_CAREER_PATH } from "@/lib/content/career-paths";
import { loadCareerPathBySlug } from "@/lib/course/load-career-path-by-slug";

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
  const data = await loadCareerPathBySlug("yapay-zeka", AI_CAREER_PATH);
  if (!data) notFound();

  return (
    <CareerPathView
      path={data.path}
      steps={data.steps}
      productBySlug={data.productBySlug}
    />
  );
}
