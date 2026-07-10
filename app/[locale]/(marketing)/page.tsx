import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AcademyHomePage } from "@/components/marketing/academy-home-page";
import { CompanyHomePage } from "@/components/marketing/company-home-page";
import { ShopHomePage } from "@/components/shop/shop-home-page";
import { KitaplikHomePage } from "@/components/kitaplik/kitaplik-home-page";
import {
  getCompanyOrigin,
  getKitaplikOrigin,
  getShopOrigin,
  getSiteModeFromHost,
  isCompanySiteHost,
} from "@/lib/site/site-mode";

export const revalidate = 3600;

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

const KITAPLIK_HOME_METADATA: Metadata = {
  title: {
    absolute: "Thorius Kitaplık — Basılı Kitap & E-Kitap",
  },
  description:
    "Perakende ve liderlik kitapları. Basılı sipariş veya indirilemez e-kitap — güvenli okuyucuda sayfa çevirerek okuyun.",
  openGraph: {
    title: "Thorius Kitaplık",
    url: getKitaplikOrigin(),
    type: "website",
  },
};

function getConfiguredSiteMode(): "academy" | "company" | "shop" | "kitaplik" | null {
  const mode = process.env.NEXT_PUBLIC_SITE_MODE?.trim().toLowerCase();
  if (
    mode === "academy" ||
    mode === "company" ||
    mode === "shop" ||
    mode === "kitaplik"
  ) {
    return mode;
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const siteMode = getConfiguredSiteMode();
  if (siteMode === "company") {
    return COMPANY_HOME_METADATA;
  }
  if (siteMode === "shop") {
    return SHOP_HOME_METADATA;
  }
  if (siteMode === "kitaplik") {
    return KITAPLIK_HOME_METADATA;
  }

  const host = headers().get("host");
  if (getSiteModeFromHost(host) === "kitaplik") {
    return KITAPLIK_HOME_METADATA;
  }
  if (getSiteModeFromHost(host) === "shop") {
    return SHOP_HOME_METADATA;
  }
  if (isCompanySiteHost(host)) {
    return COMPANY_HOME_METADATA;
  }

  const t = await getTranslations({ locale, namespace: "home" });
  const title = t("meta.title");
  const description = t("meta.description");

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function HomePage() {
  const siteMode = getConfiguredSiteMode();
  if (siteMode === "company") {
    return <CompanyHomePage />;
  }
  if (siteMode === "shop") {
    return <ShopHomePage />;
  }
  if (siteMode === "kitaplik") {
    return <KitaplikHomePage />;
  }
  if (siteMode === "academy") {
    return <AcademyHomePage />;
  }

  const host = headers().get("host");
  const mode = getSiteModeFromHost(host);
  if (mode === "kitaplik") {
    return <KitaplikHomePage />;
  }
  if (mode === "company") {
    return <CompanyHomePage />;
  }
  if (mode === "shop") {
    return <ShopHomePage />;
  }

  return <AcademyHomePage />;
}
