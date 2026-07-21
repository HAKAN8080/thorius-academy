"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import type { AudiobookChapterSource } from "@/lib/kitaplik/audiobook-access";

interface AudiobookReaderProps {
  slug: string;
  title: string;
  coverImageUrl: string | null;
  chapters: AudiobookChapterSource[];
}

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5];

const PROGRESS_STORAGE_VERSION = 1;
const PROGRESS_SAVE_INTERVAL_MS = 4000;
// Bolum sonuna cok yakin kaydedilmis konumu biraz geriye cekerek
// "ac -> hemen bitti -> tekrar ac" dongusunu engeller.
const END_CLAMP_SECONDS = 2;

interface SavedProgress {
  version: number;
  chapterNumber: number;
  chapterIndex: number;
  currentTime: number;
  playbackRate: number;
  updatedAt: string;
}

function progressStorageKey(slug: string): string {
  return `thorius:audiobook-progress:${slug}`;
}

function readSavedProgress(slug: string): SavedProgress | null {
  try {
    const raw = window.localStorage.getItem(progressStorageKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    if (
      parsed.version !== PROGRESS_STORAGE_VERSION ||
      typeof parsed.chapterNumber !== "number" ||
      typeof parsed.chapterIndex !== "number" ||
      typeof parsed.currentTime !== "number" ||
      !Number.isFinite(parsed.currentTime)
    ) {
      return null;
    }
    return parsed as SavedProgress;
  } catch {
    return null;
  }
}

function clearSavedProgress(slug: string) {
  try {
    window.localStorage.removeItem(progressStorageKey(slug));
  } catch {
    // localStorage kullanilamiyorsa sessizce gec.
  }
}

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const whole = Math.floor(totalSeconds);
  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function AudiobookReader({
  slug,
  title,
  coverImageUrl,
  chapters,
}: AudiobookReaderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [chapterIdx, setChapterIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rateIdx, setRateIdx] = useState(1);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);

  const chapterIdxRef = useRef(chapterIdx);
  const playbackRateRef = useRef(PLAYBACK_RATES[rateIdx]);
  const pendingSeekRef = useRef<{ chapterIndex: number; time: number } | null>(
    null,
  );
  const suppressAutoplayRef = useRef(false);
  const lastSaveAtRef = useRef(0);
  const didRestoreRef = useRef(false);
  // Kitap tamamen bittiginde true olur; kapanis kayitlarinin
  // temizlenen ilerlemeyi "sonda kaldi" diye geri yazmasini engeller.
  const finishedRef = useRef(false);

  const chapter = chapters[chapterIdx];
  const playbackRate = PLAYBACK_RATES[rateIdx];

  useEffect(() => {
    chapterIdxRef.current = chapterIdx;
  }, [chapterIdx]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  function chapterLabel(number: number, chapterTitle: string) {
    return `${number} \u2014 ${chapterTitle}`;
  }

  const writeProgress = useCallback(
    (chapterIndex: number, time: number) => {
      const target = chapters[chapterIndex];
      if (!target) return;
      try {
        const payload: SavedProgress = {
          version: PROGRESS_STORAGE_VERSION,
          chapterNumber: target.number,
          chapterIndex,
          currentTime: Math.max(0, Number.isFinite(time) ? time : 0),
          playbackRate: playbackRateRef.current,
          updatedAt: new Date().toISOString(),
        };
        window.localStorage.setItem(
          progressStorageKey(slug),
          JSON.stringify(payload),
        );
      } catch {
        // localStorage dolu veya kullanilamiyor; oynatmayi etkilemesin.
      }
    },
    [chapters, slug],
  );

  // Anlik konumu kaydeder. Kayitli konum henuz geri yuklenmediyse
  // (pending seek varken) 0 saniyeyle uzerine yazmamak icin atlar.
  const saveCurrentPosition = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || pendingSeekRef.current || finishedRef.current) return;
    writeProgress(chapterIdxRef.current, audio.currentTime);
  }, [writeProgress]);

  // Bekleyen geri yukleme konumunu, sure bilgisi hazir olunca uygular.
  const applyPendingSeek = useCallback((audio: HTMLAudioElement) => {
    const pending = pendingSeekRef.current;
    if (!pending || pending.chapterIndex !== chapterIdxRef.current) return;
    pendingSeekRef.current = null;
    let target = pending.time;
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      target = Math.min(
        Math.max(0, target),
        Math.max(0, audio.duration - END_CLAMP_SECONDS),
      );
    } else if (!Number.isFinite(target) || target < 0) {
      target = 0;
    }
    if (target > 0) {
      audio.currentTime = target;
      setCurrentTime(target);
    }
  }, []);

  // Acilista kayitli ilerlemeyi geri yukle (bolum + saniye + hiz).
  useEffect(() => {
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;

    const saved = readSavedProgress(slug);
    if (!saved) return;

    let index = chapters.findIndex(
      (item) => item.number === saved.chapterNumber,
    );
    if (index < 0 && saved.chapterIndex >= 0 && saved.chapterIndex < chapters.length) {
      index = saved.chapterIndex;
    }
    if (index < 0) return;

    const time = Math.max(0, saved.currentTime);
    // Ilk bolumun en basi = kayda deger ilerleme yok; normal davranisi koru.
    if (index === 0 && time < 1) return;

    const savedRateIdx = PLAYBACK_RATES.indexOf(saved.playbackRate);
    if (savedRateIdx >= 0) setRateIdx(savedRateIdx);

    suppressAutoplayRef.current = true;
    pendingSeekRef.current = { chapterIndex: index, time };
    setChapterIdx(index);
    setCurrentTime(time);
    setResumeNotice(
      `Kald\u0131\u011f\u0131n\u0131z yer: B\u00f6l\u00fcm ${chapters[index].number} \u00b7 ${formatTime(time)}`,
    );

    // Ayni bolume donuluyorsa ve ses zaten yuklendiyse konumu hemen uygula.
    const audio = audioRef.current;
    if (audio && index === chapterIdxRef.current && audio.readyState >= 1) {
      chapterIdxRef.current = index;
      applyPendingSeek(audio);
    }
  }, [slug, chapters, applyPendingSeek]);

  // Bolum degisince otomatik baslat (geri yukleme sirasinda baslatma;
  // mobil tarayicilar engeller, kullanici oynat dugmesine basar).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(
      pendingSeekRef.current?.chapterIndex === chapterIdxRef.current
        ? pendingSeekRef.current.time
        : 0,
    );
    setDuration(0);

    let cancelled = false;
    const tryPlay = () => {
      if (cancelled || suppressAutoplayRef.current) return;
      void audio.play().catch(() => {
        // Tarayici autoplay engellerse kullanici oynat dugmesiyle baslatir.
      });
    };

    if (audio.readyState >= 2) {
      tryPlay();
    } else {
      audio.addEventListener("canplay", tryPlay, { once: true });
    }

    return () => {
      cancelled = true;
      audio.removeEventListener("canplay", tryPlay);
    };
  }, [chapter.audioUrl]);

  // Hiz secimi bolum degisiminde de korunur
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = playbackRate;
  }, [playbackRate, chapter.audioUrl]);

  // Sayfa kapanirken / gizlenirken ve bilesen sokulurken son konumu kaydet.
  useEffect(() => {
    window.addEventListener("pagehide", saveCurrentPosition);
    window.addEventListener("beforeunload", saveCurrentPosition);
    return () => {
      window.removeEventListener("pagehide", saveCurrentPosition);
      window.removeEventListener("beforeunload", saveCurrentPosition);
      saveCurrentPosition();
    };
  }, [saveCurrentPosition]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    suppressAutoplayRef.current = false;
    finishedRef.current = false;
    if (audio.paused) void audio.play();
    else audio.pause();
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    // Kullanicinin elle yaptigi arama, bekleyen geri yuklemeyi gecersiz kilar.
    pendingSeekRef.current = null;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const goToChapter = useCallback(
    (index: number) => {
      if (index < 0 || index >= chapters.length) return;
      suppressAutoplayRef.current = false;
      finishedRef.current = false;
      pendingSeekRef.current = null;
      setResumeNotice(null);
      writeProgress(index, 0);
      setChapterIdx(index);
    },
    [chapters.length, writeProgress],
  );

  const onEnded = useCallback(() => {
    if (chapterIdx + 1 < chapters.length) {
      writeProgress(chapterIdx + 1, 0);
      setChapterIdx(chapterIdx + 1);
    } else {
      // Kitap bitti: kaydi temizle ki tekrar acilista bastan baslasin.
      finishedRef.current = true;
      clearSavedProgress(slug);
      setIsPlaying(false);
    }
  }, [chapterIdx, chapters.length, slug, writeProgress]);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_50%_-20%,#fff8ea_0%,transparent_60%),linear-gradient(160deg,#e7dbc6_0%,#d8c9ae_100%)] text-[#3a3049]">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b-2 border-[#e5d9c3] bg-[#fffdf9]/95 px-4 py-3 md:px-6">
        <Link
          href={`/kitap/${slug}`}
          aria-label={"Kitaba geri d\u00f6n"}
          className="rounded-full p-2 text-[#7c2d4e] transition hover:bg-[#f5e6da]"
        >
          <X className="h-5 w-5" />
        </Link>
        <h1 className="truncate font-serif text-base font-bold md:text-lg">
          {title}
        </h1>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-[#e5d9c3] bg-[#fffdf9]/90 p-6 shadow-[0_14px_34px_rgba(90,70,40,0.25)] md:p-8">
          <div className="flex flex-col items-center gap-5">
            <div className="h-48 w-36 overflow-hidden rounded-xl shadow-[0_10px_24px_rgba(90,70,40,0.35)] md:h-56 md:w-40">
              {coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImageUrl}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#7c2d4e] to-[#3a3049] p-3 text-center font-serif text-sm font-bold text-[#fffdf9]">
                  {title}
                </div>
              )}
            </div>

            <div className="w-full text-center">
              <p className="font-serif text-lg font-bold text-[#7c2d4e]">
                {title}
              </p>
              <select
                value={chapterIdx}
                onChange={(event) => goToChapter(Number(event.target.value))}
                aria-label={"B\u00f6l\u00fcm se\u00e7"}
                className="mt-3 w-full rounded-lg border border-[#d9cbb8] bg-white px-3 py-2 text-sm"
              >
                {chapters.map((item, index) => (
                  <option key={item.number} value={index}>
                    {chapterLabel(item.number, item.title)}
                  </option>
                ))}
              </select>
              {resumeNotice ? (
                <p className="mt-2 text-xs font-medium text-[#7c2d4e]/80">
                  {resumeNotice}
                </p>
              ) : null}
            </div>

            <div className="w-full">
              <input
                type="range"
                min={0}
                max={duration || chapter.durationSec || 0}
                step={1}
                value={Math.min(currentTime, duration || chapter.durationSec || 0)}
                onChange={(event) => seekTo(Number(event.target.value))}
                aria-label={"Konum"}
                className="w-full accent-[#7c2d4e]"
              />
              <div className="mt-1 flex justify-between text-xs text-[#a08a68]">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || chapter.durationSec || 0)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => goToChapter(chapterIdx - 1)}
                disabled={chapterIdx === 0}
                aria-label={"\u00d6nceki b\u00f6l\u00fcm"}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5e6da] text-[#7c2d4e] transition hover:bg-[#f0dcc9] disabled:opacity-30"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Duraklat" : "Oynat"}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-[#7c2d4e] text-[#fffdf9] shadow-md transition hover:bg-[#8f3a5e]"
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7" />
                ) : (
                  <Play className="ml-1 h-7 w-7" />
                )}
              </button>
              <button
                type="button"
                onClick={() => goToChapter(chapterIdx + 1)}
                disabled={chapterIdx >= chapters.length - 1}
                aria-label={"Sonraki b\u00f6l\u00fcm"}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5e6da] text-[#7c2d4e] transition hover:bg-[#f0dcc9] disabled:opacity-30"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setRateIdx((rateIdx + 1) % PLAYBACK_RATES.length);
                // Hiz tercihi de kayitta tutulsun.
                window.setTimeout(saveCurrentPosition, 0);
              }}
              aria-label={"Oynatma h\u0131z\u0131"}
              className="rounded-full border border-[#d9cbb8] bg-white px-4 py-1.5 text-sm font-medium text-[#7c2d4e] transition hover:bg-[#f5e6da]"
            >
              {playbackRate}x
            </button>
          </div>
        </div>
      </main>

      <audio
        ref={audioRef}
        preload="auto"
        src={chapter.audioUrl}
        onPlay={() => {
          setIsPlaying(true);
          setResumeNotice(null);
        }}
        onPause={() => {
          setIsPlaying(false);
          saveCurrentPosition();
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
          const now = Date.now();
          if (now - lastSaveAtRef.current >= PROGRESS_SAVE_INTERVAL_MS) {
            lastSaveAtRef.current = now;
            saveCurrentPosition();
          }
        }}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
          applyPendingSeek(event.currentTarget);
        }}
        onEnded={onEnded}
        className="hidden"
      />
    </div>
  );
}
