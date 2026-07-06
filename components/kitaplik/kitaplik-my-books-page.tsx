import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { listUserOwnedEbooks } from "@/lib/kitaplik/repository";
import { academyPath, kitaplikPath } from "@/lib/site/site-mode";
import { createClient } from "@/lib/supabase/server";

export async function KitaplikMyBooksPage() {
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

  const owned = await listUserOwnedEbooks();

  return (
    <section className="py-10 md:py-14">
      <Container size="wide">
        <h1 className="text-3xl font-bold text-primary-950">Kitaplarım</h1>
        <p className="mt-2 text-primary-700">
          Satın aldığınız e-kitaplar — yalnızca burada okunabilir.
        </p>

        {owned.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-primary-200 bg-primary-50/60 px-6 py-12 text-center">
            <p className="font-medium text-primary-900">
              Henüz e-kitabınız yok.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/">Kitaplara göz at</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {owned.map((book) => (
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
                  </div>
                </div>
                <Button
                  asChild
                  className="mt-5 w-full bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
                >
                  <Link href={`/oku/${book.slug}`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Oku
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
