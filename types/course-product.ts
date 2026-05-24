export interface CourseProduct {
  id: string;
  course_slug: string;
  wp_course_id: number;
  wc_product_id: number;
  price_normal: number | null;
  price_sale: number | null;
  currency: string;
  is_active: boolean;
  created_at: string;
}
