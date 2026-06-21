import { Container } from "@/components/layout/container";

export function HeroSkeleton() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 py-12 sm:py-16 md:py-20 lg:py-24"
      aria-busy="true"
      aria-label="Hero yükleniyor"
    >
      <Container size="wide">
        <div className="grid grid-cols-1 items-center gap-8 xl:grid-cols-[1.05fr_1fr] xl:gap-10">
          <div className="order-2 space-y-4 xl:order-1">
            <div className="h-14 w-40 animate-pulse rounded-lg bg-primary-800/60" />
            <div className="h-16 w-full max-w-2xl animate-pulse rounded-xl bg-primary-800/60" />
            <div className="h-24 w-full max-w-3xl animate-pulse rounded-xl bg-primary-800/40" />
            <div className="flex gap-3">
              <div className="h-12 w-40 animate-pulse rounded-xl bg-primary-800/50" />
              <div className="h-12 w-32 animate-pulse rounded-xl bg-primary-800/50" />
            </div>
          </div>
          <div className="order-1 min-h-[22rem] animate-pulse rounded-[1.35rem] bg-primary-800/40 xl:order-2" />
        </div>
      </Container>
    </section>
  );
}
