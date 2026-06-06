import { Footer } from "@/components/layout/footer";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { PromoBanner } from "@/components/marketing/promo-banner";

export const revalidate = 3600;

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PromoBanner />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
