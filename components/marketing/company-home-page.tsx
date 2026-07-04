import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgePercent,
  Boxes,
  BrainCircuit,
  Compass,
  Cpu,
  GraduationCap,
  RefreshCcw,
  Store,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { CompanyHeroNetwork } from "@/components/marketing/company-hero-network";
import { AI4U_RETAIL_URL } from "@/lib/content/company-model";
import { academyPath } from "@/lib/site/site-mode";

const HERO_PROOF_CARDS = [
  {
    label: "Online Sipariş Karşılama",
    value: "%70",
    detail: "Daha Hızlı Teslimat",
    description: "Yapay zeka destekli stok yönetim sistemi",
  },
  {
    label: "Satış Verimliliği",
    value: "+%15",
    detail: "Brüt Kâr İyileşmesi",
    description: "Otomatik stok dengeleme algoritması",
  },
  {
    label: "Tahmin Doğruluğu",
    value: "%92",
    detail: "İsabet Oranı",
    description: "Makine öğrenmesi destekli talep tahmini",
  },
] as const;

const SECTORS = [
  "Ev Tekstili",
  "Kozmetik & Güzellik",
  "Hazır Giyim",
  "Teknoloji Perakende",
  "Çok Kanallı Perakende",
] as const;

const SERVICES = [
  {
    icon: Boxes,
    title: "Ürün & Stok Planlaması",
    description:
      "Satın alma bütçesini optimize edin, sezon planlamasını veriyle yapın, kategori bazlı karlılığı artırın.",
    tags: ["Satın Alma Bütçesi", "Karlılık", "Sezon"],
  },
  {
    icon: RefreshCcw,
    title: "Stok Yenileme & Dağıtım",
    description:
      "Hangi ürünün nerede, ne zaman ve ne kadar olacağını otomatik hesaplayan akıllı sistemler.",
    tags: ["Otomatik İkmal", "Mağaza Dağıtımı"],
  },
  {
    icon: BrainCircuit,
    title: "Yapay Zeka Entegrasyonu",
    description:
      "Mevcut sistemlerinize AI karar destek katmanı ekleyin. ERP değişimi gerekmez.",
    tags: ["AI Karar Destek", "Otomasyon"],
  },
  {
    icon: BadgePercent,
    title: "İndirim & Fiyat Optimizasyonu",
    description:
      "Sezon sonu indirim kararlarını veriye dayandırarak marjı koruyun, fazla stoğu erken eritin.",
    tags: ["İndirim Yönetimi", "Marj Koruma"],
  },
  {
    icon: Store,
    title: "Çok Kanallı Satış Operasyonu",
    description:
      "Mağaza ve online kanallar arasında stok dengesini kurun, müşteriye her yerden ulaşın.",
    tags: ["Mağaza + Online", "Kanal Dengesi"],
  },
  {
    icon: GraduationCap,
    title: "Ekip Eğitimi & Metodoloji",
    description:
      "Planlama ekiplerinize özel eğitim programları. Proje sonunda bağımlılık değil, yetkinlik bırakıyoruz.",
    tags: ["Workshop", "Transfer"],
  },
] as const;

const APPROACH_STEPS = [
  {
    title: "Mevcut Durumu Anlayın",
    description:
      "Satış, stok ve karlılık verilerinizi birlikte inceliyoruz. Hangi süreç ne kadar kayıp yaratıyor, rakamlarla ortaya koyuyoruz.",
  },
  {
    title: "Size Özel Çözüm Tasarlayın",
    description:
      "İş modelinize ve sektörünüze özel planlama yöntemi ve yapay zeka mimarisi tasarlıyoruz. Hazır şablon yok.",
  },
  {
    title: "Sistemlere Entegre Edin",
    description:
      "Mevcut yazılımlarınızın üzerine çalışan çözümler kuruyoruz. Büyük altyapı yatırımı gerekmez.",
  },
  {
    title: "Sonuçları Ölçün, Ekibi Güçlendirin",
    description:
      "Hedef rakamlara ulaşıldığını birlikte doğruluyoruz. Metodoloji ekibinize geçer, proje bittikten sonra da kullanmaya devam edersiniz.",
  },
] as const;

