import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoVariant = "full" | "compact" | "icon";

interface LogoProps {
  className?: string;
  variant?: LogoVariant;
  showTagline?: boolean;
  inverted?: boolean;
}

const variantStyles: Record<LogoVariant, { image: string; text: string }> = {
  full: { image: "h-12 w-12 sm:h-14 sm:w-14", text: "text-base sm:text-lg" },
  compact: { image: "h-9 w-9", text: "text-sm sm:text-base" },
  icon: { image: "h-8 w-8", text: "sr-only" },
};

export function Logo({
  className,
  variant = "compact",
  showTagline = false,
  inverted = false,
}: LogoProps) {
  const styles = variantStyles[variant];

  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label="Thorius AI Academy ana sayfa"
    >
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full ring-2 ring-accent-500/30 transition-all group-hover:ring-accent-500/60",
          styles.image,
        )}
      >
        <Image
          src="/images/bilge-baykus.png"
          alt=""
          fill
          className="object-cover object-top"
          sizes="56px"
          priority={variant !== "icon"}
        />
      </span>
      {variant !== "icon" && (
        <span className="flex flex-col leading-tight">
          <span
            className={cn(
              "font-bold tracking-tight",
              inverted ? "text-white" : "text-primary-900",
              styles.text,
            )}
          >
            THORIUS{" "}
            <span className={inverted ? "text-accent-400" : "text-accent-600"}>
              AI
            </span>{" "}
            ACADEMY
          </span>
          {showTagline && (
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-wider sm:text-xs",
                inverted ? "text-primary-200" : "text-primary-500",
              )}
            >
              Premium İş Akademisi
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
