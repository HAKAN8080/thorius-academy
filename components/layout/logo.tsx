import Image from "next/image";
import Link from "next/link";
import { Link as LocaleLink } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type LogoVariant = "full" | "compact" | "icon";

interface LogoProps {
  className?: string;
  variant?: LogoVariant;
  localized?: boolean;
}

const variantHeights: Record<LogoVariant, string> = {
  full: "h-14 w-auto sm:h-16",
  compact: "h-10 w-auto sm:h-11",
  icon: "h-8 w-8",
};

export function Logo({
  className,
  variant = "compact",
  localized = false,
}: LogoProps) {
  const content = (
    <Image
      src="/images/thorius-logo.png"
      alt="Thorius"
      width={1024}
      height={1024}
      className={cn("shrink-0 object-contain", variantHeights[variant])}
      priority={variant !== "icon"}
    />
  );

  if (localized) {
    return (
      <LocaleLink
        href="/"
        className={cn("group flex items-center gap-3", className)}
        aria-label="Thorius ana sayfa"
      >
        {content}
      </LocaleLink>
    );
  }

  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-3", className)}
      aria-label="Thorius ana sayfa"
    >
      {content}
    </Link>
  );
}