const IMPACT_STATS = [
  { value: "%70", label: "Online sipariş karşılama süresinde iyileşme" },
  { value: "+%15", label: "Brüt kâr artışı" },
  { value: "300+", label: "Bağlı satış noktası" },
  { value: "8 Hf", label: "Ortalama proje tamamlama süresi" },
] as const;

const CASE_STUDIES = [
  {
    badge: "Ev Tekstili · 300+ Satış Noktası",
    problem:
      "Satış noktaları arasında stok dengesizliği; bir yanda fazla stok, diğer yanda sürekli eksiklik.",
    quote:
      "Yapay zeka destekli stok yönetim sistemi kuruldu. Hangi ürünün nerede, ne zaman ve ne kadar olması gerektiği artık otomatik olarak hesaplanıyor.",
    results: [
      { value: "%70", label: "Online kapasite iyileşmesi" },
      { value: "300+", label: "Bağlı satış noktası" },
      { value: "%87", label: "Stok isabet oranı" },
    ],
  },
  {
    badge: "Kozmetik Perakende · Çok Kanallı",
    problem:
      "Sipariş ve stok kararları manuel alınıyor, hata payı yüksek ve çok zaman alıyordu.",
    quote:
      "Yapay zeka destekli planlama asistanı devreye alındı. Stok önerisi ve satış tahmini artık dakikalar içinde tamamlanıyor.",
    results: [
      { value: "+%15", label: "Brüt kâr iyileşmesi" },
      { value: "2×", label: "Ekip üretkenliği" },
      { value: "%92", label: "Tahmin doğruluğu" },
    ],
  },
  {
    badge: "Teknoloji Distribütörü · B2B",
    problem:
      "Bayi ağında verimsizlik; karlı olmayan segmentlere aşırı kaynak ayrılıyordu.",
    quote:
      "Bayi performans analizi ve yapay zeka destekli müşteri segmentasyonu yapıldı. Kaynaklar yüksek değerli segmentlere yönlendirildi.",
    results: [
      { value: "%23", label: "Brüt kâr artışı" },
      { value: "5 Yıl", label: "Stratejik ortaklık" },
      { value: "3 Ay", label: "Sonuç süresi" },
    ],
  },
  {
    badge: "Hazır Giyim · Sezon Planlaması",
    problem:
      "Sezon sonu yüksek indirim oranları kârı eritiyor, alım miktarları gerçekçi tahmin edilemiyordu.",
    quote:
      "Satın alma bütçesi modeli ve indirim optimizasyon sistemi kuruldu. Sezon planlaması veriye dayalı hale getirildi.",
    results: [
      { value: "−18p", label: "İndirim oranı düşüşü" },
      { value: "+%9", label: "Brüt kâr iyileşme" },
      { value: "8 Hf", label: "Proje süresi" },
    ],
  },
] as const;

