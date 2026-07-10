import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";

export async function InspirationBanner() {
  const t = await getTranslations("home.inspiration");

  return (
    <section
      className="border-y border-primary-100 bg-primary-950 py-10 md:py-14"
      aria-label={t("ariaLabel")}
    >
      <Container size="wide">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_1.05fr] lg:gap-12">
          <figure className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
            <Image
              src="/images/ataturk-classroom.png"
              alt={t("imageAlt")}
              width={1200}
              height={800}
              className="h-auto w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 48vw"
              priority={false}
            />
          </figure>

          <blockquote className="text-center lg:text-left">
            <p className="text-lg font-medium leading-relaxed text-primary-50 sm:text-xl md:text-2xl md:leading-relaxed">
              &ldquo;{t("quote")}&rdquo;
            </p>
            <footer className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-accent-400 sm:text-base">
              {t("attribution")}
            </footer>
          </blockquote>
        </div>
      </Container>
    </section>
  );
}
