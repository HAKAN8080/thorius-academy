/**
 * Manuel e-kitap hakkı tanımla (sipariş webhook kaçırdıysa).
 *
 * Kullanım:
 *   npx tsx scripts/grant-ebook-entitlement.ts --email=user@example.com --slug=kitap-slug
 *   npx tsx scripts/grant-ebook-entitlement.ts --email=user@example.com --product=8980 --order=12345
 */
import { grantEbookEntitlementByEmail } from "../lib/kitaplik/fulfill-ebook-purchase";

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

async function main() {
  const email = arg("email");
  const slug = arg("slug");
  const productRaw = arg("product");
  const orderRaw = arg("order");

  if (!email || (!slug && !productRaw)) {
    console.error(
      "Gerekli: --email=... ve (--slug=... veya --product=WC_ID)",
    );
    process.exit(1);
  }

  const result = await grantEbookEntitlementByEmail({
    email,
    bookSlug: slug,
    ebookWcProductId: productRaw ? Number(productRaw) : undefined,
    wcOrderId: orderRaw ? Number(orderRaw) : undefined,
  });

  console.log(JSON.stringify(result, null, 2));
  if (!result.success) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
