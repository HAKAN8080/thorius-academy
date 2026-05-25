import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PromoBanner } from "@/components/marketing/promo-banner";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PromoBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
