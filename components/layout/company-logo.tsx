import Link from "next/link";
import { cn } from "@/lib/utils";
import { COMPANY_BRAND_LINE } from "@/lib/content/company-model";

interface CompanyLogoProps {
  className?: string;
  inverted?: boolean;
  showTagline?: boolean;
}

export function CompanyLogo({
  className,
  inverted = false,
  showTagline = true,
}: CompanyLogoProps) {
  return (
    <Link
      href="/"
      className={cn("group flex flex-col gap-0.5", className)}
      aria-label="Thorius ana sayfa"
    >
      <span
        className={cn(
          "text-xl font-bold tracking-tight sm:text-2xl",
          inverted ? "text-white" : "text-primary-950",
        )}
      >
        Thorius
      </span>
      {showTagline && (
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-[0.18em] sm:text-[11px]",
            inverted ? "text-primary-300" : "text-primary-500",
          )}
        >
          {COMPANY_BRAND_LINE}
        </span>
      )}
    </Link>
  );
}
