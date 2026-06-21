import type { Metadata } from "next";
import { headers } from "next/headers";
import { AcademyHomePage } from "@/components/marketing/academy-home-page";
import { CompanyHomePage } from "@/components/marketing/company-home-page";
import {
  getCompanyOrigin,
  getSiteModeFromHost,
  isCompanySiteHost,
} from "@/lib/site/site-mode";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const host = headers().get("host");

  if (isCompanySiteHost(host)) {
    return {
      title: "Thorius — Danışmanlık, AI4U Retail ve Academy",
      description:
        "Thorius Eğitim ve Danışmanlık: tedarik zinciri, planlama ve İK audit; AI4U Retail yazılımı; Thorius Academy ile sürdürülebilir yetkinlik.",
      alternates: {
        canonical: getCompanyOrigin(),
      },
      openGraph: {
        title: "Thorius — Danışmanlık, AI4U Retail ve Academy",
        url: getCompanyOrigin(),
        type: "website",
      },
    };
  }

  const academyTitle =
    "Thorius Academy — Perakende ve İK Uzmanlık Eğitimleri";
  const academyDescription =
    "Retail Planning, İnsan Kaynakları ve Yapay Zeka alanlarında kariyer odaklı online kurslar. OTB, range plan, envanter ve AI destekli forecast eğitimleri; sertifika ve kariyer yolları.";

  return {
    title: { absolute: academyTitle },
    description: academyDescription,
    openGraph: {
      title: academyTitle,
      description: academyDescription,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: academyTitle,
      description: academyDescription,
    },
  };
}

export default async function HomePage() {
  const host = headers().get("host");
  const mode = getSiteModeFromHost(host);

  if (mode === "company") {
    return <CompanyHomePage />;
  }

  return <AcademyHomePage />;
}
