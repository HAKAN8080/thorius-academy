import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sipariş Geçmişi",
  description: "Satın aldığınız kursların sipariş geçmişi.",
};

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-accent-500/10 p-2">
            <ShoppingBag className="h-6 w-6 text-accent-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary-950">
            Sipariş Geçmişi
          </h1>
        </div>
        <p className="text-muted-foreground">
          WooCommerce siparişleriniz yakında bu ekranda görüntülenecek.
        </p>
      </header>

      <div className="rounded-2xl border border-dashed border-primary-200 bg-white p-8 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          Şimdilik satın aldığınız kursları{" "}
          <strong>Kurslarım</strong> bölümünden takip edebilirsiniz.
        </p>
        <Button asChild>
          <Link href="/panel/kurslarim">Kurslarıma Git</Link>
        </Button>
      </div>
    </div>
  );
}
