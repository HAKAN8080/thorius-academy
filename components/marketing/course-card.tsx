import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types/wordpress";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  className?: string;
}

export function CourseCard({ course, className }: CourseCardProps) {
  return (
    <Link
      href={`/kurslar/${course.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-primary-50">
        {course.featuredImage ? (
          <Image
            src={course.featuredImage}
            alt={course.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <span className="text-4xl font-bold text-primary-300">T</span>
          </div>
        )}

        {course.categories.length > 0 && (
          <div className="absolute left-3 top-3">
            <Badge className="border-0 bg-primary-950/90 text-white backdrop-blur-sm">
              {course.categories[0].name}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-grow flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-primary-950 transition-colors group-hover:text-accent-600">
          {course.title}
        </h3>

        <p className="line-clamp-3 flex-grow text-sm text-muted-foreground">
          {course.excerpt}
        </p>

        {course.instructor && (
          <div className="flex items-center gap-2 border-t border-primary-50 pt-3">
            <User className="h-4 w-4 text-primary-700" aria-hidden="true" />
            <span className="text-sm font-medium text-primary-900">
              {course.instructor.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
