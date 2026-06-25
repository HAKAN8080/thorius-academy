import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { CareerPathProduct } from "@/types/career-path-product";

export async function getCareerPathProductForAdmin(
  careerPathId: string,
): Promise<CareerPathProduct | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("career_path_products")
    .select("*")
    .eq("career_path_id", careerPathId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as CareerPathProduct;
}
