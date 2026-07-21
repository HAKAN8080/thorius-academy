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

  const chapter = chapters[chapterIdx];
  const playbackRate = PLAYBACK_RATES[rateIdx];

  function chapterLabel(number: number, chapterTitle: string) {
    return `${number} \u2014 ${chapterTitle}`;
  }

  // Bolum degisince otomatik baslat
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(0);
    setDuration(0);

    let cancelled = false;
    const tryPlay = () => {
      if (cancelled) return;
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

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const goToChapter = useCallback(
    (index: number) => {
      if (index < 0 || index >= chapters.length) return;
      setChapterIdx(index);
    },
    [chapters.length],
  );

  const onEnded = useCallback(() => {
    if (chapterIdx + 1 < chapters.length) {
      setChapterIdx(chapterIdx + 1);
    } else {
      setIsPlaying(false);
    }
  }, [chapterIdx, chapters.length]);

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
              onClick={() => setRateIdx((rateIdx + 1) % PLAYBACK_RATES.length)}
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
        autoPlay
        preload="auto"
        src={chapter.audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onEnded={onEnded}
        className="hidden"
      />
    </div>
  );
}
