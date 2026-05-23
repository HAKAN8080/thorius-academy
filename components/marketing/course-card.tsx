import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categoryLabels, formatPrice } from "@/lib/data/courses";
import type { Course } from "@/types/database";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  className?: string;
}

export function CourseCard({ course, className }: CourseCardProps) {
  return (
    <Link href={`/kurslar?kurs=${course.slug}`} className={cn("block", className)}>
      <Card className="group h-full overflow-hidden border-primary-100 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
        <div className="relative aspect-[16/10] overflow-hidden bg-primary-100">
          <Image
            src={course.imageUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <Badge className="absolute left-3 top-3 bg-primary-900/90 text-white hover:bg-primary-900">
            {categoryLabels[course.category]}
          </Badge>
        </div>
        <CardContent className="p-5">
          <h3 className="line-clamp-2 font-semibold text-primary-900 group-hover:text-primary-700">
            {course.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{course.instructor}</p>
          <div className="mt-3 flex items-center gap-1 text-sm text-primary-600">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{course.duration}</span>
          </div>
        </CardContent>
        <CardFooter className="border-t border-primary-50 px-5 py-4">
          <span className="text-lg font-bold text-primary-900">
            {formatPrice(course.price)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
