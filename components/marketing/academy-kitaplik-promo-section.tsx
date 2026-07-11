import { getTranslations } from "next-intl/server";
import { Check, ExternalLink } from "lucide-react";
import { AcademyKitaplikBookStack } from "@/components/marketing/academy-kitaplik-book-stack";
import { Container } from "@/components/layout/container";
import { getKitaplikPromoBooksFromCache } from "@/lib/kitaplik/academy-promo-books";
import { kitaplikPath } from "@/lib/site/site-mode";

export async function AcademyKitaplikPromoSection() {
  const t = await getTranslations("home.kitaplikPromo");
  const books = await getKitaplikPromoBooksFromCache();

  if (books.length === 0) {
    return null;
  }

  const features = t.raw("features") as string[];
  const kitaplikUrl = kitaplikPath("/");

  return (
    <section
      id="kitaplar"
      className="border-y border-primary-100 bg-gradient-to-b from-white via-primary-50/40 to-white py-14 md:py-16"
      aria-labelledby="kitaplik-promo-heading"
    >
      <Container size="wide">
        <a
          href={kitaplikUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-3xl border border-primary-200 bg-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          aria-label={t("linkAria")}
        >
          <div className="grid min-h-[20rem] grid-cols-1 items-center gap-8 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:p-10">
            <div className="order-2 flex items-center justify-center bg-gradient-to-br from-primary-100/80 via-white to-accent-50/50 py-4 lg:order-1 lg:py-8">
              <AcademyKitaplikBookStack
                books={books}
                coverAlt={(title) => t("coverAlt", { title })}
                stackLabel={t("stackLabel")}
              />
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-700">
                {t("eyebrow")}
              </p>
              <h2
                id="kitaplik-promo-heading"
                className="mt-3 text-3xl font-bold text-primary-950 sm:text-4xl"
              >
                {t("title")}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-700 sm:text-lg">
                {t("body")}
              </p>

              <ul className="mt-6 space-y-3" aria-label={t("featuresAria")}>
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-primary-800"
                  >
                    <Check
                      className="mt-0.5 h-5 w-5 shrink-0 text-accent-600"
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <span className="inline-flex items-center gap-2 rounded-xl bg-primary-950 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors group-hover:bg-primary-900">
                  {t("cta")}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </div>
          </div>
        </a>
      </Container>
    </section>
  );
}
