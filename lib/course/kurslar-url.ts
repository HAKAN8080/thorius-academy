import type { CourseLanguageCode } from "@/lib/course/course-language";

export function buildKurslarUrl(options?: {
  page?: number;
  categorySlug?: string;
  search?: string;
  language?: CourseLanguageCode;
}): string {
  const params = new URLSearchParams();

  if (options?.categorySlug) {
    params.set("kategori", options.categorySlug);
  }

  if (options?.language) {
    params.set("dil", options.language);
  }

  const search = options?.search?.trim();
  if (search) {
    params.set("ara", search);
  }

  if (options?.page && options.page > 1) {
    params.set("sayfa", String(options.page));
  }

  const query = params.toString();
  return query ? `/kurslar?${query}` : "/kurslar";
}

export function parseKurslarPage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function parseKurslarSearch(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function parseKurslarLanguage(
  value: string | undefined,
): CourseLanguageCode | undefined {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "tr" || normalized === "turkce" || normalized === "türkçe") {
    return "tr";
  }
  if (normalized === "en" || normalized === "english" || normalized === "ingilizce") {
    return "en";
  }
  return undefined;
}
