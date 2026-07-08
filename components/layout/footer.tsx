import Link from "next/link";
import { headers } from "next/headers";
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

const staticColumns = [
  {
    title: "Hakkımızda",
    links: [
      { href: "/hakkimizda", label: "Misyonumuz" },
      { href: "/kariyer-yolu", label: "Kariyer Yolları" },
      // Shop subdomain canlıya alınınca shopPath("/") olarak güncellenecek
      { href: kitaplikPath("/"), label: "Kitaplık" },
      { href: "/#ecosystem", label: "Koçluk" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Kurumsal",
    links: [
      { href: "/kurumsal", label: "Kurumsal Eğitim" },
      { href: "/kurumsal#paketler", label: "Paketler" },
      { href: "/kurumsal#iletisim", label: "Teklif Alın" },
    ],
  },
  {
    title: "Yararlı Bilgiler",
    links: [
      {
        href: "/egitmen-destek-kilavuzu",
        label: "Eğitmen Destek Kılavuzu",
      },
      { href: "/blog", label: "Blog Yazıları" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { href: "/gizlilik", label: "Gizlilik Politikası" },
      { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
      { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
      { href: "/iletisim", label: "İletişim" },
    ],
  },
  {
    title: "İletişim",
    links: [
      { href: "mailto:info@thorius.com.tr", label: "info@thorius.com.tr" },
      {
        href: "https://wa.me/905431323503",
        label: "+90 543 132 35 03 (WhatsApp)",
      },
      { href: "/kurumsal#iletisim", label: "İstanbul, Türkiye" },
    ],
  },
] as const;

function FooterLink({ href, label }: { href: string; label: string }) {
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

  return (
    <Link
      href={href}
      className="text-sm text-primary-100 transition-colors hover:text-white"
    >
      {label}
    </Link>
  );
}

export async function Footer() {
  const host = headers().get("host");
  const isCompany = isCompanySiteHost(host);
  const siteMode = getSiteModeFromHost(host);
  const resolveHref = (href: string) => resolveAcademyHref(href, isCompany);

  const categories = await getFooterCategoriesFromCache();
  const topCategories = categories
    .filter((category) => category.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const courseColumn = {
    title: "Kurslar",
    links: [
      { href: resolveHref("/kurslar"), label: "Tüm Kurslar" },
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
            <Logo variant="full" />
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
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-700 pt-8 text-center text-xs text-primary-100 sm:flex-row sm:text-left">
          <p>© 2026 Thorius Eğitim ve Danışmanlık Ltd. Şti.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:justify-end">
            <Link href="/kvkk" className="hover:text-accent-500">
              KVKK
            </Link>
            <Link href="/mesafeli-satis" className="hover:text-accent-500">
              Mesafeli Satış Sözleşmesi
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
