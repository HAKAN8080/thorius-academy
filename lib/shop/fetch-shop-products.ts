import { getWpSiteUrl } from "@/lib/config/portal-urls";
import type { ShopProduct } from "@/lib/shop/types";

const WC_STORE_BASE = `${getWpSiteUrl()}/wp-json/wc/store/v1`;

interface WooStoreImage {
  src?: string;
  alt?: string;
  name?: string;
}

interface WooStoreCategory {
  slug?: string;
  name?: string;
}

interface WooStoreProductRow {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  images?: WooStoreImage[];
  categories?: WooStoreCategory[];
  is_in_stock?: boolean;
  prices?: {
    price?: string;
    regular_price?: string;
    sale_price?: string;
    currency_code?: string;
    currency_minor_unit?: number;
  };
}

function getShopCategorySlug(): string {
  return (process.env.SHOP_WC_CATEGORY_SLUG ?? "kitap").trim().toLowerCase();
}

function parseStorePrice(
  raw: string | undefined,
  minorUnit: number,
): number | null {
  if (raw === undefined || raw === "") {
    return null;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed / Math.pow(10, minorUnit);
}

function mapStoreProduct(row: WooStoreProductRow): ShopProduct {
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

  const image = row.images?.[0];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description?.trim() ?? "",
    description: row.description?.trim() ?? "",
    imageUrl: image?.src?.trim() || null,
    imageAlt: image?.alt?.trim() || image?.name?.trim() || row.name,
    priceNormal,
    priceSale,
    currency: row.prices?.currency_code ?? "TRY",
    inStock: row.is_in_stock !== false,
  };
}

function matchesShopCategory(row: WooStoreProductRow, categorySlug: string): boolean {
  return (row.categories ?? []).some(
    (category) => category.slug?.trim().toLowerCase() === categorySlug,
  );
}

async function fetchStoreProductPage(page: number): Promise<WooStoreProductRow[]> {
  const response = await fetch(
    `${WC_STORE_BASE}/products?per_page=100&page=${page}`,
    {
      next: { revalidate: 300, tags: ["shop-products"] },
    },
  );

  if (!response.ok) {
    throw new Error(`WC store products fetch failed: ${response.status}`);
  }

  return response.json();
}

export async function listShopProducts(): Promise<ShopProduct[]> {
  const categorySlug = getShopCategorySlug();
  const rows: WooStoreProductRow[] = [];
  let page = 1;

  while (page <= 20) {
    const batch = await fetchStoreProductPage(page);
    if (!batch.length) {
      break;
    }

    rows.push(...batch);
    if (batch.length < 100) {
      break;
    }
    page += 1;
  }

  return rows
    .filter((row) => matchesShopCategory(row, categorySlug))
    .map(mapStoreProduct)
    .sort((left, right) => left.name.localeCompare(right.name, "tr"));
}

export async function getShopProductBySlug(
  slug: string,
): Promise<ShopProduct | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const products = await listShopProducts();
  return products.find((product) => product.slug === normalized) ?? null;
}
