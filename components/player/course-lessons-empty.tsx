"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { syncCourseFromTutor } from "@/lib/actions/lesson-sync";
import { Button } from "@/components/ui/button";

interface CourseLessonsEmptyProps {
  courseId: number;
  courseSlug: string;
}

export function CourseLessonsEmpty({
  courseId,
  courseSlug,
}: CourseLessonsEmptyProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [retryFailed, setRetryFailed] = useState(false);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) {
      return;
    }

    attemptedRef.current = true;
    startTransition(async () => {
      const result = await syncCourseFromTutor(courseId, courseSlug);
      if (result.success && (result.count ?? 0) > 0) {
        router.refresh();
        return;
      }

      setRetryFailed(true);
    });
  }, [courseId, courseSlug, router]);

  if (!retryFailed || isPending) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12 text-center">
        <Loader2
          className="mx-auto mb-4 h-8 w-8 animate-spin text-accent-600"
          aria-hidden="true"
        />
        <h1 className="mb-2 text-2xl font-bold text-primary-950">
          Dersler yükleniyor
        </h1>
        <p className="text-muted-foreground">
          Kurs içeriği hazırlanıyor, lütfen bekleyin…
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-2xl font-bold text-primary-950">
        Henüz ders eklenmemiş
      </h1>
      <p className="mb-6 text-muted-foreground">
        Bu kurs için ders içeriği yüklenmesi devam ediyor.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={() => {
            setRetryFailed(false);
            attemptedRef.current = false;
            startTransition(async () => {
              const result = await syncCourseFromTutor(courseId, courseSlug);
              if (result.success && (result.count ?? 0) > 0) {
                router.refresh();
              } else {
                setRetryFailed(true);
              }
            });
          }}
        >
          Tekrar Dene
        </Button>
        <Button asChild variant="outline">
          <Link href="/panel/kurslarim">Kurslarıma Dön</Link>
        </Button>
      </div>
    </div>
  );
}
