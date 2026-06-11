import { headers } from "next/headers";
import { Footer } from "@/components/layout/footer";
import { CompanyFooter } from "@/components/layout/company-footer";
import { CompanyMarketingHeader } from "@/components/layout/company-marketing-header";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { PromoBanner } from "@/components/marketing/promo-banner";
import { isCompanySiteHost } from "@/lib/site/site-mode";

export const revalidate = 3600;

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isCompany = isCompanySiteHost(headers().get("host"));

  if (isCompany) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <CompanyMarketingHeader />
        <main className="flex-1">{children}</main>
        <CompanyFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PromoBanner />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
