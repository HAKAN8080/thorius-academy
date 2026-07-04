"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import {
  buildWooCommerceCheckoutUrl,
  type CheckoutCustomer,
} from "@/lib/course/checkout-url";

interface Props {
  wcProductId: number;
  priceNormal: number | null;
  priceSale: number | null;
  courseSlug: string;
  isLoggedIn: boolean;
  customer: CheckoutCustomer | null;
  theme?: "light" | "dark";
}

export function BuyButton({
  wcProductId,
  priceNormal,
  priceSale,
  courseSlug,
  isLoggedIn,
  customer,
  theme = "light",
}: Props) {
  const router = useRouter();
  const finalPrice = priceSale || priceNormal;
  const hasDiscount =
    priceSale !== null &&
    priceNormal !== null &&
    priceSale < priceNormal;

  function handleBuy() {
    if (!isLoggedIn || !customer?.email) {
      toast.info("Satın almak için lütfen giriş yapın");
      router.push(`/giris?redirect=/kurslar/${courseSlug}`);
      return;
    }

    const checkoutUrl = buildWooCommerceCheckoutUrl(wcProductId, customer);
    window.location.href = checkoutUrl;
  }

  if (!finalPrice) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto">
      <Button
        size="lg"
        onClick={handleBuy}
        className="w-full bg-accent-500 text-base font-bold text-primary-950 hover:bg-accent-600 sm:w-auto"
      >
        <Zap className="mr-2 h-5 w-5" />
        Hemen Satın Al — {finalPrice.toLocaleString("tr-TR")}₺
      </Button>

      {hasDiscount && (
        <div className="flex items-center gap-2 text-sm">
          <span
            className={
              theme === "dark"
                ? "text-primary-200/90 line-through"
                : "text-muted-foreground line-through"
            }
          >
            {priceNormal!.toLocaleString("tr-TR")}₺
          </span>
          <span
            className={
              theme === "dark"
                ? "rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-200"
                : "rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700"
            }
          >
            %
            {Math.round(
              ((priceNormal! - priceSale!) / priceNormal!) * 100,
            )}{" "}
            indirim
          </span>
        </div>
      )}

      <p
        className={
          theme === "dark"
            ? "text-center text-xs text-primary-200/80 sm:text-left"
            : "text-center text-xs text-muted-foreground sm:text-left"
        }
      >
        Güvenli ödeme · PayTR · Ömür boyu erişim
      </p>
    </div>
  );
}
