import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseBuilderSectionProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function CourseBuilderSection({
  title,
  description,
  icon: Icon,
  children,
  className,
}: CourseBuilderSectionProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex items-start gap-3 border-b border-primary-50 bg-gradient-to-r from-[#f8fafc] to-white px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B1E3F] text-[#D4AF37]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#0B1E3F]">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-sm text-primary-500">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

interface SeoPreviewProps {
  title: string;
  description: string;
  url: string;
}

export function CourseSeoPreview({ title, description, url }: SeoPreviewProps) {
  return (
    <div className="rounded-xl border border-primary-100 bg-[#fafbfd] p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-500">
        Google önizleme
      </p>
      <p className="truncate text-sm text-[#1a0dab]">{title || "SEO başlığı"}</p>
      <p className="truncate text-xs text-[#006621]">{url || "thorius.com.tr/kurslar/..."}</p>
      <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[#4d5156]">
        {description || "Meta açıklama burada görünür."}
      </p>
    </div>
  );
}
