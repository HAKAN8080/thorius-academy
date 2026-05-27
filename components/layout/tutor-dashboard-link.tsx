import { ExternalLink, UserCircle, Wallet } from "lucide-react";
import { getTutorDashboardUrl } from "@/lib/config/portal-urls";
import { cn } from "@/lib/utils";

interface TutorDashboardLinkProps {
  variant: "instructor" | "student";
  className?: string;
  compact?: boolean;
}

const copy = {
  instructor: {
    title: "Tutor Eğitmen Paneli",
    description:
      "Kazançlar, ödemeler, çekim talepleri ve kurs yönetimi thorius.com.tr üzerinde tutulur.",
    cta: "Kazançlar & Ödemeler",
    icon: Wallet,
  },
  student: {
    title: "Tutor Öğrenci Paneli",
    description:
      "Profil bilgileriniz, sipariş geçmişi ve hesap ayarlarına üst menüden erişebilirsiniz.",
    cta: "Hesabım & Profil",
    icon: UserCircle,
  },
} as const;

export function TutorDashboardLink({
  variant,
  className,
  compact = false,
}: TutorDashboardLinkProps) {
  const content = copy[variant];
  const Icon = content.icon;

  if (compact) {
    return (
      <a
        href={getTutorDashboardUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-accent-600",
          className,
        )}
      >
        {content.cta}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    );
  }

  return (
    <a
      href={getTutorDashboardUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex flex-col gap-3 rounded-2xl border border-primary-100 bg-white p-5 transition-all hover:border-accent-500/40 hover:shadow-md sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-accent-500/10 p-3">
          <Icon className="h-6 w-6 text-accent-600" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-primary-950">
            {content.title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {content.description}
          </p>
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-primary-900">
        {content.cta}
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </span>
    </a>
  );
}
