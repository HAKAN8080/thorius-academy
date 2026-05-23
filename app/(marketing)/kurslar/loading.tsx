import { CourseGridSkeleton } from "@/components/marketing/course-card-skeleton";
import { Container } from "@/components/layout/container";

export default function KurslarLoading() {
  return (
    <Container className="py-12 md:py-16">
      <div className="mb-8 md:mb-12">
        <div className="mb-3 h-10 w-64 animate-pulse rounded-lg bg-primary-100" />
        <div className="h-6 w-96 max-w-full animate-pulse rounded bg-primary-50" />
      </div>
      <CourseGridSkeleton count={6} />
    </Container>
  );
}
