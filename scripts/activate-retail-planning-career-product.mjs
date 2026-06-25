/**
 * Pilot: retail-planning kariyer paketi WooCommerce eşlemesi.
 *
 * Kullanım:
 *   RETAIL_PLANNING_WC_PRODUCT_ID=12345 RETAIL_PLANNING_PRICE=4999 npm run pilot:retail-planning-product
 *
 * WC'de "Retail Planning Kariyer Paketi" ürününü oluşturduktan sonra bu script
 * career_path_products kaydını günceller.
 */
import { createClient } from "@supabase/supabase-js";

const slug = "retail-planning";
const wcProductId = Number(process.env.RETAIL_PLANNING_WC_PRODUCT_ID);
const priceNormal = Number(process.env.RETAIL_PLANNING_PRICE ?? "0");
const priceSale = process.env.RETAIL_PLANNING_SALE_PRICE
  ? Number(process.env.RETAIL_PLANNING_SALE_PRICE)
  : null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
  process.exit(1);
}

if (!Number.isFinite(wcProductId) || wcProductId <= 0) {
  console.error("RETAIL_PLANNING_WC_PRODUCT_ID pozitif bir sayı olmalı.");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey);

const { data: path, error: pathError } = await admin
  .from("career_paths")
  .select("id, slug, title")
  .eq("slug", slug)
  .maybeSingle();

if (pathError || !path) {
  console.error("Kariyer yolu bulunamadı:", pathError?.message ?? slug);
  process.exit(1);
}

const { data, error } = await admin
  .from("career_path_products")
  .upsert(
    {
      career_path_id: path.id,
      career_path_slug: path.slug,
      wc_product_id: wcProductId,
      price_normal: priceNormal > 0 ? priceNormal : null,
      price_sale: priceSale,
      currency: "TRY",
      is_active: true,
    },
    { onConflict: "career_path_slug" },
  )
  .select("*")
  .single();

if (error) {
  console.error("Ürün eşlemesi başarısız:", error.message);
  process.exit(1);
}

console.log("Retail Planning paketi eşlendi:");
console.log(JSON.stringify(data, null, 2));
console.log("\nTest adımları:");
console.log("1. /kariyer-yolu/retail-planning sayfasında Paketi Satın Al");
console.log("2. WC test siparişi → webhook → career_path_enrollments + 1. kurs enrollment");
console.log("3. 1. kursu tamamla → 2. kurs drip enrollment");
console.log("4. Aynı sipariş webhook tekrarı → duplicate yok");
