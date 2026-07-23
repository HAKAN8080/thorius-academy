"use client";

import { buildWooCommerceCheckoutUrl } from "@/lib/course/checkout-url";
import { trackBeginCheckout } from "@/lib/analytics/tracking";
import { shopPath } from "@/lib/site/site-mode";
import { Button } from "@/components/ui/button";

interface ShopBuyButtonProps {
  wcProductId: number;
  priceNormal: number | null;
  priceSale: number | null;
  inStock: boolean;
  label?: string;
  size?: "default" | "lg";
  className?: string;
  productName?: string;
}

export function ShopBuyButton({
  wcProductId,
  priceNormal,
  priceSale,
  inStock,
  label = "Satın al",
  size = "lg",
  className,
  productName,
}: ShopBuyButtonProps) {
  const finalPrice = priceSale ?? priceNormal;

  function handleBuy() {
    trackBeginCheckout({
      id: String(wcProductId),
      name: productName?.trim() || label,
      price: finalPrice,
      currency: "TRY",
    });

    const checkoutUrl = buildWooCommerceCheckoutUrl(wcProductId, null, {
      returnUrl: shopPath("/"),
    });
    window.location.href = checkoutUrl;
  }

  if (!finalPrice) {
    return (
      <Button size={size} disabled className={className}>
        Fiyat yakında
      </Button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        size={size}
        disabled={!inStock}
        onClick={handleBuy}
        className={
          className ??
          "w-full bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
        }
      >
        {inStock
          ? `${label} — ${finalPrice.toLocaleString("tr-TR")}₺`
          : "Stokta yok"}
      </Button>
      {priceSale !== null &&
      priceNormal !== null &&
      priceSale < priceNormal ? (
        <p className="text-sm text-muted-foreground">
          <span className="line-through">
            {priceNormal.toLocaleString("tr-TR")}₺
          </span>
          <span className="ml-2 font-medium text-primary-800">
            {priceSale.toLocaleString("tr-TR")}₺
          </span>
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Güvenli ödeme · PayTR · Kargo ile teslim
      </p>
    </div>
  );
}
