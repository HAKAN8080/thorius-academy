import Image from "next/image";
import { Container } from "@/components/layout/container";

export function BilgeBaykusSection() {
  return (
    <section
      id="bilge-baykus"
      className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-16 md:py-24"
      aria-labelledby="bilge-baykus-heading"
    >
      <div
        className="owl-pattern pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden="true"
      />

      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto w-full max-w-md lg:mx-0">
            <div
              className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-accent-500/15 to-primary-500/10 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-xl">
              <Image
                src="/images/bilge-baykus.png"
                alt="Bilge Baykuş — Thorius AI Academy'nin bilge rehberi"
                width={560}
                height={560}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>

          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent-50 px-4 py-1.5 text-sm font-medium text-accent-700">
              <span aria-hidden="true">🦉</span>
              Akademi Maskotu
            </p>
            <h2
              id="bilge-baykus-heading"
              className="text-3xl font-bold text-primary-900 md:text-4xl"
            >
              Bilge Baykuş ile Tanışın
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-primary-700">
              Bilge Baykuş, Thorius AI Academy&apos;nin bilgelik ve teknolojiyi
              birleştiren maskotudur. Mezuniyet şapkası ve gözlükleriyle
              geleneksel bilgeliği, tablet ve AI araçlarıyla modern öğrenmeyi
              temsil eder.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                {
                  title: "Akıllı Rehberlik",
                  desc: "Kurslarınızda size yol gösteren AI destekli öğrenme asistanı",
                },
                {
                  title: "Bilgelik + Teknoloji",
                  desc: "Sektör deneyimi ile yapay zekayı bir araya getiren yaklaşım",
                },
                {
                  title: "Her Zaman Yanınızda",
                  desc: "Online eğitimlerinizde 7/24 erişilebilir dijital mentor",
                },
              ].map((item) => (
                <li
                  key={item.title}
                  className="flex gap-4 rounded-xl border border-primary-100 bg-white p-4 shadow-sm"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-900 text-lg"
                    aria-hidden="true"
                  >
                    🦉
                  </span>
                  <div>
                    <h3 className="font-semibold text-primary-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-primary-600">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
