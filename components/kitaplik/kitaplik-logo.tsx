import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type KitaplikLogoVariant = "full" | "compact";

interface KitaplikLogoProps {
  className?: string;
  variant?: KitaplikLogoVariant;
}

const variantHeights: Record<KitaplikLogoVariant, string> = {
  full: "h-20 w-auto sm:h-24",
  compact: "h-11 w-auto sm:h-12",
};

export function KitaplikLogo({
  className,
  variant = "compact",
}: KitaplikLogoProps) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-3", className)}
      aria-label="Thorius Yayinlari ana sayfa"
    >
      <Image
        src="/images/thorius-yayinlari-logo.png"
        alt="Thorius Yayinlari"
        width={1024}
        height={1024}
        className={cn("shrink-0 object-contain", variantHeights[variant])}
        priority
      />
    </Link>
  );
}
