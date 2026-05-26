import Link from "next/link";
import { CheckCircle2, Users, LineChart, Shield } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CorporateContactForm } from "@/components/marketing/corporate-contact-form";

const benefits = [
  {
    icon: Users,
    title: "Ölçeklenebilir Eğitim",
    description:
      "Mağaza müdürlerinden genel müdürlüğe kadar tüm kademeler için özelleştirilmiş öğrenme yolları.",
  },
  {
    icon: LineChart,
    title: "Ölçülebilir ROI",
    description:
      "Tamamlama oranları, sınav skorları ve KPI etkisi tek panelde raporlanır.",
  },
  {
    icon: Shield,
    title: "Kurumsal Güvenlik",
    description:
      "SSO, KVKK uyumlu veri işleme ve kurumsal sözleşme çerçevesinde destek.",
  },
] as const;

const packages = [
  {
    name: "Growth",
    description: "50–200 çalışanlı perakende markaları",
    features: [
      "20 kursluk kütüphane erişimi",
      "Aylık canlı Q&A oturumu",
      "Yönetici özeti raporu",
    ],
    price: "Teklif üzerine",
  },
  {
    name: "Enterprise",
    description: "200+ çalışan, çoklu format",
    features: [
      "Sınırsız koltuk",
      "Özel içerik üretimi",
      "Dedicated Customer Success",
      "LMS entegrasyonu",
    ],
    price: "Özel fiyatlandırma",
    highlighted: true,
  },
] as const;

export default function KurumsalPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary-900 to-primary-700 py-20 text-white">
        <Container size="narrow" className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Kurumsal Perakende Akademisi
          </h1>
          <p className="mt-6 text-lg text-primary-100">
            Zincir mağazalarınız için uçtan uca yetkinlik geliştirme programları.
            Planlama, operasyon ve dijital dönüşümü tek platformda birleştirin.
          </p>
          <Button variant="gold" size="lg" className="mt-10" asChild>
            <Link href="#iletisim">Demo Talep Et</Link>
          </Button>
        </Container>
      </section>

      <section className="py-16" aria-labelledby="benefits-heading">
        <Container>
          <h2 id="benefits-heading" className="text-center text-3xl font-bold text-primary-900">
            Neden Thorius?
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-primary-100 text-center">
                <CardHeader>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-accent-100">
                    <Icon className="h-7 w-7 text-accent-700" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-primary-900">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="paketler" className="bg-primary-50/50 py-16">
        <Container>
          <h2 className="text-center text-3xl font-bold text-primary-900">Paketler</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className={
                  "highlighted" in pkg && pkg.highlighted
                    ? "border-accent-500 shadow-lg ring-2 ring-accent-500/20"
                    : "border-primary-100"
                }
              >
                <CardHeader>
                  <CardTitle className="text-primary-900">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-2xl font-bold text-primary-900">{pkg.price}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="gold" className="w-full" asChild>
                    <Link href="#iletisim">Teklif İste</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="iletisim" className="py-16">
        <Container className="max-w-xl">
          <h2 className="text-center text-2xl font-bold text-primary-900">
            Kurumsal İletişim Formu
          </h2>
          <p className="mt-2 text-center text-primary-700">
            Ekibimiz 1 iş günü içinde size dönüş yapacaktır.
          </p>
          <CorporateContactForm />
        </Container>
      </section>
    </>
  );
}
