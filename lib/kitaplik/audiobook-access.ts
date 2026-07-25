import { cache } from "react";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { LibraryBook } from "@/lib/kitaplik/types";

const BUCKET = "audiobook-files";
const SIGNED_URL_TTL_SECONDS = 3 * 60 * 60;
// Bunny pull-zone caches manifest.json for ~30d; bump when republishing if purge unavailable.
const CDN_MANIFEST_FILENAME = "manifest.v2.json";

export interface AudiobookChapterMeta {
  number: number;
  title: string;
  durationSec: number;
}

export interface AudiobookManifest {
  slug: string;
  chapterCount: number;
  totalDurationSec: number;
  chapters: AudiobookChapterMeta[];
}

export interface AudiobookChapterSource extends AudiobookChapterMeta {
  audioUrl: string;
  timingUrl: string;
}

function audiobookCdnBase(): string | null {
  const base = process.env.NEXT_PUBLIC_AUDIOBOOK_CDN_BASE_URL?.trim();
  if (!base) return null;
  return base.replace(/\/$/, "");
}

function chapterFileStem(number: number): string {
  return `chapter_${String(number).padStart(2, "0")}`;
}

function cdnObjectUrl(slug: string, filename: string): string {
  const base = audiobookCdnBase();
  if (!base) {
    throw new Error("NEXT_PUBLIC_AUDIOBOOK_CDN_BASE_URL is not set");
  }
  return `${base}/${slug}/${filename}`;
}

async function fetchCdnManifest(slug: string): Promise<AudiobookManifest | null> {
  if (!audiobookCdnBase()) return null;

  // Prefer cache-busted filename when present (Bunny edge may keep stale manifest.json).
  const candidates = [CDN_MANIFEST_FILENAME, "manifest.json"];
  for (const filename of candidates) {
    try {
      const response = await fetch(cdnObjectUrl(slug, filename), {
        next: { revalidate: 60 },
      });
      if (!response.ok) continue;
      const manifest = (await response.json()) as AudiobookManifest;
      if (!Array.isArray(manifest.chapters) || manifest.chapters.length === 0) {
        continue;
      }
      return manifest;
    } catch (error) {
      console.error("[audiobook] CDN manifest fetch failed:", slug, filename, error);
    }
  }
  return null;
}

async function fetchSupabaseManifest(
  slug: string,
): Promise<AudiobookManifest | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.storage
    .from(BUCKET)
    .download(`${slug}/manifest.json`);

  if (error || !data) {
    return null;
  }

  try {
    const manifest = JSON.parse(await data.text()) as AudiobookManifest;
    if (!Array.isArray(manifest.chapters) || manifest.chapters.length === 0) {
      return null;
    }
    return manifest;
  } catch (parseError) {
    console.error("[audiobook] manifest parse failed:", slug, parseError);
    return null;
  }
}

/** Manifest varsa kitabin sesli surumu yayinda demektir. */
export const getAudiobookManifest = cache(
  async (slug: string): Promise<AudiobookManifest | null> => {
    const fromCdn = await fetchCdnManifest(slug);
    if (fromCdn) return fromCdn;
    return fetchSupabaseManifest(slug);
  },
);

/**
 * Admin anahtari (audiobook_enabled) kapaliysa manifest yuklu olsa bile
 * sesli kitap yok sayilir. Kullanici tarafindaki tum kontroller bunu kullanmali.
 */
export async function getEnabledAudiobookManifest(
  book: Pick<LibraryBook, "slug" | "audiobook_enabled">,
): Promise<AudiobookManifest | null> {
  if (!book.audiobook_enabled) return null;
  return getAudiobookManifest(book.slug);
}

/** Cache-busted cue JSON when Bunny edge keeps stale chapter_XX.json. */
const CDN_CUES_SUFFIX_BY_SLUG: Record<string, string> = {
  "aurora-en": ".cues.v6.json",
};

/** Cache-busted audio when Bunny edge keeps stale concatenated MP3s. */
const CDN_AUDIO_SUFFIX_BY_SLUG: Record<string, string> = {
  "aurora-en": ".v2.mp3",
};

function chapterTimingFilename(slug: string, stem: string): string {
  const suffix = CDN_CUES_SUFFIX_BY_SLUG[slug];
  if (suffix) return `${stem}${suffix}`;
  return `${stem}.json`;
}

function chapterAudioFilename(slug: string, stem: string): string {
  const suffix = CDN_AUDIO_SUFFIX_BY_SLUG[slug];
  if (suffix) return `${stem}${suffix}`;
  return `${stem}.mp3`;
}

function chapterSourcesFromCdn(
  manifest: AudiobookManifest,
): AudiobookChapterSource[] {
  return manifest.chapters.map((chapter) => {
    const stem = chapterFileStem(chapter.number);
    return {
      ...chapter,
      audioUrl: cdnObjectUrl(
        manifest.slug,
        chapterAudioFilename(manifest.slug, stem),
      ),
      timingUrl: cdnObjectUrl(
        manifest.slug,
        chapterTimingFilename(manifest.slug, stem),
      ),
    };
  });
}

async function chapterSourcesFromSupabase(
  manifest: AudiobookManifest,
): Promise<AudiobookChapterSource[]> {
  const admin = getSupabaseAdmin();
  const paths = manifest.chapters.flatMap((chapter) => {
    const stem = `${manifest.slug}/${chapterFileStem(chapter.number)}`;
    return [`${stem}.mp3`, `${stem}.json`];
  });

  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    throw new Error(
      `Sesli kitap URL'leri oluşturulamadı: ${error?.message ?? "boş yanıt"}`,
    );
  }

  const urlByPath = new Map(
    data.filter((row) => row.signedUrl).map((row) => [row.path, row.signedUrl]),
  );

  return manifest.chapters.map((chapter) => {
    const stem = `${manifest.slug}/${chapterFileStem(chapter.number)}`;
    const audioUrl = urlByPath.get(`${stem}.mp3`);
    const timingUrl = urlByPath.get(`${stem}.json`);
    if (!audioUrl || !timingUrl) {
      throw new Error(`Sesli kitap dosyası eksik: ${stem}`);
    }
    return { ...chapter, audioUrl, timingUrl };
  });
}

/**
 * Yetki kontrolu cagiran tarafta yapilir.
 * CDN base ayarliysa ve manifest CDN'den geldiyse public CDN URL kullanilir;
 * aksi halde Supabase imzali URL uretilir.
 */
export async function getAudiobookChapterSources(
  manifest: AudiobookManifest,
): Promise<AudiobookChapterSource[]> {
  if (audiobookCdnBase()) {
    // Prefer CDN when configured: files live under kitaplik/{slug}/ on Bunny.
    // Entitlement remains on the /dinle page; URLs are only handed to entitled users.
    try {
      for (const filename of [CDN_MANIFEST_FILENAME, "manifest.json"]) {
        const probe = await fetch(cdnObjectUrl(manifest.slug, filename), {
          method: "HEAD",
          next: { revalidate: 60 },
        });
        if (probe.ok) {
          return chapterSourcesFromCdn(manifest);
        }
      }
    } catch {
      // Fall through to Supabase signed URLs.
    }
  }

  return chapterSourcesFromSupabase(manifest);
}
