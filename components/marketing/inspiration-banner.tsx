import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

interface InspirationBannerProps {
  compact?: boolean;
}

export async function InspirationBanner({
  compact = false,
}: InspirationBannerProps) {
  const t = await getTranslations("home.inspiration");

  return (
    <section
      className="border-y border-primary-100 bg-primary-950 py-10 md:py-14"
      aria-label={t("ariaLabel")}
    >
      <Container size="wide" className="flex justify-center">
        <figure
          className={cn(
            "overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10",
            compact ? "w-full max-w-xl sm:max-w-2xl" : "w-full",
          )}
        >
          <Image
            src="/images/ataturk-ilim-fen.png"
            alt={t("imageAlt")}
            width={1600}
            height={900}
            className="h-auto w-full object-cover"
            sizes="(max-width: 1280px) 100vw, 1200px"
            priority={false}
          />
        </figure>
      </Container>
    </section>
  );
}
