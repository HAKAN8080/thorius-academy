"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseLessonsEmptyProps {
  courseSlug: string;
}

export function CourseLessonsEmpty({ courseSlug }: CourseLessonsEmptyProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-2xl font-bold text-primary-950">
        Henüz ders eklenmemiş
      </h1>
      <p className="mb-6 text-muted-foreground">
        Bu kurs için ders içeriği yüklenmesi devam ediyor. Eğitmen panelinde
        derslerin &quot;Yayında&quot; olduğundan emin olun.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => router.refresh()}>
          Tekrar Dene
        </Button>
        <Button asChild variant="outline">
          <Link href="/panel/kurslarim">Kurslarıma Dön</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href={`/kurslar/${courseSlug}`}>Kurs sayfasına git</Link>
        </Button>
      </div>
    </div>
  );
}
