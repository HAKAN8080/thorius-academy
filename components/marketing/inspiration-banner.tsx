import Image from "next/image";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

interface InspirationBannerProps {
  compact?: boolean;
}

export function InspirationBanner({ compact = false }: InspirationBannerProps) {
  return (
    <section
      className="border-y border-primary-100 bg-primary-950 py-10 md:py-14"
      aria-label="Atatürk'ün ilim ve fen sözü"
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
            alt="Hayatta en hakiki mürşit ilimdir, fen'dir — Mustafa Kemal Atatürk"
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
