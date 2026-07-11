import { getTranslations } from "next-intl/server";
import { Check, ExternalLink } from "lucide-react";
import { AcademyKitaplikBookStack } from "@/components/marketing/academy-kitaplik-book-stack";
import { getKitaplikPromoBooksFromCache } from "@/lib/kitaplik/academy-promo-books";
import { kitaplikPath } from "@/lib/site/site-mode";

export async function AcademyKitaplikHeroBanner() {
  const t = await getTranslations("home.kitaplikPromo");
  const books = await getKitaplikPromoBooksFromCache();

  if (books.length === 0) {
    return null;
  }

  const features = t.raw("features") as string[];
  const kitaplikUrl = kitaplikPath("/");

  return (
    <aside
      id="kitaplar"
      aria-labelledby="kitaplik-hero-banner-heading"
      className="relative z-20 mt-5 sm:mt-6"
    >
      <div className="relative rotate-[-0.5deg] overflow-hidden rounded-2xl border border-white/25 bg-white shadow-[0_22px_55px_-18px_rgba(0,0,0,0.55)] ring-1 ring-black/5 transition duration-300 hover:rotate-0 hover:shadow-[0_28px_60px_-16px_rgba(0,0,0,0.6)]">
        <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-accent-400/20 blur-2xl" aria-hidden="true" />

        <div className="relative grid grid-cols-1 items-center gap-3 p-3 sm:grid-cols-[7.5rem_1fr] sm:gap-4 sm:p-4">
          <div className="flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50/60 py-2 sm:rounded-xl sm:py-3">
            <AcademyKitaplikBookStack
              books={books}
              variant="compact"
              maxBooks={4}
              bookLinkAria={(title) => t("bookLinkAria", { title })}
              bookHref={(slug) => kitaplikPath(`/kitap/${slug}`)}
              stackLabel={t("stackLabel")}
            />
          </div>

          <div className="min-w-0 px-1 pb-1 sm:px-0 sm:pb-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-700 sm:text-xs">
              {t("eyebrow")}
            </p>
            <h2
              id="kitaplik-hero-banner-heading"
              className="mt-1 text-lg font-bold text-primary-950 sm:text-xl"
            >
              {t("title")}
            </h2>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-primary-700 sm:text-sm">
              {t("body")}
            </p>

            <ul
              className="mt-2.5 space-y-1"
              aria-label={t("featuresAria")}
            >
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-1.5 text-[11px] text-primary-800 sm:text-xs"
                >
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-600"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href={kitaplikUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("linkAria")}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-950 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 sm:text-sm"
            >
              {t("cta")}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
