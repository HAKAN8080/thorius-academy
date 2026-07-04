import Link from "next/link";
import type { ShopProduct } from "@/lib/shop/types";
import { Card } from "@/components/ui/card";
import { ShopBuyButton } from "@/components/shop/shop-buy-button";
import { cn } from "@/lib/utils";

interface ShopProductCardProps {
  product: ShopProduct;
  className?: string;
}

export function ShopProductCard({ product, className }: ShopProductCardProps) {
  const displayPrice = product.priceSale ?? product.priceNormal;

  return (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden border-primary-100",
        className,
      )}
    >
      <Link href={`/kitap/${product.slug}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden bg-primary-100">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.imageAlt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-primary-300" />
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <Link href={`/kitap/${product.slug}`}>
            <h3 className="line-clamp-2 text-base font-semibold text-primary-950 hover:text-primary-700">
              {product.name}
            </h3>
          </Link>
          {product.shortDescription ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {product.shortDescription.replace(/<[^>]+>/g, "")}
            </p>
          ) : null}
        </div>

        <div className="mt-auto space-y-3">
          {displayPrice ? (
            <p className="text-lg font-bold text-primary-950">
              {displayPrice.toLocaleString("tr-TR")}₺
            </p>
          ) : null}
          <ShopBuyButton
            wcProductId={product.id}
            priceNormal={product.priceNormal}
            priceSale={product.priceSale}
            inStock={product.inStock}
            size="default"
          />
        </div>
      </div>
    </Card>
  );
}
