import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AboutPageView } from "@/components/marketing/about-page-view";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default function HakkimizdaPage() {
  return <AboutPageView />;
}
