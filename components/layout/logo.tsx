import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoVariant = "full" | "compact" | "icon";

interface LogoProps {
  className?: string;
  variant?: LogoVariant;
}

const variantHeights: Record<LogoVariant, string> = {
  full: "h-14 w-auto sm:h-16",
  compact: "h-10 w-auto sm:h-11",
  icon: "h-8 w-8",
};

export function Logo({
  className,
  variant = "compact",
}: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-3", className)}
      aria-label="Thorius ana sayfa"
    >
      <Image
        src="/images/thorius-logo.png"
        alt="Thorius"
        width={120}
        height={120}
        className={cn("shrink-0 object-contain", variantHeights[variant])}
        priority={variant !== "icon"}
      />
    </Link>
  );
}
