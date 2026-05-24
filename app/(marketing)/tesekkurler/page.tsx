import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Teşekkürler — Siparişiniz Alındı",
  description: "Thorius Academy satın alma onayı",
};

export default function TesekkurlerPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  const orderId = searchParams.order_id;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="space-y-6 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-primary-950 md:text-4xl">
            Teşekkürler! 🎉
          </h1>
          <p className="text-lg text-muted-foreground">
            Satın alma işleminiz başarıyla tamamlandı.
          </p>
          {orderId && (
            <p className="text-sm text-muted-foreground">
              Sipariş No:{" "}
              <span className="font-mono font-semibold">{orderId}</span>
            </p>
          )}
        </div>

        <div className="my-8 space-y-4 rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-accent-50 p-6 text-left md:p-8">
          <h2 className="text-xl font-bold text-primary-950">
            Sıradaki Adımlar
          </h2>

          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-lg border border-primary-100 bg-white p-2">
              <Mail className="h-5 w-5 text-accent-600" />
            </div>
            <div>
              <p className="font-semibold text-primary-950">
                1. E-posta Kontrolü
              </p>
              <p className="text-sm text-primary-700">
                Onay e-postası birkaç dakika içinde gelir. Spam klasörünü de
                kontrol edin.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-lg border border-primary-100 bg-white p-2">
              <BookOpen className="h-5 w-5 text-accent-600" />
            </div>
            <div>
              <p className="font-semibold text-primary-950">
                2. Kursunuza Erişim
              </p>
              <p className="text-sm text-primary-700">
                Sistem otomatik olarak kursunuzu hesabınıza tanımlar. Birkaç
                dakika içinde panelden görebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
          >
            <Link href="/panel/kurslarim">Kurslarıma Git</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/kurslar">Diğer Kurslara Bak</Link>
          </Button>
        </div>

        <p className="pt-8 text-xs text-muted-foreground">
          Sorun mu yaşadınız?{" "}
          <Link href="/iletisim" className="text-accent-600 hover:underline">
            Bize ulaşın
          </Link>
        </p>
      </div>
    </div>
  );
}
