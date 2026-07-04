import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RETAIL_PLANNING_PATH } from "@/lib/content/career-paths";

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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
          Mezunların kazanımları
        </p>
        <h1
          id="hero-heading"
          className="text-2xl font-bold text-white sm:text-3xl md:text-4xl"
        >
          Kurs değil,{" "}
          <span className="text-accent-300">kariyer sonucu</span> satın alırsınız
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-primary-100/90 sm:text-lg">
          Thorius Academy&apos;de amaç video izlemek değil; iş yapabilir hale
          gelmek.{" "}
          <Link
            href={`/kariyer-yolu/${RETAIL_PLANNING_PATH.slug}`}
            className="font-semibold text-accent-300 underline-offset-4 hover:text-accent-200 hover:underline"
          >
            {RETAIL_PLANNING_PATH.title}
          </Link>{" "}
          ve diğer kariyer yolları bu yetkinlikleri sırayla inşa eder — her adım
          gerçek bir kursa bağlıdır, bir sonraki adım tamamladıkça açılır.
        </p>

        <div className="flex flex-wrap gap-2">
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

        <ul className="grid gap-2 sm:grid-cols-2">
          {RETAIL_PLANNING_PATH.outcomes.map((outcome) => (
            <li
              key={outcome}
              className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
            >
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-accent-400"
                aria-hidden="true"
              />
              <span className="text-sm font-medium leading-snug text-primary-50">
                {outcome}
              </span>
            </li>
          ))}
        </ul>
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
