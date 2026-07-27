import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ShopProductCard } from "@/components/shop/shop-product-card";
import { getSessionCheckoutCustomer } from "@/lib/course/session-checkout-customer";
import { listShopProducts } from "@/lib/shop/fetch-shop-products";
import { academyPath } from "@/lib/site/site-mode";

export async function ShopHomePage() {
  let products: Awaited<ReturnType<typeof listShopProducts>> = [];
  let loadError: string | null = null;
  const customer = await getSessionCheckoutCustomer();

  try {
    products = await listShopProducts();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Kitaplar yüklenemedi.";
  }

  return (
    <>
      <section className="border-b border-primary-100 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950 py-12 text-white md:py-16">
        <Container size="wide">
          <p className="mb-3 text-sm font-semibold tracking-wide text-accent-300">
            Thorius Mağaza
          </p>
          <h1 className="max-w-3xl text-3xl font-bold md:text-4xl">
            Uzmanlık kitapları, kapınıza kadar
          </h1>
          <p className="mt-4 max-w-2xl text-base text-primary-100/90 md:text-lg">
            Perakende, planlama ve liderlik alanlarında seçilmiş kitaplar.
            Ödeme PayTR ile güvenli; kargo WooCommerce üzerinden yönetilir.
          </p>
          <p className="mt-6 text-sm text-primary-200/80">
            Online kurslar için{" "}
            <Link href={academyPath("/kurslar")} className="font-medium text-accent-300 underline-offset-4 hover:underline">
              Thorius Academy
            </Link>
            &apos;yi ziyaret edin.
          </p>
        </Container>
      </section>

      <section className="py-10 md:py-14" aria-labelledby="shop-books-heading">
        <Container size="wide">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="shop-books-heading" className="text-2xl font-bold text-primary-950">
                Kitaplar
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {products.length > 0
                  ? `${products.length} kitap listeleniyor`
                  : "Yakında yeni kitaplar eklenecek"}
              </p>
            </div>
          </div>

          {loadError ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Kitap listesi şu an yüklenemedi. Lütfen daha sonra tekrar deneyin.
            </p>
          ) : null}

          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ShopProductCard
                  key={product.id}
                  product={product}
                  customer={customer}
                />
              ))}
            </div>
          ) : (
            !loadError && (
              <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/60 px-6 py-12 text-center">
                <p className="text-base font-medium text-primary-900">
                  Henüz yayınlanmış kitap bulunmuyor.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  WordPress&apos;te <strong>Kitap</strong> kategorisinde ürün
                  ekledikten sonra burada görünecek.
                </p>
              </div>
            )
          )}
        </Container>
      </section>
    </>
  );
}
