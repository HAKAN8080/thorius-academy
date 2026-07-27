"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildWooCommerceCheckoutUrl,
  type CheckoutCustomer,
} from "@/lib/course/checkout-url";
import { isPurchasableCareerPathProduct } from "@/lib/career-path/career-path-product-utils";
import { trackBeginCheckout } from "@/lib/analytics/tracking";
import { academyPath } from "@/lib/site/site-mode";
import type { CareerPathProduct } from "@/types/career-path-product";

interface CareerPathBuyButtonProps {
  pathSlug: string;
  pathProduct: CareerPathProduct;
  isLoggedIn: boolean;
  customer: CheckoutCustomer | null;
  stepCount: number;
  layout?: "hero" | "inline";
}

export function CareerPathBuyButton({
  pathSlug,
  pathProduct,
  isLoggedIn,
  customer,
  stepCount,
  layout = "hero",
}: CareerPathBuyButtonProps) {
  const router = useRouter();
  const autoCheckoutStarted = useRef(false);
  const purchasable = isPurchasableCareerPathProduct(pathProduct);
  const finalPrice = purchasable
    ? (pathProduct.price_sale ?? pathProduct.price_normal ?? null)
    : null;
  const hasDiscount =
    purchasable &&
    pathProduct.price_sale !== null &&
    pathProduct.price_normal !== null &&
    pathProduct.price_sale < pathProduct.price_normal;

  function handleBuy() {
    if (!purchasable || !finalPrice) return;

    if (!isLoggedIn || !customer?.email) {
      toast.info("Satın almak için lütfen giriş yapın");
      router.push(
        `/giris?redirect=${encodeURIComponent(`/kariyer-yolu/${pathSlug}?checkout=1`)}`,
      );
      return;
    }

    trackBeginCheckout({
      id: pathSlug,
      name: pathSlug,
      price: finalPrice,
      currency: "TRY",
    });

    const checkoutUrl = buildWooCommerceCheckoutUrl(
      pathProduct.wc_product_id,
      customer,
      { returnUrl: academyPath("/panel/kurslarim") },
    );
    window.location.href = checkoutUrl;
  }

  useEffect(() => {
    if (!purchasable) return;
    if (autoCheckoutStarted.current) return;
    const wantsCheckout =
      new URLSearchParams(window.location.search).get("checkout") === "1";
    if (!wantsCheckout) return;
    if (!finalPrice) return;
    if (!isLoggedIn || !customer?.email) return;

    autoCheckoutStarted.current = true;
    handleBuy();
    // Intentional: resume checkout once after login return
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchasable, isLoggedIn, customer?.email, finalPrice]);

  if (!purchasable || !finalPrice) {
    return null;
  }

  const isHero = layout === "hero";

  return (
    <div
      className={
        isHero
          ? "flex w-full flex-col items-center gap-2"
          : "flex w-full flex-col items-start gap-2"
      }
    >
      <Button
        size="lg"
        onClick={handleBuy}
        className={
          isHero
            ? "mt-8 rounded-xl bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
            : "rounded-xl bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
        }
      >
        <Zap className="mr-2 h-5 w-5" />
        Paketi Satın Al — {finalPrice.toLocaleString("tr-TR")}₺
      </Button>
      <p
        className={
          isHero
            ? "text-sm text-primary-200"
            : "text-sm text-muted-foreground"
        }
      >
        {stepCount} kursluk sıralı paket · İlk kurs hemen açılır
      </p>
      {hasDiscount ? (
        <div
          className={
            isHero
              ? "flex items-center gap-2 text-sm text-primary-100"
              : "flex items-center gap-2 text-sm"
          }
        >
          <span className={isHero ? "line-through opacity-80" : "text-muted-foreground line-through"}>
            {pathProduct.price_normal!.toLocaleString("tr-TR")}₺
          </span>
          <span
            className={
              isHero
                ? "rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-100"
                : "rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700"
            }
          >
            %
            {Math.round(
              ((pathProduct.price_normal! - pathProduct.price_sale!) /
                pathProduct.price_normal!) *
                100,
            )}{" "}
            indirim
          </span>
        </div>
      ) : null}
      <p
        className={
          isHero ? "text-xs text-primary-300" : "text-xs text-muted-foreground"
        }
      >
        Güvenli ödeme · PayTR · Sonraki kurslar tamamladıkça açılır
      </p>
    </div>
  );
}
