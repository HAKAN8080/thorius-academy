import { headers } from "next/headers";
import { Footer } from "@/components/layout/footer";
import { CompanyFooter } from "@/components/layout/company-footer";
import { CompanyMarketingHeader } from "@/components/layout/company-marketing-header";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { PromoBanner } from "@/components/marketing/promo-banner";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildAcademyOrganizationJsonLd } from "@/lib/seo/organization-schema";
import { isCompanySiteHost } from "@/lib/site/site-mode";

export const revalidate = 3600;

function getConfiguredSiteMode(): "academy" | "company" | null {
  const mode = process.env.NEXT_PUBLIC_SITE_MODE?.trim().toLowerCase();
  if (mode === "academy" || mode === "company") {
    return mode;
  }
  return null;
}

function AcademyMarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={buildAcademyOrganizationJsonLd()} />
      <PromoBanner />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function CompanyMarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <CompanyMarketingHeader />
      <main className="flex-1">{children}</main>
      <CompanyFooter />
    </div>
  );
}

function DynamicMarketingShell({ children }: { children: React.ReactNode }) {
  const isCompany = isCompanySiteHost(headers().get("host"));

  if (isCompany) {
    return <CompanyMarketingShell>{children}</CompanyMarketingShell>;
  }

  return <AcademyMarketingShell>{children}</AcademyMarketingShell>;
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteMode = getConfiguredSiteMode();

  if (siteMode === "company") {
    return <CompanyMarketingShell>{children}</CompanyMarketingShell>;
  }

  if (siteMode === "academy") {
    return <AcademyMarketingShell>{children}</AcademyMarketingShell>;
  }

  return <DynamicMarketingShell>{children}</DynamicMarketingShell>;
}
