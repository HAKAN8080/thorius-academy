"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (isAlreadyEnrolled) {
    return (
      <Button
        size="lg"
        asChild
        className="w-full bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600 sm:w-auto"
      >
        <Link href="/panel/kurslarim">
          <CheckCircle className="mr-2 h-4 w-4" />
          Kursa Devam Et
        </Link>
      </Button>
    );
  }

  function handleEnroll() {
    if (!isLoggedIn) {
      toast.info("Kayıt olmak için lütfen giriş yapın");
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
        toast.success("Kursa başarıyla kayıt oldunuz!");
        router.push("/panel/kurslarim");
      } else if (result.alreadyEnrolled) {
        toast.info("Bu kursa zaten kayıtlısınız");
        router.push("/panel/kurslarim");
      } else if (result.needsLogin) {
        router.push(`/giris?redirect=/kurslar/${courseSlug}`);
      } else {
        toast.error(result.error ?? "Bir hata oluştu");
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
          Kaydediliyor...
        </>
      ) : (
        <>
          Kursa Katıl
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
