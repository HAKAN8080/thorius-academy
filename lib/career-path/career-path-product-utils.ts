import type { CareerPathProduct } from "@/types/career-path-product";

export function getEffectiveCareerPathPrice(product: CareerPathProduct): number {
  if (product.price_sale !== null && product.price_sale > 0) {
    return product.price_sale;
  }
  if (product.price_normal !== null && product.price_normal > 0) {
    return product.price_normal;
  }
  return 0;
}

export function isFreeCareerPathProduct(
  product: CareerPathProduct | null | undefined,
): boolean {
  if (!product) {
    return true;
  }
  return product.wc_product_id <= 0 || getEffectiveCareerPathPrice(product) === 0;
}

export function isPurchasableCareerPathProduct(
  product: CareerPathProduct | null | undefined,
): boolean {
  if (!product || !product.is_active) {
    return false;
  }
  return !isFreeCareerPathProduct(product);
}
