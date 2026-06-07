"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { enrollInCareerPath } from "@/lib/actions/career-path";
import { Button } from "@/components/ui/button";

interface CareerPathEnrollButtonProps {
  careerPathId: string;
  slug: string;
  isEnrolled: boolean;
}

export function CareerPathEnrollButton({
  careerPathId,
  slug,
  isEnrolled,
}: CareerPathEnrollButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (isEnrolled) {
    return null;
  }

  function handleEnroll() {
    setError(null);
    startTransition(async () => {
      const result = await enrollInCareerPath(careerPathId, slug);
      if (!result.success && !result.alreadyEnrolled) {
        setError(result.error ?? "Kayıt başarısız.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        onClick={handleEnroll}
        disabled={isPending}
        className="rounded-xl bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
      >
        {isPending ? "Kaydediliyor…" : "Bu kariyer yoluna başla"}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
