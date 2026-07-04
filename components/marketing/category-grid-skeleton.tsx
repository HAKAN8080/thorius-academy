import { Container } from "@/components/layout/container";

export function CategoryGridSkeleton() {
  return (
    <section
      className="border-b border-primary-100 bg-white py-4 md:py-5"
      aria-busy="true"
      aria-label="Kategoriler yükleniyor"
    >
      <Container size="wide">
        <div className="mb-3 h-8 w-48 animate-pulse rounded-lg bg-primary-100 md:mb-4" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[16/10] animate-pulse rounded-xl bg-gradient-to-br from-primary-100 to-primary-200"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
