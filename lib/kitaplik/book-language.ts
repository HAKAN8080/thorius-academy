import type { LibraryBookLanguageCode } from "@/lib/kitaplik/types";
import { toCoursesCacheLanguageDbValue } from "@/lib/instructor/courses-cache-write";

export function toLibraryBookLanguageDbValue(
  language: string | null | undefined,
): "turkish" | "english" {
  const normalized = toCoursesCacheLanguageDbValue(language);
  return normalized === "english" ? "english" : "turkish";
}

export function fromLibraryBookLanguageDbValue(
  language: string | null | undefined,
): LibraryBookLanguageCode {
  const normalized = toCoursesCacheLanguageDbValue(language);
  return normalized === "english" ? "en" : "tr";
}

export function libraryBookLanguageLabel(
  language: LibraryBookLanguageCode,
): string {
  return language === "en" ? "EN" : "TR";
}
