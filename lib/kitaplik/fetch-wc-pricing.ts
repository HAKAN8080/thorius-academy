import { getWpSiteUrl } from "@/lib/config/portal-urls";
import type { LibraryBook } from "@/lib/kitaplik/types";

const WC_STORE_BASE = `${getWpSiteUrl()}/wp-json/wc/store/v1`;

interface WooStoreProductRow {
  id: number;
  is_in_stock?: boolean;
  prices?: {
    price?: string;
    regular_price?: string;
    sale_price?: string;
    currency_minor_unit?: number;
  };
}

function parseStorePrice(
  raw: string | undefined,
  minorUnit: number,
): number | null {
  if (raw === undefined || raw === "") return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  return parsed / Math.pow(10, minorUnit);
}

export async function fetchWcProductPricing(productId: number): Promise<{
  priceNormal: number | null;
  priceSale: number | null;
  inStock: boolean;
}> {
  const response = await fetch(`${WC_STORE_BASE}/products/${productId}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return { priceNormal: null, priceSale: null, inStock: false };
  }

  const row = (await response.json()) as WooStoreProductRow;
  const minorUnit = row.prices?.currency_minor_unit ?? 2;
  const priceNormal =
    parseStorePrice(row.prices?.regular_price, minorUnit) ??
    parseStorePrice(row.prices?.price, minorUnit);
  const saleRaw = row.prices?.sale_price;
  const priceSale =
    saleRaw &&
    row.prices?.regular_price &&
    saleRaw !== row.prices.regular_price
      ? parseStorePrice(saleRaw, minorUnit)
      : null;

  return {
    priceNormal,
    priceSale,
    inStock: row.is_in_stock !== false,
  };
}

export async function enrichLibraryBookPricing(book: LibraryBook) {
  const [printed, ebook] = await Promise.all([
    book.printed_wc_product_id
      ? fetchWcProductPricing(book.printed_wc_product_id)
      : Promise.resolve(null),
    book.ebook_wc_product_id
      ? fetchWcProductPricing(book.ebook_wc_product_id)
      : Promise.resolve(null),
  ]);

  return {
    ...book,
    printedPrice: printed?.priceNormal ?? null,
    printedSalePrice: printed?.priceSale ?? null,
    printedInStock: printed?.inStock ?? false,
    ebookPrice: ebook?.priceNormal ?? null,
    ebookSalePrice: ebook?.priceSale ?? null,
    ebookInStock: ebook?.inStock ?? false,
  };
}
