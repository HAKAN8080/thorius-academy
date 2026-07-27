import { KitaplikMyBooksPage } from "@/components/kitaplik/kitaplik-my-books-page";

export const metadata = {
  title: "Kitaplarım",
  description: "Satın aldığınız Thorius e-kitapları.",
};

export default async function KitaplarimPage({
  searchParams,
}: {
  searchParams: Promise<{ pending?: string; order_id?: string }>;
}) {
  const params = await searchParams;
  const pending =
    params.pending === "1" ||
    params.pending === "true" ||
    Boolean(params.order_id?.trim());

  return <KitaplikMyBooksPage pendingPurchase={pending} />;
}
