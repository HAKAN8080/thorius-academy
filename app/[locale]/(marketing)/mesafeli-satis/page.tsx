import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalDocumentView } from "@/components/marketing/legal-document-view";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });

  return {
    title: t("distanceSales.meta.title"),
    description: t("distanceSales.meta.description"),
  };
}

export default function MesafeliSatisPage() {
  return <LegalDocumentView namespace="distanceSales" />;
}
