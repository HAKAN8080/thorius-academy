import type { Metadata } from "next";
import Link from "next/link";
import { Map, ArrowRight } from "lucide-react";
import { CareerPathCard } from "@/components/career-path/career-path-card";
import { getUserCareerPathsWithProgress } from "@/lib/career-path/user-progress";

export const metadata: Metadata = {
  title: "Kariyer Yolum",
  description: "Uzmanlık yollarınızda tamamladığınız adımları takip edin.",
};

export default async function CareerPathPanelPage() {
  const paths = await getUserCareerPathsWithProgress();
  const activePaths = paths.filter(
    (path) => path.isEnrolled || path.completedSteps > 0,
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-accent-500/10 p-2">
            <Map className="h-6 w-6 text-accent-600" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-primary-950 md:text-4xl">
            Kariyer Yolum
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Sıralı öğrenme yollarınızda hangi adımları tamamladığınızı görün ve
          sıradaki kursa geçin.
        </p>
      </header>

      {activePaths.length > 0 ? (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-primary-950">
            Devam ettiğiniz yollar
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {activePaths.map((path) => (
              <CareerPathCard key={path.id} path={path} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-xl font-bold text-primary-950">
          Tüm kariyer yolları
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paths.map((path) => (
            <CareerPathCard key={path.id} path={path} />
          ))}
        </div>
      </section>

      <div className="mt-10 rounded-2xl border border-primary-100 bg-white p-6">
        <p className="text-sm text-muted-foreground">
          Pazarlama sayfasından yol detaylarını inceleyebilir veya doğrudan
          panelden ilerlemenizi takip edebilirsiniz.
        </p>
        <Link
          href="/kariyer-yolu"
          className="mt-3 inline-flex items-center text-sm font-semibold text-accent-700 hover:text-accent-900"
        >
          Kariyer yollarını keşfet
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
