import Link from "next/link";
import { BookOpen, Headphones } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PendingAccessRefresh } from "@/components/marketing/pending-access-refresh";
import { Button } from "@/components/ui/button";
import { getEnabledAudiobookManifest } from "@/lib/kitaplik/audiobook-access";
import { listUserReadableEbooks } from "@/lib/kitaplik/repository";
import { hasKitaplikAdminReadAllAccess } from "@/lib/kitaplik/ebook-read-access";
import { academyPath, kitaplikPath } from "@/lib/site/site-mode";
import { createClient } from "@/lib/supabase/server";

export async function KitaplikMyBooksPage({
  pendingPurchase = false,
  orderId,
}: {
  pendingPurchase?: boolean;
  orderId?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="py-16">
        <Container size="narrow" className="text-center">
          <h1 className="text-2xl font-bold text-primary-950">Kitaplarım</h1>
          <p className="mt-3 text-primary-700">
            Satın aldığınız e-kitapları görmek için giriş yapın.
          </p>
          <Button asChild className="mt-6">
            <Link
              href={academyPath(
                `/giris?redirect=${encodeURIComponent(kitaplikPath("/kitaplarim"))}`,
              )}
            >
              Giriş yap
            </Link>
          </Button>
        </Container>
      </section>
    );
  }

  const isAdminReader = hasKitaplikAdminReadAllAccess(user.email);
  const owned = await listUserReadableEbooks().catch(() => null);

  if (!owned) {
    return (
      <section className="py-16">
        <Container size="narrow" className="text-center">
          <h1 className="text-2xl font-bold text-primary-950">Kitaplarım</h1>
          <p className="mt-3 text-primary-700">
            Kitaplarınız şu an yüklenemiyor. Lütfen birkaç dakika sonra tekrar
            deneyin.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/">Ana sayfaya dön</Link>
          </Button>
        </Container>
      </section>
    );
  }

  const audiobookFlags = await Promise.all(
    owned.map(async (book) => {
      const manifest = await getEnabledAudiobookManifest(book);
      return [book.slug, Boolean(manifest)] as const;
    }),
  );
  const hasAudiobookBySlug = Object.fromEntries(audiobookFlags);
  const showPendingEmpty = pendingPurchase && owned.length === 0;

  return (
    <section className="py-10 md:py-14">
      <Container size="wide">
        <h1 className="text-3xl font-bold text-primary-950">Kitaplarım</h1>
        <p className="mt-2 text-primary-700">
          {isAdminReader
            ? "Yönetici erişimi — PDF yüklü tüm e-kitaplar okunabilir."
            : "Satın aldığınız e-kitaplar — yalnızca burada okunabilir / dinlenebilir."}
        </p>

        {owned.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-primary-200 bg-primary-50/60 px-6 py-12 text-center">
            <p className="font-medium text-primary-900">
              {showPendingEmpty
                ? "Satın almanız işleniyor…"
                : "Henüz e-kitabınız yok."}
            </p>
            {showPendingEmpty ? (
              <PendingAccessRefresh active orderId={orderId} />
            ) : (
              <Button asChild variant="outline" className="mt-4">
                <Link href="/">Kitaplara göz at</Link>
              </Button>
            )}
          </div>
        ) : (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {owned.map((book) => {
              const hasAudiobook = hasAudiobookBySlug[book.slug] === true;
              return (
                <li
                  key={book.id}
                  className="flex flex-col rounded-2xl border border-primary-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex gap-4">
                    {book.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={book.cover_image_url}
                        alt=""
                        className="h-24 w-24 shrink-0 rounded bg-primary-50 object-contain p-1"
                      />
                    ) : (
                      <div className="h-24 w-16 shrink-0 rounded bg-primary-200" />
                    )}
                    <div>
                      <h2 className="font-semibold text-primary-950">
                        {book.title}
                      </h2>
                      {book.author ? (
                        <p className="text-sm text-muted-foreground">
                          {book.author}
                        </p>
                      ) : null}
                      {hasAudiobook ? (
                        <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent-700">
                          <Headphones className="h-3.5 w-3.5" />
                          Sesli e-kitap dahil
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-2">
                    <Button
                      asChild
                      className="w-full bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
                    >
                      <Link href={`/oku/${book.slug}`}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Oku
                      </Link>
                    </Button>
                    {hasAudiobook ? (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-accent-400 font-semibold text-accent-700 hover:bg-accent-50"
                      >
                        <Link href={`/dinle/${book.slug}`}>
                          <Headphones className="mr-2 h-4 w-4" />
                          Sesli Dinle
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </section>
  );
}
