export interface ShopProduct {
  id: number;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  priceNormal: number | null;
  priceSale: number | null;
  currency: string;
  inStock: boolean;
}
