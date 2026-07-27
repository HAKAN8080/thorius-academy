import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail, BookOpen } from "lucide-react";
import { PurchaseTracker } from "@/components/analytics/purchase-tracker";
import { PurchaseReadyCta } from "@/components/marketing/purchase-ready-cta";

export const metadata: Metadata = {
  title: "Teşekkürler — Siparişiniz Alındı",
  description: "Thorius Academy satın alma onayı",
};

function resolveNextHref(next: string | undefined): string {
  if (!next?.trim()) {
    return "/panel/kurslarim";
  }

  try {
    const url = new URL(next);
    const host = url.hostname.toLowerCase();
    const allowed = new Set([
      "academy.thorius.com.tr",
      "kitaplik.thorius.com.tr",
      "shop.thorius.com.tr",
      "thorius.com.tr",
      "www.thorius.com.tr",
      "localhost",
    ]);
    if (!allowed.has(host)) {
      return "/panel/kurslarim";
    }
    if (host === "kitaplik.thorius.com.tr") {
      return url.toString();
    }
    if (host === "academy.thorius.com.tr" || host === "localhost") {
      return `${url.pathname}${url.search}${url.hash}` || "/panel/kurslarim";
    }
    return url.toString();
  } catch {
    if (next.startsWith("/") && !next.startsWith("//")) {
      return next;
    }
    return "/panel/kurslarim";
  }
}

function nextCtaLabel(nextHref: string): string {
  if (nextHref.includes("kitaplik") || nextHref.includes("kitaplarim")) {
    return "Kitaplarıma Git";
  }
  if (nextHref.includes("shop.thorius")) {
    return "Mağazaya Dön";
  }
  return "Kurslarıma Git";
}

export default async function TesekkurlerPage({
  searchParams,
}: {
  searchParams: Promise<{
    order_id?: string;
    value?: string;
    currency?: string;
    content_ids?: string;
    content_name?: string;
    next?: string;
  }>;
}) {
  const params = await searchParams;
  const orderId = params.order_id?.trim() || "";
  const rawValue = params.value?.trim();
  const parsedValue =
    rawValue != null && rawValue !== "" ? Number(rawValue) : null;
  const value =
    parsedValue != null && !Number.isNaN(parsedValue) ? parsedValue : null;
  const currency = params.currency?.trim() || "TRY";
  const contentIds = (params.content_ids ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const contentName = params.content_name?.trim() || undefined;
  const nextHref = resolveNextHref(params.next);
  const isExternalNext = nextHref.startsWith("http");
  const isKitaplikNext =
    nextHref.includes("kitaplik") || nextHref.includes("kitaplarim");

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      {orderId ? (
        <PurchaseTracker
          orderId={orderId}
          value={value}
          currency={currency}
          contentIds={contentIds}
          contentName={contentName}
        />
      ) : null}

      <div className="space-y-6 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-primary-950 md:text-4xl">
            Teşekkürler!
          </h1>
          <p className="text-lg text-muted-foreground">
            Satın alma işleminiz başarıyla tamamlandı.
          </p>
          {orderId ? (
            <p className="text-sm text-muted-foreground">
              Sipariş No:{" "}
              <span className="font-mono font-semibold">{orderId}</span>
            </p>
          ) : null}
        </div>

        <div className="my-8 space-y-4 rounded-2xl border border-primary-100 bg-primary-50 p-6 text-left md:p-8">
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
                2. İçeriğinize Erişim
              </p>
              <p className="text-sm text-primary-700">
                {isKitaplikNext
                  ? "E-kitabınız Kitaplarım paneline tanımlanır. Bu sayfa hazır olunca bildirir."
                  : "Sistem satın almanızı hesabınıza tanımlar. Hazır olunca aşağıdaki düğme aktifleşir."}
              </p>
            </div>
          </div>
        </div>

        <PurchaseReadyCta
          orderId={orderId}
          nextHref={nextHref}
          ctaLabel={nextCtaLabel(nextHref)}
          secondaryHref={
            isKitaplikNext ? "https://kitaplik.thorius.com.tr/" : "/kurslar"
          }
          secondaryLabel={
            isKitaplikNext ? "Kitaplığa Dön" : "Diğer Kurslara Bak"
          }
          isExternalNext={isExternalNext}
        />

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
