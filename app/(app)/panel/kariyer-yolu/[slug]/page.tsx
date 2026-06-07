import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CareerPathEnrollButton } from "@/components/career-path/career-path-enroll-button";
import { RoadmapTimeline } from "@/components/career-path/roadmap-timeline";
import { getUserCareerPathWithProgress } from "@/lib/career-path/user-progress";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = await getUserCareerPathWithProgress(slug);

  return {
    title: path ? `${path.title} — İlerleme` : "Kariyer Yolu",
  };
}

export default async function CareerPathDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const path = await getUserCareerPathWithProgress(slug);

  if (!path) {
    notFound();
  }

  const nextStep = path.steps.find(
    (step) => step.status === "available" || step.status === "in_progress",
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/panel/kariyer-yolu"
        className="mb-6 inline-flex items-center text-sm font-medium text-primary-700 hover:text-primary-950"
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Tüm kariyer yolları
      </Link>

      <header className="mb-8">
        <p className="text-sm text-muted-foreground">{path.subtitle}</p>
        {!path.isEnrolled ? (
          <div className="mt-4">
            <CareerPathEnrollButton
              careerPathId={path.id}
              slug={path.slug}
              isEnrolled={path.isEnrolled}
            />
          </div>
        ) : null}
        {nextStep ? (
          <p className="mt-4 rounded-xl border border-accent-200 bg-accent-50/60 px-4 py-3 text-sm text-primary-900">
            Sıradaki adım:{" "}
            <span className="font-semibold">{nextStep.label}</span>
            {nextStep.status === "locked"
              ? " — önceki adımı tamamlayın."
              : ""}
          </p>
        ) : null}
      </header>

      <RoadmapTimeline path={path} />
    </div>
  );
}
