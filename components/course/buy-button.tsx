"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, ExternalLink } from "lucide-react";

interface Props {
  wcProductId: number;
  priceNormal: number | null;
  priceSale: number | null;
  courseTitle: string;
}

export function BuyButton({
  wcProductId,
  priceNormal,
  priceSale,
}: Props) {
  const finalPrice = priceSale || priceNormal;
  const hasDiscount =
    priceSale !== null &&
    priceNormal !== null &&
    priceSale < priceNormal;

  function handleBuy() {
    const checkoutUrl = `https://thorius.com.tr/odeme/?add-to-cart=${wcProductId}&quantity=1`;
    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
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
        <ShoppingCart className="mr-2 h-5 w-5" />
        Satın Al — {finalPrice.toLocaleString("tr-TR")}₺
        <ExternalLink className="ml-2 h-4 w-4 opacity-60" />
      </Button>

      {hasDiscount && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground line-through">
            {priceNormal!.toLocaleString("tr-TR")}₺
          </span>
          <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
            %
            {Math.round(
              ((priceNormal! - priceSale!) / priceNormal!) * 100,
            )}{" "}
            indirim
          </span>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground sm:text-left">
        Güvenli ödeme · PayTR · Ömür boyu erişim
      </p>
    </div>
  );
}
