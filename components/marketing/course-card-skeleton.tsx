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
        <div className="h-3 w-1/3 animate-pulse rounded bg-primary-100" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-primary-100" />
        <div className="h-4 w-full animate-pulse rounded bg-primary-50" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-primary-50" />
        <div className="mt-2 h-7 w-1/2 animate-pulse rounded bg-primary-100" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-primary-50" />
        <div className="mt-4 flex items-end justify-between border-t border-primary-50 pt-4">
          <div className="h-7 w-20 animate-pulse rounded bg-primary-100" />
          <div className="h-10 w-10 animate-pulse rounded-full bg-primary-100" />
        </div>
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
}
