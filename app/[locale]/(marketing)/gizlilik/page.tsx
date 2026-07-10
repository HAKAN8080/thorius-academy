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
    title: t("privacy.meta.title"),
    description: t("privacy.meta.description"),
  };
}

export default function GizlilikPage() {
  return <LegalDocumentView namespace="privacy" />;
}