function SectionEyebrow({
  label,
  align = "left",
  dark = false,
}: {
  label: string;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <p
      className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] ${
        dark ? "text-accent-400" : "text-accent-600"
      } ${align === "center" ? "justify-center" : ""}`}
    >
      <span
        className={`h-px w-8 ${dark ? "bg-accent-400/70" : "bg-accent-500/80"}`}
        aria-hidden="true"
      />
      {label}
    </p>
  );
}

export function CompanyHomePage() {
  const products = [
    {
      icon: Cpu,
      name: "AI-4U Platform",
      description:
        "Stok yönetimi, satış tahmini ve dağıtım optimizasyonu için yapay zeka yazılım paketi.",
      href: AI4U_RETAIL_URL,
      cta: "Platformu inceleyin",
    },
    {
      icon: GraduationCap,
      name: "Thorius Academy",
      description:
        "Perakende profesyonelleri için online eğitim platformu. 24+ kurs, sertifika programları.",
      href: academyPath("/kurslar"),
      cta: "academy.thorius.com.tr",
    },
    {
      icon: Compass,
      name: "Thorius Coaching",
      description:
        "Yöneticiler için yapay zeka destekli koçluk platformu. Uluslararası ICF standartlarında.",
      href: "https://coaching.thorius.com.tr",
      cta: "coaching.thorius.com.tr",
    },
  ] as const;

  return (
    <>
      {/* ---- Hero ---- */}
      <section
        className="relative isolate flex min-h-[calc(100svh-4.25rem)] items-center overflow-hidden bg-gradient-to-b from-[#060b18] via-primary-950 to-primary-900 py-20 text-white md:py-24"
        aria-labelledby="company-hero-heading"
      >
        <CompanyHeroNetwork />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-500/10 via-transparent to-transparent"
          aria-hidden="true"
        />

        <Container size="wide" className="relative w-full">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            <div>
              <p className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-200">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-400" />
                </span>
                Retail × AI Danışmanlık
              </p>

              <h1
                id="company-hero-heading"
                className="mt-8 text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl xl:text-6xl"
              >
                Veri Kararınızı,{" "}
                <em className="not-italic text-accent-400">
                  Stok Geleceğinizi
                </em>{" "}
                Şekillendirsin
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-200">
                Karmaşık verileri, perakendenin nabzını tutan yapay zeka ile
                okunabilir içgörüye dönüştürüyoruz. Stokta kalmayın, talebi
                öngörün.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button variant="gold" size="lg" asChild>
                  <Link href="/kurumsal#iletisim">
                    Ücretsiz Keşif Görüşmesi
                    <ArrowRight className="ml-1" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/25 bg-transparent text-white hover:bg-white hover:text-primary-950"
                  asChild
                >
                  <Link href="/#referanslar">Başarı Hikayeleri</Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4" role="list">
              {HERO_PROOF_CARDS.map((card) => (
                <div
                  key={card.label}
                  role="listitem"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-colors hover:border-accent-400/40"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
                    {card.label}
                  </p>
                  <p className="mt-3 flex items-baseline gap-2.5">
                    <span className="text-3xl font-bold tracking-tight text-accent-400">
                      {card.value}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {card.detail}
                    </span>
                  </p>
                  <p className="mt-1.5 text-sm text-primary-300">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ---- Sektörler şeridi ---- */}
      <div className="border-b border-primary-100 bg-primary-50/60 py-8">
        <Container size="wide">
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">
              Birlikte Çalıştığımız Sektörler
            </p>
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              {SECTORS.map((sector) => (
                <li
                  key={sector}
                  className="text-sm font-semibold tracking-tight text-primary-800"
                >
                  {sector}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </div>

      {/* ---- Hizmetler ---- */}
      <section
        id="hizmetler"
        className="scroll-mt-24 py-20 md:py-28"
        aria-labelledby="services-heading"
      >
        <Container size="wide">
          <div className="max-w-3xl">
            <SectionEyebrow label="Hizmetler" />
            <h2
              id="services-heading"
              className="mt-4 text-3xl font-bold tracking-tight text-primary-950 md:text-4xl"
            >
              Perakendenin Geleceğini Bugün İnşa Ediyoruz
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-primary-700">
              Operasyonel danışmanlıktan yapay zeka entegrasyonuna kadar
              perakendenin tüm planlama süreçlerinde yanınızdayız.
            </p>
          </div>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {SERVICES.map((service) => (
              <li
                key={service.title}
                className="group flex flex-col rounded-2xl border border-primary-100 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-accent-400/50 hover:shadow-lg hover:shadow-primary-900/[0.06]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-950 text-accent-400">
                  <service.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-primary-950">
                  {service.title}
                </h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-primary-700">
                  {service.description}
                </p>
                <p className="mt-5 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
                    >
                      {tag}
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ---- Yaklaşım ---- */}
      <section
        id="yaklasim"
        className="scroll-mt-24 border-y border-primary-100 bg-primary-50/60 py-20 md:py-28"
        aria-labelledby="approach-heading"
      >
        <Container size="wide">
          <div className="max-w-3xl">
            <SectionEyebrow label="Yaklaşım" />
            <h2
              id="approach-heading"
              className="mt-4 text-3xl font-bold tracking-tight text-primary-950 md:text-4xl"
            >
              Teori Değil, Sonuç
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-primary-700">
              Her proje veri analiziyle başlar, ölçülebilir iyileşmeyle biter.
            </p>
          </div>

          <ol className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {APPROACH_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="relative rounded-2xl border border-primary-100 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-accent-400/50 hover:shadow-lg hover:shadow-primary-900/[0.06]"
              >
                <span
                  className="text-sm font-bold tracking-tight text-accent-600"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-bold tracking-tight text-primary-950">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-primary-700">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-14 overflow-hidden rounded-3xl bg-gradient-to-br from-[#060b18] via-primary-950 to-primary-900 px-8 py-12 text-white md:px-14">
            <dl className="grid gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
              {IMPACT_STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="order-2 mt-2 block text-sm leading-snug text-primary-300">
                    {stat.label}
                  </dt>
                  <dd className="order-1 text-4xl font-bold tracking-tight text-accent-400">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* ---- Referanslar ---- */}
      <section
        id="referanslar"
        className="scroll-mt-24 py-20 md:py-28"
        aria-labelledby="cases-heading"
      >
        <Container size="wide">
          <div className="max-w-3xl">
            <SectionEyebrow label="Referanslar" />
            <h2
              id="cases-heading"
              className="mt-4 text-3xl font-bold tracking-tight text-primary-950 md:text-4xl"
            >
              Sonuçlar Konuşsun
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-primary-700">
              Müşteri gizliliği kapsamında paylaşılan gerçek proje çıktıları.
            </p>
          </div>

          <ul className="mt-14 grid gap-5 lg:grid-cols-2">
            {CASE_STUDIES.map((caseStudy) => (
              <li
                key={caseStudy.badge}
                className="flex flex-col rounded-2xl border border-primary-100 bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-accent-400/50 hover:shadow-lg hover:shadow-primary-900/[0.06]"
              >
                <p className="inline-flex self-start rounded-full bg-primary-950 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-accent-400">
                  {caseStudy.badge}
                </p>
                <div className="mt-5 rounded-xl border border-primary-100 bg-primary-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-500">
                    Sorun
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-primary-800">
                    {caseStudy.problem}
                  </p>
                </div>
                <blockquote className="mt-5 flex-1 border-l-2 border-accent-500 pl-4 text-sm leading-relaxed text-primary-700">
                  {caseStudy.quote}
                </blockquote>
                <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-primary-100 pt-5">
                  {caseStudy.results.map((result) => (
                    <div key={`${caseStudy.badge}-${result.label}`}>
                      <dd className="text-xl font-bold tracking-tight text-primary-950">
                        {result.value}
                      </dd>
                      <dt className="mt-1 text-xs leading-snug text-primary-600">
                        {result.label}
                      </dt>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ---- Ürünler & Platformlar ---- */}
      <section
        className="bg-gradient-to-b from-[#060b18] via-primary-950 to-primary-950 py-20 text-white md:py-28"
        aria-labelledby="products-heading"
      >
        <Container size="wide">
          <div className="max-w-3xl">
            <SectionEyebrow label="Ürünler & Platformlar" dark />
            <h2
              id="products-heading"
              className="mt-4 text-3xl font-bold tracking-tight md:text-4xl"
            >
              Danışmanlığı Ürüne Dönüştürdük
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-primary-300">
              Metodolojilerimizi yazılım, eğitim platformu ve koçluk hizmeti
              olarak da sunuyoruz.
            </p>
          </div>

          <ul className="mt-14 grid gap-5 md:grid-cols-3">
            {products.map((product) => (
              <li key={product.name}>
                <a
                  href={product.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition duration-300 hover:-translate-y-1 hover:border-accent-400/50 hover:bg-white/[0.07]"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-accent-400/30 bg-accent-500/10 text-accent-400">
                    <product.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold tracking-tight">
                    {product.name}
                  </h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-primary-300">
                    {product.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-400 group-hover:text-accent-300">
                    {product.cta}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ---- Final CTA ---- */}
      <section
        id="iletisim"
        className="scroll-mt-24 border-t border-primary-100 bg-white py-20 md:py-24"
        aria-labelledby="final-cta-heading"
      >
        <Container size="wide">
          <div className="mx-auto max-w-3xl text-center">
            <SectionEyebrow label="İletişim" align="center" />
            <h2
              id="final-cta-heading"
              className="mt-4 text-3xl font-bold tracking-tight text-primary-950 md:text-4xl"
            >
              Perakende Stratejinizi Birlikte Yazalım
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-primary-700">
              30 dakikalık ücretsiz keşif görüşmesiyle başlayalım. Size özel
              çözümümüzü rakamlarla gösterelim.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="gold" size="lg" asChild>
                <Link href="/kurumsal#iletisim">
                  Ücretsiz Keşif Görüşmesi
                  <ArrowRight className="ml-1" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/iletisim">Bize ulaşın</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
