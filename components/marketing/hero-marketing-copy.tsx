import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function HeroMarketingCopy() {
  return (
    <div className="order-2 flex flex-col gap-4 sm:gap-6 xl:order-1">
      <div className="flex flex-wrap items-center gap-3">
        <Image
          src="/images/thorius-academy-logo.png"
          alt="Thorius Academy Logo"
          width={140}
          height={56}
          className="h-12 w-auto object-contain sm:h-14"
          priority
        />
        <p className="inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1.5 text-xs font-medium text-accent-400 sm:px-4 sm:py-2 sm:text-sm">
          Perakende Planlama Uzmanlık Akademisi
        </p>
      </div>
      <h1
        id="hero-heading"
        className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
      >
        Perakende Planlama ve İK{" "}
        <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
          Online Eğitimleri
        </span>
      </h1>
      <p className="max-w-3xl text-base leading-relaxed text-primary-100 sm:text-lg md:text-xl lg:text-2xl">
        OTB, range plan, envanter ve AI destekli forecast — kariyer sonucuna odaklı
        online kurslar, dijital sertifika programları ve sektör deneyimli eğitmenlerle
        kariyer yolları
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
        <Button
          size="lg"
          className="w-full rounded-xl bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600 sm:w-auto"
          asChild
        >
          <Link href="/kariyer-yolu">Kariyer yollarını gör</Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full rounded-xl border-2 border-white/80 bg-transparent text-white hover:bg-white hover:text-primary-950 sm:w-auto"
          asChild
        >
          <Link href="/kurslar">Tüm kurslar</Link>
        </Button>
        <Button
          size="lg"
          variant="ghost"
          className="w-full rounded-xl text-primary-100 hover:bg-white/10 hover:text-white sm:w-auto"
          asChild
        >
          <Link href="/kayit">Üye ol — %20 indirim</Link>
        </Button>
      </div>
    </div>
  );
}
