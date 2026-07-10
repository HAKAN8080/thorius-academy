"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { enrollInCourse } from "@/lib/actions/enrollment";

interface EnrollButtonProps {
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  courseImage?: string | null;
  courseCategory?: string | null;
  instructorName?: string | null;
  isLoggedIn: boolean;
  isAlreadyEnrolled: boolean;
}

export function EnrollButton({
  courseId,
  courseSlug,
  courseTitle,
  courseImage,
  courseCategory,
  instructorName,
  isLoggedIn,
  isAlreadyEnrolled,
}: EnrollButtonProps) {
  const t = useTranslations("courses.enroll");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (isAlreadyEnrolled) {
    return (
      <Button
        size="lg"
        asChild
        className="w-full bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600 sm:w-auto"
      >
        <Link href={`/panel/kurslarim/${courseSlug}`}>
          <CheckCircle className="mr-2 h-4 w-4" />
          {t("continue")}
        </Link>
      </Button>
    );
  }

  function handleEnroll() {
    if (!isLoggedIn) {
      toast.info(t("loginToEnroll"));
      router.push(`/giris?redirect=/kurslar/${courseSlug}`);
      return;
    }

    startTransition(async () => {
      const result = await enrollInCourse({
        courseId,
        courseSlug,
        courseTitle,
        courseImage,
        courseCategory,
        instructorName,
      });

      if (result.success) {
        toast.success(t("success"));
        router.refresh();
        router.push(`/panel/kurslarim/${courseSlug}`);
      } else if (result.alreadyEnrolled) {
        toast.info(t("alreadyEnrolled"));
        router.refresh();
        router.push(`/panel/kurslarim/${courseSlug}`);
      } else if (result.needsLogin) {
        router.push(`/giris?redirect=/kurslar/${courseSlug}`);
      } else {
        toast.error(result.error ?? t("error"));
      }
    });
  }

  return (
    <Button
      size="lg"
      onClick={handleEnroll}
      disabled={isPending}
      className="w-full bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600 sm:w-auto"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("enrolling")}
        </>
      ) : (
        <>
          {t("join")}
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
