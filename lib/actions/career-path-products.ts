"use server";

import { unstable_cache } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { COURSE_PRODUCTS_CACHE_TAG } from "@/lib/wordpress/cache-tags";
import type { CareerPathProduct } from "@/types/career-path-product";

const REVALIDATE_SECONDS = 3600;
const CAREER_PATH_PRODUCTS_CACHE_TAG = "career-path-products";

async function fetchAllCareerPathProductsUncached(): Promise<CareerPathProduct[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("career_path_products").select("*");

  if (error || !data) {
    return [];
  }

  return data as CareerPathProduct[];
}

const getCachedCareerPathProducts = unstable_cache(
  fetchAllCareerPathProductsUncached,
  ["all-career-path-products"],
  {
    revalidate: REVALIDATE_SECONDS,
    tags: [COURSE_PRODUCTS_CACHE_TAG, CAREER_PATH_PRODUCTS_CACHE_TAG],
  },
);

export async function getAllCareerPathProducts(): Promise<CareerPathProduct[]> {
  return getCachedCareerPathProducts();
}

export async function getCareerPathProduct(
  pathSlug: string,
): Promise<CareerPathProduct | null> {
  const products = await getAllCareerPathProducts();
  return (
    products.find(
      (product) =>
        product.career_path_slug === pathSlug && product.is_active,
    ) ?? null
  );
}

export async function getCareerPathProductByWcProductId(
  wcProductId: number,
): Promise<CareerPathProduct | null> {
  const products = await getAllCareerPathProducts();
  return (
    products.find(
      (product) => product.wc_product_id === wcProductId && product.is_active,
    ) ?? null
  );
}
