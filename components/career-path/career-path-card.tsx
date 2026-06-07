import Link from "next/link";
import { ArrowRight, Map } from "lucide-react";
import type { CareerPathWithProgress } from "@/lib/career-path/types";

interface CareerPathCardProps {
  path: CareerPathWithProgress;
}

export function CareerPathCard({ path }: CareerPathCardProps) {
  const nextStep = path.steps.find(
    (step) => step.status === "available" || step.status === "in_progress",
  );

  return (
    <Link
      href={`/panel/kariyer-yolu/${path.slug}`}
      className="group block rounded-2xl border-2 border-primary-100 bg-white p-6 transition-all hover:border-accent-500 hover:shadow-xl"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="rounded-lg bg-accent-500/10 p-3">
          <Map className="h-6 w-6 text-accent-600" aria-hidden="true" />
        </div>
        <ArrowRight
          className="h-5 w-5 text-primary-400 transition-all group-hover:translate-x-1 group-hover:text-accent-600"
          aria-hidden="true"
        />
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-accent-700">
        {path.hero_eyebrow}
      </p>
      <h3 className="mt-1 text-xl font-bold text-primary-950">{path.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        {path.subtitle}
      </p>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-primary-800">İlerleme</span>
          <span className="font-bold text-primary-950">
            {path.completedSteps}/{path.totalSteps} adım
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-primary-100">
          <div
            className="h-full rounded-full bg-accent-500 transition-all"
            style={{ width: `${path.progressPercent}%` }}
          />
        </div>
      </div>

      {nextStep ? (
        <p className="mt-4 text-sm text-primary-700">
          Sıradaki: <span className="font-semibold">{nextStep.label}</span>
        </p>
      ) : path.completedSteps === path.totalSteps && path.totalSteps > 0 ? (
        <p className="mt-4 text-sm font-semibold text-emerald-700">
          Tüm adımlar tamamlandı
        </p>
      ) : null}
    </Link>
  );
}
