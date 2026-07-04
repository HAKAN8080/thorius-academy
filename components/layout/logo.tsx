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
  compact: "h-9 w-auto sm:h-10",
  icon: "h-8 w-auto",
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
        src="/images/thorius-academy-logo.png"
        alt="Thorius Academy Logo"
        width={160}
        height={64}
        className={cn("shrink-0 object-contain", variantHeights[variant])}
        priority={variant !== "icon"}
      />
    </Link>
  );
}
