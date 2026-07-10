import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { defaultLocale, prefixWithLocale } from "@/lib/i18n/locale";
import {
  academyPath,
  isCompanySiteHost,
  kitaplikPath,
  resolveAcademyHref,
} from "@/lib/site/site-mode";

export async function MarketingHeader() {
  const t = await getTranslations("nav");
  const host = headers().get("host");
  const isCompany = isCompanySiteHost(host);

  const baseNavLinks = [
    { href: "/kurslar", label: t("academy") },
    { href: "/kariyer-yolu", label: t("careerPath") },
    { href: kitaplikPath("/"), label: t("library"), external: true },
    { href: "/magaza", label: t("shop") },
    { href: "/#ecosystem", label: t("coaching") },
    { href: "/kurumsal", label: t("corporate") },
    { href: "/hakkimizda", label: t("about") },
    { href: "/sss", label: t("faq") },
    { href: "/blog", label: t("blog") },
  ] as const;

  const navLinks = baseNavLinks.map((link) => ({
    href:
      "external" in link && link.external
        ? link.href
        : resolveAcademyHref(link.href, isCompany),
    label: link.label,
    external: "external" in link && link.external,
  }));

  const authUrls = isCompany
    ? {
        loginHref: academyPath(prefixWithLocale("/giris", defaultLocale)),
        registerHref: academyPath(prefixWithLocale("/kayit", defaultLocale)),
        panelHref: academyPath("/panel"),
      }
    : undefined;

  return (
    <Header
      navLinks={navLinks}
      authUrls={authUrls}
      localized={!isCompany}
      showLocaleSwitcher={!isCompany}
    />
  );
}
