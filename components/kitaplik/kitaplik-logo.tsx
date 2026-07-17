import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type KitaplikLogoVariant = "full" | "compact";

interface KitaplikLogoProps {
  className?: string;
  variant?: KitaplikLogoVariant;
  showTagline?: boolean;
}

const variantHeights: Record<KitaplikLogoVariant, string> = {
  full: "h-20 w-auto sm:h-24",
  compact: "h-11 w-auto sm:h-12",
};

export function KitaplikLogo({
  className,
  variant = "compact",
  showTagline = false,
}: KitaplikLogoProps) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-3", className)}
      aria-label="Thorius Yayınları ana sayfa"
    >
      <Image
        src="/images/thorius-yayinlari-logo.png"
        alt="Thorius Yayınları"
        width={1024}
        height={1024}
        className={cn("shrink-0 object-contain", variantHeights[variant])}
        priority
      />
      {showTagline ? (
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="truncate text-sm font-semibold text-primary-950">
            Thorius Kitaplığı
          </span>
          <span className="truncate text-xs font-medium tracking-wide text-accent-700">
            Konuşan Kitaplar
          </span>
        </span>
      ) : null}
    </Link>
  );
}
