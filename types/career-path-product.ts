export interface CareerPathProduct {
  id: string;
  career_path_id: string;
  career_path_slug: string;
  wc_product_id: number;
  price_normal: number | null;
  price_sale: number | null;
  currency: string;
  is_active: boolean;
  created_at: string;
}
