import type { Metadata } from "next";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Thorius Academy ile iletişime geçin. Sorularınız için bize ulaşın.",
};

export default function IletisimPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="mb-3 text-3xl font-bold text-primary-950 md:text-4xl">
          İletişim
        </h1>
        <p className="text-lg text-muted-foreground">
          Sorularınız, önerileriniz veya işbirliği teklifleriniz için bize
          ulaşın
        </p>
      </header>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-primary-100 bg-white p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg bg-accent-500/10 p-2">
              <Mail className="h-5 w-5 text-accent-600" />
            </div>
            <h3 className="font-semibold text-primary-950">E-posta</h3>
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
            <h3 className="font-semibold text-primary-950">Adres</h3>
          </div>
          <p className="text-primary-700">
            Sandalcı Mecit Cd. No 9/1
            <br />
            Ortaköy / Beşiktaş - İstanbul
          </p>
        </div>

        <div className="rounded-2xl border border-primary-100 bg-white p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg bg-accent-500/10 p-2">
              <MessageCircle className="h-5 w-5 text-accent-600" />
            </div>
            <h3 className="font-semibold text-primary-950">WhatsApp</h3>
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
            <h3 className="font-semibold text-primary-950">Telefon</h3>
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
          Şirket Bilgileri
        </h3>
        <p className="text-sm text-primary-700">
          <strong>Ticari Unvan:</strong> Thorius Eğitim ve Danışmanlık Ltd.
          Şti.
          <br />
          <strong>Vergi Dairesi:</strong> Beşiktaş Vergi Dairesi
        </p>
      </div>
    </div>
  );
}
