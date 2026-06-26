import { Container } from "@/components/layout/container";

export function HeroAnimation() {
  return (
    <section
      className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950 py-12 md:py-16"
      aria-label="Thorius Academy tanıtım animasyonu"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-500/15 blur-3xl" />
      </div>

      <Container size="wide" className="relative flex justify-center">
        <figure className="w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl ring-1 ring-accent-500/20">
          <video
            className="h-auto w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src="/videos/hero-animation.mp4" type="video/mp4" />
          </video>
        </figure>
      </Container>
    </section>
  );
}
