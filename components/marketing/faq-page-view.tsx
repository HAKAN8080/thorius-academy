import { getTranslations } from "next-intl/server";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FaqCategory } from "@/lib/content/faq";
import { cn } from "@/lib/utils";

export async function FaqPageView() {
  const t = await getTranslations("faq");
  const categories = t.raw("categories") as FaqCategory[];
  const linkLabels = t.raw("links") as Record<string, string>;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 py-16 text-white md:py-20">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[min(100%,40rem)] -translate-x-1/2 rounded-full bg-accent-500/15 blur-3xl"
          aria-hidden="true"
        />
        <Container className="relative text-center">
          <Badge
            variant="outline"
            className="mb-4 border-accent-500/40 bg-accent-500/10 text-accent-400"
          >
            {t("hero.badge")}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            {t("hero.subtitle")}
          </p>
        </Container>
      </section>

      <section className="border-b border-primary-100 bg-primary-50/60 py-6">
        <Container>
          <nav aria-label={t("categoryNav")}>
            <ol className="flex flex-wrap justify-center gap-2 md:gap-3">
              {categories.map((category) => (
                <li key={category.id}>
                  <a
                    href={`#${category.id}`}
                    className="inline-flex rounded-full border border-primary-200 bg-white px-4 py-2 text-sm font-medium text-primary-800 shadow-sm transition-colors hover:border-accent-500/40 hover:text-primary-900"
                  >
                    {category.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="narrow" className="space-y-14">
          {categories.map((category) => (
            <div key={category.id} id={category.id} className="scroll-mt-28">
              <h2 className="mb-5 text-2xl font-bold text-primary-950">
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <details
                    key={item.id}
                    id={item.id}
                    className="group rounded-2xl border border-primary-100 bg-white shadow-sm open:border-accent-500/30 open:shadow-md"
                  >
                    <summary
                      className={cn(
                        "flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-primary-950",
                        "[&::-webkit-details-marker]:hidden",
                      )}
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className="h-5 w-5 shrink-0 text-primary-400 transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="border-t border-primary-100 px-5 py-4 text-primary-700 leading-relaxed">
                      <FaqAnswer text={item.answer} linkLabels={linkLabels} />
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>

      <section className="border-t border-primary-100 bg-gradient-to-br from-primary-50 to-accent-50 py-12 md:py-16">
        <Container size="narrow" className="text-center">
          <MessageCircle
            className="mx-auto mb-4 h-10 w-10 text-accent-600"
            aria-hidden="true"
          />
          <h2 className="text-2xl font-bold text-primary-950">
            {t("cta.title")}
          </h2>
          <p className="mt-3 text-primary-700">{t("cta.subtitle")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="gold" size="lg" className="rounded-xl" asChild>
              <Link href="/iletisim">{t("cta.contact")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-2"
              asChild
            >
              <a
                href="https://wa.me/905431323503"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("cta.whatsapp")}
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-2"
              asChild
            >
              <Link href="/kurumsal#iletisim">{t("cta.corporate")}</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

function FaqAnswer({
  text,
  linkLabels,
}: {
  text: string;
  linkLabels: Record<string, string>;
}) {
  const parts = text.split(/(\/[a-z0-9#-]+)/gi);

  return (
    <p>
      {parts.map((part, index) => {
        const label = linkLabels[part];
        if (label) {
          return (
            <Link
              key={`${part}-${index}`}
              href={part as "/"}
              className="font-medium text-accent-700 underline-offset-2 hover:underline"
            >
              {label}
            </Link>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
}
