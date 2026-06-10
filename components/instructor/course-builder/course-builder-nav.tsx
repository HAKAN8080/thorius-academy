import Link from "next/link";
import type { CourseBuilderStep } from "@/types/instructor-course";

const steps: { id: CourseBuilderStep; label: string; suffix: string }[] = [
  { id: "basics", label: "Temel Bilgiler", suffix: "basics" },
  { id: "curriculum", label: "Müfredat", suffix: "curriculum" },
  { id: "additional", label: "Ek Bilgiler", suffix: "additional" },
];

interface CourseBuilderNavProps {
  courseId: string;
  current: CourseBuilderStep;
}

export function CourseBuilderNav({ courseId, current }: CourseBuilderNavProps) {
  return (
    <nav className="grid gap-2 rounded-2xl border border-primary-100 bg-white p-2 shadow-sm sm:grid-cols-3">
      {steps.map((step, index) => {
        const active = step.id === current;
        return (
          <Link
            key={step.id}
            href={`/instructor/courses/${courseId}/${step.suffix}`}
            className={`rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${
              active
                ? "bg-[#0B1E3F] text-[#D4AF37] shadow-sm"
                : "text-[#0B1E3F] hover:bg-primary-50"
            }`}
          >
            <span className="mr-1 text-xs opacity-70">{index + 1}.</span>
            {step.label}
          </Link>
        );
      })}
    </nav>
  );
}

interface StepNavButtonsProps {
  previousHref?: string;
  nextHref?: string;
  nextLabel?: string;
  showUpdate?: boolean;
  onUpdate?: () => void;
  isPending?: boolean;
}

export function StepNavButtons({
  previousHref,
  nextHref,
  nextLabel = "İleri →",
  showUpdate,
  onUpdate,
  isPending,
}: StepNavButtonsProps) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-primary-100 pt-6">
      {previousHref ? (
        <Link
          href={previousHref}
          className="rounded-lg border border-[#0B1E3F]/20 px-4 py-2 text-sm font-medium text-[#0B1E3F] hover:border-[#D4AF37]"
        >
          ← Geri
        </Link>
      ) : (
        <span />
      )}

      <div className="flex gap-3">
        {showUpdate ? (
          <button
            type="button"
            disabled={isPending}
            onClick={onUpdate}
            className="rounded-lg bg-[#0B1E3F] px-5 py-2 text-sm font-semibold text-[#D4AF37] hover:bg-[#0B1E3F]/90 disabled:opacity-60"
          >
            Güncelle
          </button>
        ) : null}
        {nextHref ? (
          <Link
            href={nextHref}
            className="rounded-lg bg-[#D4AF37] px-5 py-2 text-sm font-semibold text-[#0B1E3F] hover:bg-[#D4AF37]/90"
          >
            {nextLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
