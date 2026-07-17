"use client";

import { academyPath, kitaplikPath } from "@/lib/site/site-mode";
import { BookMarked, BookOpen, Headphones, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildWooCommerceCheckoutUrl } from "@/lib/course/checkout-url";

interface KitaplikPurchaseButtonsProps {
  bookSlug: string;
  printedWcProductId: number | null;
  printedPrice: number | null;
  printedSalePrice: number | null;
  printedInStock: boolean;
  ebookWcProductId: number | null;
  ebookPrice: number | null;
  ebookSalePrice: number | null;
  ebookInStock: boolean;
  hasEbookAccess: boolean;
  hasAudiobook?: boolean;
  isLoggedIn: boolean;
  customerEmail?: string | null;
  customerFirstName?: string | null;
  customerLastName?: string | null;
}

function formatPrice(normal: number | null, sale: number | null): string | null {
  const value = sale ?? normal;
  if (value === null) return null;
  return `${value.toLocaleString("tr-TR")}₺`;
}

export function KitaplikPurchaseButtons({
  bookSlug,
  printedWcProductId,
  printedPrice,
  printedSalePrice,
  printedInStock,
  ebookWcProductId,
  ebookPrice,
  ebookSalePrice,
  ebookInStock,
  hasEbookAccess,
  hasAudiobook = false,
  isLoggedIn,
  customerEmail,
  customerFirstName,
  customerLastName,
}: KitaplikPurchaseButtonsProps) {
  function goToCheckout(wcProductId: number, requiresLogin: boolean) {
    if (requiresLogin && (!isLoggedIn || !customerEmail)) {
      toast.info("E-kitap satın almak için giriş yapın");
      window.location.href = academyPath(
        `/giris?redirect=${encodeURIComponent(kitaplikPath(`/kitap/${bookSlug}`))}`,
      );
      return;
    }

    const checkoutUrl = buildWooCommerceCheckoutUrl(
      wcProductId,
      customerEmail
        ? {
            email: customerEmail,
            firstName: customerFirstName ?? "",
            lastName: customerLastName ?? "",
          }
        : undefined,
      { returnUrl: kitaplikPath("/kitaplarim") },
    );
    window.location.href = checkoutUrl;
  }

  const printedLabel = formatPrice(printedPrice, printedSalePrice);
  const ebookLabel = formatPrice(ebookPrice, ebookSalePrice);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {printedWcProductId && printedLabel ? (
        <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-5">
          <div className="mb-3 flex items-center gap-2 text-primary-900">
            <Truck className="h-5 w-5 text-accent-600" />
            <span className="font-semibold">Basılı kitap</span>
          </div>
          <p className="mb-4 text-sm text-primary-700">
            Kapınıza kargo ile gönderilir. İndirilemez dijital kopya içermez.
          </p>
          <Button
            className="w-full bg-primary-950 font-semibold text-accent-500 hover:bg-primary-900 hover:text-accent-400"
            disabled={!printedInStock}
            onClick={() => goToCheckout(printedWcProductId, false)}
          >
            {printedInStock
              ? `Basılı sipariş ver — ${printedLabel}`
              : "Stokta yok"}
          </Button>
        </div>
      ) : null}

      {ebookWcProductId && ebookLabel ? (
        <div className="rounded-2xl border border-accent-200/60 bg-accent-50/40 p-5">
          <div className="mb-3 flex items-center gap-2 text-primary-900">
            <BookOpen className="h-5 w-5 text-accent-600" />
            <span className="font-semibold">E-kitap</span>
            {hasAudiobook ? (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-accent-500/20 px-2.5 py-0.5 text-xs font-semibold text-accent-700">
                <Headphones className="h-3.5 w-3.5" />
                Sesli e-kitap dahil
              </span>
            ) : null}
          </div>
          <p className="mb-4 text-sm text-primary-700">
            Yalnızca tarayıcıda okunur. İndirilemez; kopyalama ve ekran görüntüsü
            engellenir.
            {hasAudiobook
              ? " Kelime takipli sesli okuma özelliği içerir."
              : ""}
          </p>
          {hasEbookAccess ? (
            <div className="flex flex-col gap-2">
              <Button
                asChild
                className="w-full bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
              >
                <a href={`/oku/${bookSlug}`}>
                  <BookMarked className="mr-2 h-4 w-4" />
                  Oku
                </a>
              </Button>
              {hasAudiobook ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-accent-400 font-semibold text-accent-700 hover:bg-accent-50"
                >
                  <a href={`/dinle/${bookSlug}`}>
                    <Headphones className="mr-2 h-4 w-4" />
                    Sesli Dinle
                  </a>
                </Button>
              ) : null}
            </div>
          ) : (
            <Button
              className="w-full bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
              disabled={!ebookInStock}
              onClick={() => goToCheckout(ebookWcProductId, true)}
            >
              {ebookInStock
                ? `E-kitap al — ${ebookLabel}`
                : "Şu an satışta değil"}
            </Button>
          )}
        </div>
      ) : hasEbookAccess ? (
        <div className="rounded-2xl border border-accent-200/60 bg-accent-50/40 p-5 sm:col-span-2">
          <div className="mb-3 flex items-center gap-2 text-primary-900">
            <BookOpen className="h-5 w-5 text-accent-600" />
            <span className="font-semibold">E-kitap okuyucu</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              asChild
              className="w-full bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
            >
              <a href={`/oku/${bookSlug}`}>
                <BookMarked className="mr-2 h-4 w-4" />
                Oku
              </a>
            </Button>
            {hasAudiobook ? (
              <Button
                asChild
                variant="outline"
                className="w-full border-accent-400 font-semibold text-accent-700 hover:bg-accent-50"
              >
                <a href={`/dinle/${bookSlug}`}>
                  <Headphones className="mr-2 h-4 w-4" />
                  Sesli Dinle
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
