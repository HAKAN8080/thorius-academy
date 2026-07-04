import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Mağaza — Çok Yakında",
  description:
    "Thorius Mağaza hazırlanıyor. Perakende, planlama ve liderlik alanlarında seçilmiş kitaplar çok yakında satışta.",
};

const SHELF_BOOKS = [
  { height: 72, color: "#142850", delay: 0 },
  { height: 88, color: "#1e3a6f", delay: 0.4 },
  { height: 64, color: "#d4af37", delay: 0.8, gold: true },
  { height: 94, color: "#0f2347", delay: 1.2 },
  { height: 78, color: "#5c7cab", delay: 1.6 },
  { height: 84, color: "#183160", delay: 2.0 },
  { height: 58, color: "#e4c55a", delay: 2.4, gold: true },
] as const;

export default function ShopComingSoonPage() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#060b18] via-primary-950 to-[#0a1228] py-20 text-white md:py-28">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-primary-500/25 blur-3xl" />
      </div>

      <Container size="wide" className="relative z-10">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/40 bg-accent-500/10 px-4 py-1.5 text-sm font-semibold text-accent-300">
            <span
              className="shop-soon-pulse h-2 w-2 rounded-full bg-accent-400"
              aria-hidden="true"
            />
            Yapım aşamasında
          </span>

          <h1 className="mt-6 text-balance text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Thorius Mağaza{" "}
            <span className="bg-gradient-to-r from-accent-300 via-amber-200 to-accent-400 bg-clip-text text-transparent">
              rafları diziliyor
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-base text-primary-100/90 sm:text-lg">
            Perakende, planlama ve liderlik alanlarında seçilmiş uzmanlık
            kitapları çok yakında kapınıza kadar. Güvenli ödeme, hızlı kargo.
          </p>

          {/* Raf animasyonu — kitaplar sırayla yerine oturur */}
          <div
            className="mt-12 flex h-28 items-end gap-2 sm:gap-2.5"
            aria-hidden="true"
          >
            {SHELF_BOOKS.map((book, index) => (
              <span
                key={index}
                className="shop-soon-book w-6 rounded-t-sm sm:w-7"
                style={{
                  height: book.height,
                  backgroundColor: book.color,
                  animationDelay: `${book.delay}s`,
                  boxShadow: "gold" in book && book.gold
                    ? "0 0 14px rgba(212, 175, 55, 0.45)"
                    : "inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </div>
          <div
            className="h-1.5 w-64 rounded-full bg-white/10 sm:w-72"
            aria-hidden="true"
          >
            <div className="shop-soon-shimmer h-full w-full rounded-full" />
          </div>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button
              size="lg"
              className="rounded-xl bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
              asChild
            >
              <Link href="/kurslar">
                <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
                Bu arada kurslara göz atın
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-2 border-white/80 bg-transparent text-white hover:bg-white hover:text-primary-950"
              asChild
            >
              <Link href="/kariyer-yolu">
                Kariyer yolları
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
