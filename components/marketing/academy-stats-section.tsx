import { getTranslations } from "next-intl/server";
import { BookOpen, Clock, Globe2, Users } from "lucide-react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

const STATS = [
  { key: "countries", value: "28", icon: Globe2 },
  { key: "students", value: "500+", icon: Users },
  { key: "hours", value: "170+", icon: Clock },
  { key: "courses", value: "220+", icon: BookOpen },
] as const;

export async function AcademyStatsSection() {
  const t = await getTranslations("home.stats");

  return (
    <section
      aria-label={t("ariaLabel")}
      className="relative border-y border-accent-500/25 bg-gradient-to-r from-[#060b18] via-[#0B1E3F] to-[#060b18]"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)]"
        aria-hidden="true"
      />
      <Container size="wide" className="relative py-8 md:py-10">
        <ul className="grid grid-cols-2 gap-y-8 gap-x-4 md:grid-cols-4 md:gap-0">
          {STATS.map(({ key, value, icon: Icon }, index) => (
            <li
              key={key}
              className={cn(
                "flex flex-col items-center px-2 text-center md:px-6",
                index < STATS.length - 1 &&
                  "md:border-r md:border-white/10",
                index % 2 === 0 &&
                  "max-md:border-r max-md:border-white/10",
              )}
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-accent-500/30 bg-accent-500/10">
                <Icon
                  className="h-5 w-5 text-accent-400"
                  aria-hidden="true"
                />
              </div>
              <p className="text-3xl font-extrabold tracking-tight text-accent-400 sm:text-4xl">
                {value}
              </p>
              <p className="mt-1 text-sm font-medium text-primary-100/90 sm:text-base">
                {t(key)}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
