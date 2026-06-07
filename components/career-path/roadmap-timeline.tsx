import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Lock,
  PlayCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  CareerPathStepWithStatus,
  CareerPathWithProgress,
} from "@/lib/career-path/types";

const statusConfig = {
  completed: {
    label: "Tamamlandı",
    icon: CheckCircle2,
    dot: "bg-emerald-500 border-emerald-500",
    card: "border-emerald-200 bg-emerald-50/40",
    badge: "bg-emerald-100 text-emerald-800",
  },
  in_progress: {
    label: "Devam ediyor",
    icon: PlayCircle,
    dot: "bg-accent-500 border-accent-500",
    card: "border-accent-300 bg-accent-50/50",
    badge: "bg-accent-100 text-accent-900",
  },
  available: {
    label: "Sıradaki adım",
    icon: Circle,
    dot: "bg-white border-accent-500",
    card: "border-accent-200 bg-white shadow-sm",
    badge: "bg-primary-100 text-primary-900",
  },
  locked: {
    label: "Kilitli",
    icon: Lock,
    dot: "bg-primary-100 border-primary-200",
    card: "border-primary-100 bg-primary-50/30 opacity-80",
    badge: "bg-primary-100 text-primary-500",
  },
} as const;

interface RoadmapTimelineProps {
  path: CareerPathWithProgress;
  showHeader?: boolean;
}

export function RoadmapTimeline({ path, showHeader = true }: RoadmapTimelineProps) {
  return (
    <div>
      {showHeader && (
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent-700">
                {path.hero_eyebrow}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-primary-950">
                {path.title}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-950">
                %{path.progressPercent}
              </p>
              <p className="text-sm text-muted-foreground">
                {path.completedSteps}/{path.totalSteps} adım
              </p>
            </div>
          </div>

          <div
            className="h-3 overflow-hidden rounded-full bg-primary-100"
            role="progressbar"
            aria-valuenow={path.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Kariyer yolu ilerlemesi"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-600 transition-all"
              style={{ width: `${path.progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <ol className="relative space-y-0">
        {path.steps.map((step, index) => (
          <RoadmapStep
            key={step.id}
            step={step}
            isLast={index === path.steps.length - 1}
          />
        ))}
      </ol>
    </div>
  );
}

function RoadmapStep({
  step,
  isLast,
}: {
  step: CareerPathStepWithStatus;
  isLast: boolean;
}) {
  const config = statusConfig[step.status];
  const Icon = config.icon;

  return (
    <li className="relative flex gap-4 pb-8">
      {!isLast && (
        <span
          className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5 bg-primary-200"
          aria-hidden="true"
        />
      )}

      <div
        className={`relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${config.dot}`}
      >
        <Icon
          className={`h-4 w-4 ${
            step.status === "completed"
              ? "text-white"
              : step.status === "locked"
                ? "text-primary-400"
                : "text-accent-700"
          }`}
          aria-hidden="true"
        />
      </div>

      <article
        className={`min-w-0 flex-1 rounded-2xl border p-5 ${config.card}`}
      >
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary-600">
              {step.step_order}. {step.level}
            </p>
            <h3 className="mt-1 text-lg font-bold text-primary-950">
              {step.label}
            </h3>
          </div>
          <Badge className={config.badge}>{config.label}</Badge>
        </div>

        {step.description ? (
          <p className="mb-3 text-sm text-muted-foreground">{step.description}</p>
        ) : null}

        <p className="mb-4 text-sm font-medium text-primary-800">
          Kurs: {step.courseTitle}
        </p>

        {step.status === "in_progress" && (
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Kurs ilerlemesi</span>
              <span>%{step.progressPercent}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-primary-100">
              <div
                className="h-full rounded-full bg-accent-500"
                style={{ width: `${step.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {step.status !== "locked" ? (
          <Button asChild size="sm" className="rounded-xl">
            <Link href={`/panel/kurslarim/${step.course_slug}`}>
              {step.status === "completed"
                ? "Kursa tekrar git"
                : step.status === "in_progress"
                  ? "Derse devam et"
                  : "Kursa başla"}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <p className="text-sm text-primary-500">
            Önceki adımı tamamladığınızda bu adım açılır.
          </p>
        )}
      </article>
    </li>
  );
}
