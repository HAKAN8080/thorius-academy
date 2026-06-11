import Link from "next/link";
import { CheckCircle2, ClipboardList, Search, Users } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { CorporateContactForm } from "@/components/marketing/corporate-contact-form";
import { CONSULTING_DOMAINS } from "@/lib/content/company-model";

const phases = [
  {
    icon: Search,
    title: "Keşif & audit",
    description:
      "Mevcut süreçler, yetkinlikler ve operasyonel performans birlikte haritalanır.",
  },
  {
    icon: ClipboardList,
    title: "Gap analizi & yol haritası",
    description:
      "Önceliklendirilmiş aksiyon planı; hızlı kazanımlar ve orta vadeli dönüşüm adımları.",
  },
  {
    icon: Users,
    title: "Uygulama desteği",
    description:
      "AI4U Retail devreye alımı, ekip eğitimleri ve koçluk ile kalıcı yetkinlik inşası.",
  },
] as const;

const deliverables = [
  "Süreç ve yetkinlik değerlendirmesi",
  "Gap analizi raporu",
  "Uygulanabilir dönüşüm yol haritası",
  "AI4U Retail entegrasyon planı",
  "Thorius Academy eğitim eşlemesi",
  "İsteğe bağlı koçluk paketi",
] as const;

export function CompanyConsultingPage() {
  return (
    <>
      <section className="bg-primary-950 py-16 text-white md:py-20">
        <Container size="narrow" className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-400">
            Danışmanlık & audit
          </p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
            Süreçlerinizi netleştiriyor, dönüşümü planlıyoruz
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-200">
            Tedarik zinciri, perakende planlama ve İK alanlarında audit ile
            başlayın; yazılım ve eğitimle sürdürülebilir sonuç alın.
          </p>
          <Button variant="gold" size="lg" className="mt-10" asChild>
            <Link href="#iletisim">Görüşme talep edin</Link>
          </Button>
        </Container>
      </section>

      <section className="py-16" aria-labelledby="domains-heading">
        <Container size="wide">
          <h2
            id="domains-heading"
            className="text-center text-3xl font-bold text-primary-950"
          >
            Uzmanlık alanları
          </h2>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            {CONSULTING_DOMAINS.map((domain) => (
              <div
                key={domain}
                className="rounded-xl border border-primary-100 bg-primary-50/50 px-4 py-6 text-center font-semibold text-primary-900"
              >
                {domain}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section
        className="border-y border-primary-100 bg-white py-16"
        aria-labelledby="phases-heading"
      >
        <Container size="wide">
          <h2
            id="phases-heading"
            className="text-center text-3xl font-bold text-primary-950"
          >
            Nasıl ilerliyoruz?
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {phases.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-primary-100 p-8 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-accent-100">
                  <Icon className="h-7 w-7 text-accent-700" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-primary-950">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-primary-700">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-primary-50/50 py-16" aria-labelledby="deliverables-heading">
        <Container size="narrow">
          <h2
            id="deliverables-heading"
            className="text-center text-3xl font-bold text-primary-950"
          >
            Teslimatlar
          </h2>
          <ul className="mx-auto mt-10 max-w-xl space-y-3">
            {deliverables.map((item) => (
              <li key={item} className="flex items-start gap-3 text-primary-800">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-accent-600"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="iletisim" className="scroll-mt-24 py-16">
        <Container className="max-w-xl">
          <h2 className="text-center text-2xl font-bold text-primary-950">
            İletişim formu
          </h2>
          <p className="mt-2 text-center text-primary-700">
            Ekibimiz en geç 1 iş günü içinde size dönüş yapacaktır.
          </p>
          <CorporateContactForm />
        </Container>
      </section>
    </>
  );
}
