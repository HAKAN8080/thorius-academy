import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function IletisimPage() {
  const t = await getTranslations("contact");
  const addressLines = t("addressLines").split("\n");

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="mb-3 text-3xl font-bold text-primary-950 md:text-4xl">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-primary-100 bg-white p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg bg-accent-500/10 p-2">
              <Mail className="h-5 w-5 text-accent-600" />
            </div>
            <h3 className="font-semibold text-primary-950">{t("email")}</h3>
          </div>
          <a
            href="mailto:info@thorius.com.tr"
            className="text-primary-700 hover:text-accent-600"
          >
            info@thorius.com.tr
          </a>
        </div>

        <div className="rounded-2xl border border-primary-100 bg-white p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg bg-accent-500/10 p-2">
              <MapPin className="h-5 w-5 text-accent-600" />
            </div>
            <h3 className="font-semibold text-primary-950">{t("address")}</h3>
          </div>
          <p className="text-primary-700">
            {addressLines.map((line, index) => (
              <span key={line}>
                {line}
                {index < addressLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        </div>

        <div className="rounded-2xl border border-primary-100 bg-white p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg bg-accent-500/10 p-2">
              <MessageCircle className="h-5 w-5 text-accent-600" />
            </div>
            <h3 className="font-semibold text-primary-950">{t("whatsapp")}</h3>
          </div>
          <a
            href="https://wa.me/905431323503"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-700 hover:text-accent-600"
          >
            +90 543 132 35 03
          </a>
        </div>

        <div className="rounded-2xl border border-primary-100 bg-white p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg bg-accent-500/10 p-2">
              <Phone className="h-5 w-5 text-accent-600" />
            </div>
            <h3 className="font-semibold text-primary-950">{t("phone")}</h3>
          </div>
          <a
            href="tel:+905431323503"
            className="text-primary-700 hover:text-accent-600"
          >
            +90 543 132 35 03
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-accent-50 p-6">
        <h3 className="mb-2 font-semibold text-primary-950">
          {t("companyInfoTitle")}
        </h3>
        <p className="text-sm text-primary-700">
          <strong>{t("legalNameLabel")}</strong> {t("legalName")}
          <br />
          <strong>{t("taxOfficeLabel")}</strong> {t("taxOffice")}
        </p>
      </div>
    </div>
  );
}
