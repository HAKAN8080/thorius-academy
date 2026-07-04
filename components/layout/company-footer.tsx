import Link from "next/link";
import { Container } from "@/components/layout/container";
import { CompanyLogo } from "@/components/layout/company-logo";
import {
  AI4U_RETAIL_URL,
  COMPANY_LEGAL_NAME,
} from "@/lib/content/company-model";
import { academyPath } from "@/lib/site/site-mode";

const footerColumns = [
  {
    title: "Hizmetler",
    links: [
      { href: "/#hizmetler", label: "Hizmetlerimiz" },
      { href: "/#yaklasim", label: "Yaklaşımımız" },
      { href: "/#referanslar", label: "Referanslar" },
      { href: "/kurumsal", label: "Danışmanlık & audit" },
      { href: "/hakkimizda", label: "Hakkımızda" },
    ],
  },
  {
    title: "Platformlar",
    links: [
      {
        href: AI4U_RETAIL_URL,
        label: "AI-4U Platform",
        external: true,
      },
      { href: academyPath("/kurslar"), label: "Thorius Academy", external: true },
      {
        href: "https://coaching.thorius.com.tr",
        label: "Thorius Coaching",
        external: true,
      },
    ],
  },
  {
    title: "İletişim",
    links: [
      { href: "/kurumsal#iletisim", label: "Ücretsiz Keşif" },
      { href: "/iletisim", label: "Bize ulaşın" },
      { href: "mailto:info@thorius.com.tr", label: "info@thorius.com.tr" },
      {
        href: "https://wa.me/905431323503",
        label: "WhatsApp",
        external: true,
      },
    ],
  },
  {
    title: "Yasal",
    links: [
      { href: "/gizlilik", label: "Gizlilik Politikası" },
      { href: "/kvkk", label: "KVKK" },
      { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
    ],
  },
] as const;

function FooterLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const className = "text-sm text-primary-200 transition-colors hover:text-white";

  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={className}
        {...(href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function CompanyFooter() {
  return (
    <footer className="bg-primary-950 text-white">
      <Container size="wide" className="py-14">
        <div className="mb-10 border-b border-primary-800 pb-10">
          <CompanyLogo inverted />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-300">
            Perakende sektörü için yapay zeka destekli danışmanlık, yazılım ve
            eğitim çözümleri.
          </p>
          <p className="mt-2 text-xs text-primary-400">
            {COMPANY_LEGAL_NAME} · İstanbul, Türkiye
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent-500">
                {column.title}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <FooterLink {...link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-primary-800 pt-8 text-center text-xs text-primary-400 sm:text-left">
          <p>© {new Date().getFullYear()} {COMPANY_LEGAL_NAME}</p>
        </div>
      </Container>
    </footer>
  );
}
