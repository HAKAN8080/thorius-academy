import Image from "next/image";
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
      className={cn("group flex flex-col gap-1", className)}
      aria-label="Thorius ana sayfa"
    >
      <Image
        src="/images/thorius-logo.png"
        alt="Thorius"
        width={397}
        height={373}
        className="h-10 w-auto object-contain sm:h-11"
        priority
      />
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
