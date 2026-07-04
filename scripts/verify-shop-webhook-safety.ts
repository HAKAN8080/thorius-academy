/**
 * Shop webhook safety check — kitap ürünleri course_products'ta olmamalı.
 * Çalıştır: npx tsx scripts/verify-shop-webhook-safety.ts [wcProductId]
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main(): Promise<void> {
  loadEnvFile(resolve(process.cwd(), ".env.local"));
  loadEnvFile(resolve(process.cwd(), ".env"));

  const wcProductId = Number(process.argv[2] ?? "0");
  if (!Number.isFinite(wcProductId) || wcProductId <= 0) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          message:
            "Kullanım: npx tsx scripts/verify-shop-webhook-safety.ts <wcProductId>",
        },
        null,
        2,
      ),
    );
    process.exit(1);
  }

  const admin = getSupabaseAdmin();
  const [courseProduct, pathProduct] = await Promise.all([
    admin
      .from("course_products")
      .select("course_slug")
      .eq("wc_product_id", wcProductId)
      .maybeSingle(),
    admin
      .from("career_path_products")
      .select("career_path_slug")
      .eq("wc_product_id", wcProductId)
      .maybeSingle(),
  ]);

  const mappedToCourse = Boolean(courseProduct.data?.course_slug);
  const mappedToPath = Boolean(pathProduct.data?.career_path_slug);

  console.log(
    JSON.stringify(
      {
        wcProductId,
        mappedToCourse,
        mappedToPath,
        enrollmentWouldRun: mappedToCourse || mappedToPath,
        safeForShopBooks: !mappedToCourse && !mappedToPath,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
