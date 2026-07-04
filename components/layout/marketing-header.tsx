import { headers } from "next/headers";
import { Header } from "@/components/layout/header";
import {
  academyPath,
  isCompanySiteHost,
  resolveAcademyHref,
} from "@/lib/site/site-mode";

const baseNavLinks = [
  { href: "/kurslar", label: "Academy" },
  { href: "/kariyer-yolu", label: "Kariyer Yolu" },
  // Shop subdomain canlıya alınınca shopPath("/") olarak güncellenecek
  { href: "/magaza", label: "Mağaza" },
  { href: "/#ecosystem", label: "Koçluk" },
  { href: "/kurumsal", label: "Kurumsal" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/blog", label: "Blog" },
] as const;

export function MarketingHeader() {
  const host = headers().get("host");
  const isCompany = isCompanySiteHost(host);

  const navLinks = baseNavLinks.map((link) => ({
    href:
      "external" in link && link.external
        ? link.href
        : resolveAcademyHref(link.href, isCompany),
    label: link.label,
  }));

  const authUrls = isCompany
    ? {
        loginHref: academyPath("/giris"),
        registerHref: academyPath("/kayit"),
        panelHref: academyPath("/panel"),
      }
    : undefined;

  return <Header navLinks={navLinks} authUrls={authUrls} />;
}
