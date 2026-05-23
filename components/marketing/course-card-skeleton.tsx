import { cn } from "@/lib/utils";

interface CourseCardSkeletonProps {
  className?: string;
}

export function CourseCardSkeleton({ className }: CourseCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white",
        className
      )}
      aria-hidden="true"
    >
      <div className="aspect-video animate-pulse bg-primary-100" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-primary-100" />
        <div className="h-4 w-full animate-pulse rounded bg-primary-50" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-primary-50" />
        <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-primary-100" />
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
}
