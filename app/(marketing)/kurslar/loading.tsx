import { CourseGridSkeleton } from "@/components/marketing/course-card-skeleton";
import { Container } from "@/components/layout/container";

export default function KurslarLoading() {
  return (
    <div className="bg-[#0B1E3F]">
      <Container className="py-12 md:py-16">
        <div className="mb-8 md:mb-12">
          <div className="mb-2 h-4 w-32 animate-pulse rounded bg-[#D4AF37]/30" />
          <div className="mb-3 h-10 w-64 animate-pulse rounded-lg bg-white/10" />
          <div className="h-6 w-96 max-w-full animate-pulse rounded bg-white/5" />
        </div>
        <CourseGridSkeleton count={6} variant="dark" />
      </Container>
    </div>
  );
}
