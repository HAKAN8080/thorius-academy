import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CareerPathNeonCardProps {
  href: string;
  title: string;
  description: string;
  highlight: string;
  icon: LucideIcon;
}

export function CareerPathNeonCard({
  href,
  title,
  description,
  highlight,
  icon: Icon,
}: CareerPathNeonCardProps) {
  return (
    <div className="career-path-neon-ring rounded-2xl p-[2px]">
      <article className="flex h-full flex-col rounded-[14px] border border-white/5 bg-primary-950/85 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <div className="mb-4 inline-flex rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
          <Icon className="h-7 w-7 text-accent-400" aria-hidden="true" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-accent-300">
          {highlight}
        </p>
        <h2 className="mt-2 text-xl font-bold text-white">{title}</h2>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-primary-100/90">
          {description}
        </p>
        <Button
          asChild
          className="mt-6 w-full rounded-xl bg-white/10 font-semibold text-white ring-1 ring-white/20 hover:bg-white/20"
        >
          <Link href={href}>
            Yolu incele
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </article>
    </div>
  );
}
