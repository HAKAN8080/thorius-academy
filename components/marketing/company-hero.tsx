import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { ParticleCanvas } from "@/components/marketing/particle-canvas";
import {
  COMPANY_HERO_SUBTITLE,
  COMPANY_LEGAL_NAME,
  COMPANY_TAGLINE,
} from "@/lib/content/company-model";

const ECOSYSTEM = ["Danışmanlık", "AI4U Retail", "Academy", "Coaching"] as const;

export function CompanyHero() {
  return (
    <section
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-primary-950 py-24 text-white"
      aria-labelledby="company-hero-heading"
    >
      <ParticleCanvas className="absolute inset-0 h-full w-full" />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-600/15 via-transparent to-transparent"
        aria-hidden="true"
      />

      <Container size="wide" className="relative w-full">
        <div className="mx-auto max-w-4xl text-center">
          <p className="hero-fade-up text-base font-semibold uppercase tracking-[0.22em] text-accent-400 sm:text-lg md:text-xl">
            {COMPANY_LEGAL_NAME}
          </p>
          <h1
            id="company-hero-heading"
            className="hero-fade-up hero-fade-up-1 mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl"
          >
            Perakende dönüşümünde{" "}
            <span className="text-accent-400">uçtan uca</span> partneriniz
          </h1>
          <p className="hero-fade-up hero-fade-up-2 mx-auto mt-5 max-w-2xl text-lg font-medium text-primary-200">
            {COMPANY_TAGLINE}
          </p>
          <p className="hero-fade-up hero-fade-up-3 mx-auto mt-4 max-w-3xl leading-relaxed text-primary-300/90">
            {COMPANY_HERO_SUBTITLE}
          </p>
          <div className="hero-fade-up hero-fade-up-4 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="gold" size="lg" asChild>
              <Link href="/kurumsal#iletisim">Görüşme talep edin</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white hover:text-primary-950"
              asChild
            >
              <Link href="/#model">Modelimizi keşfedin</Link>
            </Button>
          </div>
        </div>

        <ul
          className="hero-fade-up hero-fade-up-5 mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-center sm:grid-cols-4"
          aria-label="Ekosistem"
        >
          {ECOSYSTEM.map((label) => (
            <li
              key={label}
              className="bg-primary-950/70 px-4 py-5 text-sm font-semibold text-primary-100"
            >
              {label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
