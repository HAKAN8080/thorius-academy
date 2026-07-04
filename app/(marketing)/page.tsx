import type { Metadata } from "next";
import { headers } from "next/headers";
import { AcademyHomePage } from "@/components/marketing/academy-home-page";
import { CompanyHomePage } from "@/components/marketing/company-home-page";
import { ShopHomePage } from "@/components/shop/shop-home-page";
import {
  getCompanyOrigin,
  getShopOrigin,
  getSiteModeFromHost,
  isCompanySiteHost,
} from "@/lib/site/site-mode";

export const revalidate = 3600;

const ACADEMY_HOME_METADATA: Metadata = {
  title: {
    absolute: "Thorius Academy — Perakende ve İK Uzmanlık Eğitimleri",
  },
  description:
    "Retail Planning, İnsan Kaynakları ve Yapay Zeka alanlarında kariyer odaklı online kurslar. OTB, range plan, envanter ve AI destekli forecast eğitimleri; sertifika ve kariyer yolları.",
  openGraph: {
    title: "Thorius Academy — Perakende ve İK Uzmanlık Eğitimleri",
    description:
      "Retail Planning, İnsan Kaynakları ve Yapay Zeka alanlarında kariyer odaklı online kurslar. OTB, range plan, envanter ve AI destekli forecast eğitimleri; sertifika ve kariyer yolları.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thorius Academy — Perakende ve İK Uzmanlık Eğitimleri",
    description:
      "Retail Planning, İnsan Kaynakları ve Yapay Zeka alanlarında kariyer odaklı online kurslar.",
  },
};

const COMPANY_HOME_METADATA: Metadata = {
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

const SHOP_HOME_METADATA: Metadata = {
  title: {
    absolute: "Thorius Mağaza — Uzmanlık Kitapları",
  },
  description:
    "Perakende, planlama ve liderlik alanlarında seçilmiş kitaplar. Güvenli ödeme ve kargo ile teslim.",
  openGraph: {
    title: "Thorius Mağaza — Uzmanlık Kitapları",
    url: getShopOrigin(),
    type: "website",
  },
};

function getConfiguredSiteMode(): "academy" | "company" | "shop" | null {
  const mode = process.env.NEXT_PUBLIC_SITE_MODE?.trim().toLowerCase();
  if (mode === "academy" || mode === "company" || mode === "shop") {
    return mode;
  }
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const siteMode = getConfiguredSiteMode();
  if (siteMode === "academy") {
    return ACADEMY_HOME_METADATA;
  }
  if (siteMode === "company") {
    return COMPANY_HOME_METADATA;
  }
  if (siteMode === "shop") {
    return SHOP_HOME_METADATA;
  }

  const host = headers().get("host");
  if (getSiteModeFromHost(host) === "shop") {
    return SHOP_HOME_METADATA;
  }
  if (isCompanySiteHost(host)) {
    return COMPANY_HOME_METADATA;
  }

  return ACADEMY_HOME_METADATA;
}

export default async function HomePage() {
  const siteMode = getConfiguredSiteMode();
  if (siteMode === "company") {
    return <CompanyHomePage />;
  }
  if (siteMode === "shop") {
    return <ShopHomePage />;
  }
  if (siteMode === "academy") {
    return <AcademyHomePage />;
  }

  const host = headers().get("host");
  const mode = getSiteModeFromHost(host);
  if (mode === "company") {
    return <CompanyHomePage />;
  }
  if (mode === "shop") {
    return <ShopHomePage />;
  }

  return <AcademyHomePage />;
}
