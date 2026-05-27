import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";

const footerColumns = [
  {
    title: "Hakkımızda",
    links: [
      { href: "/hakkimizda", label: "Misyonumuz" },
      { href: "/#ecosystem", label: "Koçluk" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Kurslar",
    links: [
      { href: "/kurslar", label: "Tüm Kurslar" },
      { href: "/kurslar?kategori=ai-veri", label: "AI & Veri" },
      { href: "/kurslar?kategori=liderlik", label: "Liderlik" },
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

export function Footer() {
  return (
    <footer className="bg-primary-900 text-white">
      <Container size="wide" className="py-12">
        <div className="mb-10 border-b border-primary-700 pb-10">
          <Logo variant="full" inverted />
        </div>

        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent-500">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-100 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
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
