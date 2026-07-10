import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaqPageView } from "@/components/marketing/faq-page-view";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default function SssPage() {
  return <FaqPageView />;
}
