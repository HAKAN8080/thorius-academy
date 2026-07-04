import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ShopBuyButton } from "@/components/shop/shop-buy-button";
import { getShopProductBySlug } from "@/lib/shop/fetch-shop-products";

interface ShopProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ShopProductPageProps) {
  const { slug } = await params;
  const product = await getShopProductBySlug(slug);

  if (!product) {
    return { title: "Kitap bulunamadı" };
  }

  return {
    title: `${product.name} | Thorius Mağaza`,
    description: product.shortDescription.replace(/<[^>]+>/g, "") || product.name,
  };
}

export default async function ShopProductPage({ params }: ShopProductPageProps) {
  const { slug } = await params;
  const product = await getShopProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const descriptionHtml = product.description || product.shortDescription;

  return (
    <section className="py-10 md:py-14">
      <Container size="wide">
        <Link
          href="/"
          className="mb-6 inline-flex text-sm font-medium text-primary-700 hover:text-primary-950"
        >
          ← Tüm kitaplar
        </Link>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-primary-100 bg-primary-50">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.imageAlt}
                className="aspect-[3/4] w-full object-cover"
              />
            ) : (
              <div className="aspect-[3/4] w-full bg-gradient-to-br from-primary-200 to-primary-300" />
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent-700">
                Kitap
              </p>
              <h1 className="mt-2 text-3xl font-bold text-primary-950 md:text-4xl">
                {product.name}
              </h1>
            </div>

            <ShopBuyButton
              wcProductId={product.id}
              priceNormal={product.priceNormal}
              priceSale={product.priceSale}
              inStock={product.inStock}
            />

            {descriptionHtml ? (
              <div
                className="prose prose-primary max-w-none text-primary-800"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
