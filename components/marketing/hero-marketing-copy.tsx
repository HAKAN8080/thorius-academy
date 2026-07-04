import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CAREER_PATH_LINKS = [
  {
    href: "/kariyer-yolu/retail-planning",
    label: "Retail Planning",
  },
  {
    href: "/kariyer-yolu/insan-kaynaklari",
    label: "İnsan Kaynakları",
  },
  {
    href: "/kariyer-yolu/yapay-zeka",
    label: "Yapay Zeka",
  },
] as const;

const PATH_STEPS = [
  "Bir kariyer yolu seçin — her yol sıralı kurslardan oluşur.",
  "Adım adım ilerleyin — her adım gerçek bir Thorius kursu.",
  "Kursu bitirin — sonraki adım otomatik açılır.",
] as const;

export function HeroMarketingCopy() {
  return (
    <div className="order-2 flex flex-col gap-5 sm:gap-6 xl:order-1">
      <Image
        src="/images/thorius-academy-logo.png"
        alt="Thorius Academy Logo"
        width={140}
        height={56}
        className="h-12 w-auto object-contain sm:h-14"
        priority
      />

      <div className="space-y-4">
        <h1
          id="hero-heading"
          className="text-2xl font-bold text-white sm:text-3xl md:text-4xl"
        >
          Kurs değil,{" "}
          <span className="text-accent-300">kariyer sonucu</span> satın alırsınız
        </h1>

        <p className="max-w-xl text-base text-primary-100/90 sm:text-lg">
          Video izlemek değil — iş yapabilir hale gelmek.
        </p>

        <ol className="max-w-xl space-y-2.5">
          {PATH_STEPS.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-snug text-primary-100 sm:text-base">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500/20 text-xs font-bold text-accent-300"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-2 pt-1">
          {CAREER_PATH_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-primary-50 transition-colors hover:border-accent-500/50 hover:bg-accent-500/10"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
        <Button
          size="lg"
          className="w-full rounded-xl bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600 sm:w-auto"
          asChild
        >
          <Link href="/kariyer-yolu">
            Kariyer yollarını gör
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full rounded-xl border-2 border-white/80 bg-transparent text-white hover:bg-white hover:text-primary-950 sm:w-auto"
          asChild
        >
          <Link href="/kurslar">Tüm kurslar</Link>
        </Button>
      </div>
    </div>
  );
}
