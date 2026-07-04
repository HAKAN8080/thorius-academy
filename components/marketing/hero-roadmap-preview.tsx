import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RETAIL_PLANNING_PATH } from "@/lib/content/career-paths";

const PREVIEW_STEPS = RETAIL_PLANNING_PATH.steps.slice(0, 5);

export function HeroRoadmapPreview() {
  return (
    <article
      className="career-path-neon-ring rounded-2xl p-[2px]"
      aria-labelledby="hero-roadmap-heading"
    >
      <div className="rounded-[14px] border border-white/5 bg-primary-950/90 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent-300">
              OTB · Range Plan · Forecast
            </p>
            <h2
              id="hero-roadmap-heading"
              className="mt-1 text-lg font-bold text-white sm:text-xl"
            >
              Retail Planning yolu
            </h2>
            <p className="mt-1 text-sm text-primary-100/80">
              {PREVIEW_STEPS.length} adım · sıralı öğrenme
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-accent-500/15 px-2.5 py-1 text-xs font-semibold text-accent-300 ring-1 ring-accent-500/30">
            {PREVIEW_STEPS.length} kurs
          </span>
        </div>

        <ol className="relative space-y-0">
          {PREVIEW_STEPS.map((step, index) => (
            <li key={step.slug} className="relative flex gap-3 pb-4 last:pb-0">
              {index < PREVIEW_STEPS.length - 1 ? (
                <span
                  className="absolute left-[11px] top-6 h-[calc(100%-8px)] w-px bg-gradient-to-b from-accent-500/50 to-white/10"
                  aria-hidden="true"
                />
              ) : null}
              <span
                className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-primary-950"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent-400/90">
                  {step.level}
                </p>
                <p className="text-sm font-semibold leading-snug text-white">
                  {step.label}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <Button
          asChild
          className="mt-5 w-full rounded-xl bg-white/10 font-semibold text-white ring-1 ring-white/20 hover:bg-white/20"
        >
          <Link href={`/kariyer-yolu/${RETAIL_PLANNING_PATH.slug}`}>
            Yolu incele
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
