import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { KitaplikLogo } from "@/components/kitaplik/kitaplik-logo";
import { Logo } from "@/components/layout/logo";
import { catalogSlugFromWordPressCategory } from "@/lib/course/category-slug";
import { buildKurslarUrl } from "@/lib/course/kurslar-url";
import {
  getSiteModeFromHost,
  isCompanySiteHost,
  kitaplikPath,
  resolveAcademyHref,
} from "@/lib/site/site-mode";
import { getFooterCategoriesFromCache } from "@/lib/course/footer-categories";

function FooterLink({
  href,
  label,
  localized,
}: {
  href: string;
  label: string;
  localized: boolean;
}) {
  const isExternal =
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:");

  if (isExternal) {
    return (
      <a
        href={href}
        className="text-sm text-primary-100 transition-colors hover:text-white"
        {...(href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {label}
      </a>
    );
  }

  if (localized) {
    return (
      <Link
        href={href as "/"}
        className="text-sm text-primary-100 transition-colors hover:text-white"
      >
        {label}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className="text-sm text-primary-100 transition-colors hover:text-white"
    >
      {label}
    </a>
  );
}

export async function Footer() {
  const t = await getTranslations("footer");
  const host = headers().get("host");
  const isCompany = isCompanySiteHost(host);
  const siteMode = getSiteModeFromHost(host);
  const localized = !isCompany;
  const resolveHref = (href: string) => resolveAcademyHref(href, isCompany);

  const categories = await getFooterCategoriesFromCache();
  const topCategories = categories
    .filter((category) => category.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const staticColumns = [
    {
      title: t("about"),
      links: [
        { href: "/hakkimizda", label: t("mission") },
        { href: "/hakkimizda#sirket-kunyesi", label: t("companyInfo") },
        { href: "/hakkimizda#belgelerimiz", label: t("documents") },
        { href: "/kariyer-yolu", label: t("careerPaths") },
        { href: kitaplikPath("/"), label: t("library") },
        { href: "/#ecosystem", label: t("coaching") },
        { href: "/blog", label: t("blog") },
      ],
    },
    {
      title: t("corporate"),
      links: [
        { href: "/kurumsal", label: t("corporateTraining") },
        { href: "/kurumsal#paketler", label: t("packages") },
        { href: "/kurumsal#iletisim", label: t("getQuote") },
      ],
    },
    {
      title: t("useful"),
      links: [
        { href: "/sss", label: t("faq") },
        { href: "/egitmen-destek-kilavuzu", label: t("instructorGuide") },
        { href: "/blog", label: t("blogPosts") },
      ],
    },
    {
      title: t("legal"),
      links: [
        { href: "/gizlilik", label: t("privacy") },
        { href: "/kvkk", label: t("kvkk") },
        { href: "/kullanim-kosullari", label: t("terms") },
        { href: "/iletisim", label: t("contact") },
      ],
    },
    {
      title: t("contact"),
      links: [
        { href: "mailto:info@thorius.com.tr", label: "info@thorius.com.tr" },
        {
          href: "https://wa.me/905431323503",
          label: "+90 543 132 35 03 (WhatsApp)",
        },
        { href: "/kurumsal#iletisim", label: t("location") },
      ],
    },
  ] as const;

  const courseColumn = {
    title: t("courses"),
    links: [
      { href: resolveHref("/kurslar"), label: t("allCourses") },
      ...topCategories.map((category) => ({
        href: resolveHref(
          buildKurslarUrl({
            categorySlug: catalogSlugFromWordPressCategory(category),
          }),
        ),
        label: category.name,
      })),
    ],
  };

  const resolvedStaticColumns = staticColumns.map((column) => ({
    ...column,
    links: column.links.map((link) => ({
      ...link,
      href: link.href.startsWith("http") ? link.href : resolveHref(link.href),
    })),
  }));

  const footerColumns = [
    resolvedStaticColumns[0],
    courseColumn,
    ...resolvedStaticColumns.slice(1),
  ];

  return (
    <footer className="bg-primary-900 text-white">
      <Container size="wide" className="py-12">
        <div className="mb-10 border-b border-primary-700 pb-10">
          {siteMode === "kitaplik" ? (
            <KitaplikLogo variant="full" />
          ) : (
            <Logo variant="full" localized={localized} />
          )}
        </div>

        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent-500">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <FooterLink
                      href={link.href}
                      label={link.label}
                      localized={localized && !link.href.startsWith("http")}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-700 pt-8 text-center text-xs text-primary-100 sm:flex-row sm:text-left">
          <p>{t("copyright")}</p>
          <div className="flex flex-wrap justify-center gap-4 sm:justify-end">
            {localized ? (
              <>
                <Link href="/kvkk" className="hover:text-accent-500">
                  {t("kvkk")}
                </Link>
                <Link href="/mesafeli-satis" className="hover:text-accent-500">
                  {t("distanceSales")}
                </Link>
              </>
            ) : (
              <>
                <a href={resolveHref("/kvkk")} className="hover:text-accent-500">
                  {t("kvkk")}
                </a>
                <a
                  href={resolveHref("/mesafeli-satis")}
                  className="hover:text-accent-500"
                >
                  {t("distanceSales")}
                </a>
              </>
            )}
          </div>
        </div>
      </Container>
    </footer>
  );
}
