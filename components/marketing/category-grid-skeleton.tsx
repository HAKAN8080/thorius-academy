import { Container } from "@/components/layout/container";

export function CategoryGridSkeleton() {
  return (
    <section
      className="border-b border-primary-100 bg-white py-3 md:py-4"
      aria-busy="true"
      aria-label="Kategoriler yükleniyor"
    >
      <Container size="wide">
        <div className="mb-2 h-7 w-40 animate-pulse rounded-lg bg-primary-100 md:mb-3" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10 lg:gap-2.5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[5/3] animate-pulse rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 lg:aspect-[4/3]"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
