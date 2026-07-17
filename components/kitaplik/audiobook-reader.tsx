"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { AudiobookChapterSource } from "@/lib/kitaplik/audiobook-access";

interface AudiobookReaderProps {
  slug: string;
  title: string;
  chapters: AudiobookChapterSource[];
}

interface TimedWord {
  word: string;
  startMs: number;
  durationMs: number;
}

interface ChapterTiming {
  chapter: number;
  title: string;
  text: string;
  words: TimedWord[];
}

function coreOf(value: string): string {
  // u-flag regex literali es5 hedefinde derlenmiyor; constructor kullan.
  const pattern = new RegExp("[^\\p{L}\\p{N}]", "gu");
  return (value || "").toLowerCase().replace(pattern, "");
}

function findWordAtTime(words: TimedWord[], t: number): number {
  if (!words.length) return -1;
  let lo = 0;
  let hi = words.length - 1;
  let ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (words[mid].startMs <= t) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}

/**
 * Sayfalanmis bolum: her sayfa, paragraf parcalarindan olusur. Her parca
 * kelime dizisidir; timedIndex >= 0 ise zamanlanmis kelimeye baglanir.
 */
interface PageChunk {
  text: string;
  timedIndex: number; // -1 => duz metin
  paragraphStart: boolean;
}

type BookPage = PageChunk[];

/** Orijinal metni zamanlanmis kelimelerle hizalar (noktalama korunur). */
function buildChunks(timing: ChapterTiming): PageChunk[] {
  const words = timing.words;
  const chunks: PageChunk[] = [];
  const paragraphs = timing.text.split(/\n\s*\n/);
  let ti = 0;

  const skipPunctTimed = () => {
    while (ti < words.length && !coreOf(words[ti].word)) {
      ti += 1;
    }
  };

  const consumeIntro = (tokens: string[]) => {
    let pendingCore = "";
    for (const tok of tokens) {
      skipPunctTimed();
      if (ti >= words.length) break;
      const tokCore = coreOf(tok);
      if (!tokCore) continue;
      const target = coreOf(words[ti].word);
      pendingCore += tokCore;
      if (pendingCore === target) {
        ti += 1;
        pendingCore = "";
      } else if (!target.startsWith(pendingCore)) {
        pendingCore = "";
      }
    }
    skipPunctTimed();
  };

  // Ilk paragraf konusulan "Chapter N. Title." girisidir; baslik sayfada
  // zaten gorunur, o yuzden metne basilmaz ama zamanlanmis kelimeleri tuketilir.
  if (paragraphs.length > 1) {
    consumeIntro(paragraphs.shift()!.split(/\s+/).filter(Boolean));
  }

  for (const para of paragraphs) {
    const tokens = para.split(/\s+/).filter(Boolean);
    let pending: string[] = [];
    let pendingCore = "";
    let paragraphStart = true;

    const flush = (matched: boolean) => {
      if (!pending.length) return;
      chunks.push({
        text: pending.join(" "),
        timedIndex: matched && ti < words.length ? ti : -1,
        paragraphStart,
      });
      if (matched && ti < words.length) ti += 1;
      paragraphStart = false;
      pending = [];
      pendingCore = "";
    };

    for (const tok of tokens) {
      const tokCore = coreOf(tok);

      // Saf noktalama (ornek: "/") — TTS de ayri WordBoundary uretebilir.
      if (!tokCore) {
        if (pending.length) {
          skipPunctTimed();
          const target = ti < words.length ? coreOf(words[ti].word) : null;
          flush(Boolean(target) && pendingCore === target);
        }
        let timedIndex = -1;
        if (ti < words.length && !coreOf(words[ti].word)) {
          timedIndex = ti;
          ti += 1;
        }
        chunks.push({ text: tok, timedIndex, paragraphStart });
        paragraphStart = false;
        continue;
      }

      skipPunctTimed();
      const target = ti < words.length ? coreOf(words[ti].word) : null;
      pending.push(tok);
      pendingCore += tokCore;
      if (!target) flush(false);
      else if (pendingCore === target) flush(true);
      else if (!target.startsWith(pendingCore)) flush(false);
    }

    skipPunctTimed();
    flush(
      Boolean(pendingCore) &&
        ti < words.length &&
        coreOf(words[ti].word) === pendingCore,
    );
  }

  return chunks;
}

export function AudiobookReader({ slug, title, chapters }: AudiobookReaderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const measureContentRef = useRef<HTMLDivElement | null>(null);

  const [chapterIdx, setChapterIdx] = useState(0);
  const [timing, setTiming] = useState<ChapterTiming | null>(null);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [wordPage, setWordPage] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeWord, setActiveWord] = useState(-1);
  const [flip, setFlip] = useState<"" | "out" | "in" | "back-out" | "back-in">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chapter = chapters[chapterIdx];

  function chapterLabel(number: number, chapterTitle: string) {
    return `${number} \u2014 ${chapterTitle}`;
  }

  // Bolum degisince zamanlama verisini indir
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setTiming(null);
    setPages([]);
    setActiveWord(-1);
    setCurrentPage(0);

    fetch(chapter.timingUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Zamanlama verisi al\u0131namad\u0131.");
        return res.json();
      })
      .then((data: ChapterTiming) => {
        if (!cancelled) setTiming(data);
      })
      .catch(() => {
        if (!cancelled) setError("B\u00f6l\u00fcm y\u00fcklenemedi. Sayfay\u0131 yenileyin.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chapter]);

  // Dinle sayfasina girince / bolum degisince otomatik baslat
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let cancelled = false;
    const tryPlay = () => {
      if (cancelled) return;
      void audio.play().catch(() => {
        // Tarayici autoplay engellerse kullanici controls'tan baslatir.
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

  // Secme / kopyalama engeli (e-kitap okuyucu ile ayni)
  useEffect(() => {
    const block = (event: Event) => event.preventDefault();
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        ["c", "p", "s", "a"].includes(event.key.toLowerCase())
      ) {
        event.preventDefault();
      }
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Sayfalama: gizli olcum kutusuna parca parca doldurup tasma noktalarini bul
  const paginate = useCallback(() => {
    if (!timing) return;
    const measure = measureRef.current;
    const content = measureContentRef.current;
    if (!measure || !content) return;

    const chunks = buildChunks(timing);
    const result: BookPage[] = [];
    const pageOfWord: number[] = new Array(timing.words.length).fill(-1);

    content.innerHTML = "";
    let currentP: HTMLParagraphElement | null = null;
    let pageChunks: PageChunk[] = [];

    const overflows = () => measure.scrollHeight > measure.clientHeight;

    const startPage = () => {
      content.innerHTML = "";
      pageChunks = [];
      currentP = null;
    };

    for (const chunk of chunks) {
      if (chunk.paragraphStart || !currentP) {
        currentP = document.createElement("p");
        currentP.className = "mb-[1em]";
        content.appendChild(currentP);
      }
      const span = document.createElement("span");
      span.textContent = chunk.text + " ";
      currentP.appendChild(span);

      if (overflows()) {
        currentP.removeChild(span);
        if (!currentP.hasChildNodes()) currentP.remove();
        result.push(pageChunks);
        startPage();
        currentP = document.createElement("p");
        currentP.className = "mb-[1em]";
        content.appendChild(currentP);
        currentP.appendChild(span);
        pageChunks.push({ ...chunk, paragraphStart: true });
      } else {
        pageChunks.push(chunk);
      }

      if (chunk.timedIndex >= 0) {
        pageOfWord[chunk.timedIndex] = result.length;
      }
    }
    if (pageChunks.length) result.push(pageChunks);
    content.innerHTML = "";

    // Eslestirilmeyen timed kelimeler 0'da kalmasin — onceki sayfayi ileri doldur.
    let lastPage = 0;
    for (let i = 0; i < pageOfWord.length; i += 1) {
      if (pageOfWord[i] >= 0) lastPage = pageOfWord[i];
      else pageOfWord[i] = lastPage;
    }

    setPages(result);
    setWordPage(pageOfWord);
    setCurrentPage((prev) => {
      if (!result.length) return 0;
      if (prev >= result.length) return result.length - 1;
      return prev;
    });
  }, [timing]);

  useEffect(() => {
    paginate();
  }, [paginate]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(paginate, 250);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [paginate]);

  const flipTo = useCallback(
    (target: number, backward: boolean) => {
      if (flip || target === currentPage || target < 0 || target >= pages.length) {
        return;
      }
      setFlip(backward ? "back-out" : "out");
      window.setTimeout(() => {
        setCurrentPage(target);
        setFlip(backward ? "back-in" : "in");
        window.setTimeout(() => setFlip(""), 420);
      }, 380);
    },
    [flip, currentPage, pages.length],
  );

  // Kelime takibi
  useEffect(() => {
    const interval = window.setInterval(() => {
      const audio = audioRef.current;
      if (!audio || audio.paused || !timing?.words.length) return;
      const t = audio.currentTime * 1000;
      const idx = findWordAtTime(timing.words, t);
      if (idx < 0) return;

      if (idx !== activeWord) {
        setActiveWord(idx);
        const target = wordPage[idx] ?? currentPage;
        if (target !== currentPage) flipTo(target, target < currentPage);
      }
    }, 90);
    return () => window.clearInterval(interval);
  }, [timing, activeWord, wordPage, currentPage, flipTo]);

  const seekToWord = useCallback(
    (timedIndex: number) => {
      const audio = audioRef.current;
      if (!audio || !timing) return;
      const seconds = timing.words[timedIndex].startMs / 1000;
      const doSeek = () => {
        audio.currentTime = seconds;
        void audio.play();
      };
      if (audio.readyState >= 1) doSeek();
      else {
        audio.addEventListener("loadedmetadata", doSeek, { once: true });
        audio.load();
      }
    },
    [timing],
  );

  // Bolum bitince sonrakine gec
  const onEnded = useCallback(() => {
    if (chapterIdx + 1 < chapters.length) {
      setChapterIdx(chapterIdx + 1);
      window.setTimeout(() => void audioRef.current?.play(), 600);
    }
  }, [chapterIdx, chapters.length]);

  const flipClass =
    flip === "out"
      ? "animate-[bookTurnOut_0.38s_ease-in_forwards]"
      : flip === "in"
        ? "animate-[bookTurnIn_0.4s_ease-out_forwards]"
        : flip === "back-out"
          ? "animate-[bookTurnBackOut_0.32s_ease-in_forwards]"
          : flip === "back-in"
            ? "animate-[bookTurnBackIn_0.38s_ease-out_forwards]"
            : "";

  const pageChunks = pages[currentPage] ?? [];

  return (
    <div
      className="min-h-screen select-none bg-[radial-gradient(ellipse_at_50%_-20%,#fff8ea_0%,transparent_60%),linear-gradient(160deg,#e7dbc6_0%,#d8c9ae_100%)] text-[#3a3049]">
      <style>{`
        @keyframes bookTurnOut { to { transform: rotateY(-76deg); opacity: 0.25; } }
        @keyframes bookTurnIn { from { transform: rotateY(38deg); opacity: 0; } to { transform: rotateY(0); opacity: 1; } }
        @keyframes bookTurnBackOut { to { transform: rotateY(38deg); opacity: 0; } }
        @keyframes bookTurnBackIn { from { transform: rotateY(-76deg); opacity: 0.25; } to { transform: rotateY(0); opacity: 1; } }
      `}</style>

      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b-2 border-[#e5d9c3] bg-[#fffdf9]/95 px-4 py-3 md:px-6">
        <Link
          href={`/kitap/${slug}`}
          aria-label={"Kitaba geri d\u00f6n"}
          className="rounded-full p-2 text-[#7c2d4e] transition hover:bg-[#f5e6da]"
        >
          <X className="h-5 w-5" />
        </Link>
        <h1 className="mr-2 font-serif text-base font-bold md:text-lg">{title}</h1>
        <select
          value={chapterIdx}
          onChange={(event) => setChapterIdx(Number(event.target.value))}
          className="select-text rounded-lg border border-[#d9cbb8] bg-white px-3 py-1.5 text-sm"
        >
          {chapters.map((item, index) => (
            <option key={item.number} value={index}>
              {chapterLabel(item.number, item.title)}
            </option>
          ))}
        </select>
        <audio
          ref={audioRef}
          controls
          autoPlay
          preload="auto"
          src={chapter.audioUrl}
          onEnded={onEnded}
          className="h-9 min-w-[200px] flex-1"
        />
      </header>

      <div className="flex items-center justify-center gap-3 px-2 py-8 md:gap-5 md:py-10">
        <button
          type="button"
          onClick={() => flipTo(currentPage - 1, true)}
          disabled={currentPage === 0 || Boolean(flip)}
          aria-label={"\u00d6nceki sayfa"}
          className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#fffdf6]/90 text-[#7c2d4e] shadow-md transition disabled:opacity-30"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="relative w-[min(880px,88vw)] [perspective:2200px]">
          {/* cilt sirti */}
          <div className="absolute -left-4 -top-1 bottom-[-4px] w-6 rounded-l-lg bg-gradient-to-r from-[#8a5d3b] via-[#a97a52] to-[#7e522f] shadow-[inset_-3px_0_6px_rgba(0,0,0,0.35),-4px_6px_14px_rgba(90,70,40,0.4)]" />
          {/* yaprak kenarlari */}
          <div className="absolute -right-[7px] bottom-1.5 top-1.5 w-[7px] rounded-r-md bg-[repeating-linear-gradient(to_right,#e8dfcc_0_1px,#fffdf6_1px_2.4px)] shadow-[3px_4px_10px_rgba(90,70,40,0.35)]" />

          <div
            className={`relative h-[min(72vh,740px)] origin-left overflow-hidden rounded-r-[10px] rounded-l bg-[radial-gradient(ellipse_at_30%_20%,#fffdf8_0%,#fdfaf3_70%)] px-7 pb-14 pt-8 shadow-[0_14px_34px_rgba(90,70,40,0.30)] [backface-visibility:hidden] md:px-16 md:pt-12 ${flipClass}`}
          >
            {currentPage === 0 ? (
              <h2 className="mb-5 text-center font-serif text-xl font-bold text-[#7c2d4e] md:text-2xl">
                {chapterLabel(chapter.number, chapter.title)}
              </h2>
            ) : null}

            <div className="font-serif text-lg leading-[1.85] md:text-[22px]" style={{ userSelect: "none", WebkitUserSelect: "none" }}>
              {loading ? <p className="text-[#a08a68]">{"Y\u00fckleniyor\u2026"}</p> : null}
              {error ? <p className="text-red-700">{error}</p> : null}
              {(() => {
                const rendered: React.ReactNode[] = [];
                let para: React.ReactNode[] = [];
                let key = 0;
                const flushPara = () => {
                  if (para.length) {
                    rendered.push(
                      <p key={`p-${key++}`} className="mb-[1em]">
                        {para}
                      </p>,
                    );
                    para = [];
                  }
                };
                for (const chunk of pageChunks) {
                  if (chunk.paragraphStart) flushPara();
                  if (chunk.timedIndex >= 0) {
                    const idx = chunk.timedIndex;
                    para.push(
                      <span
                        key={`w-${key++}`}
                        onClick={() => seekToWord(idx)}
                        className={`cursor-pointer rounded-md px-0.5 transition-colors duration-100 hover:bg-[#f9e3ea] ${
                          activeWord === idx
                            ? "bg-[#f5b8c9] text-[#7c2d4e]"
                            : ""
                        }`}
                      >
                        {chunk.text}
                      </span>,
                    );
                    para.push(" ");
                  } else {
                    para.push(chunk.text + " ");
                  }
                }
                flushPara();
                return rendered;
              })()}
            </div>

            <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-[#a08a68]">
              {pages.length ? `${currentPage + 1} / ${pages.length}` : ""}
            </div>
          </div>

          {/* gizli olcum sayfasi - gercek sayfayla ayni metrikler */}
          <div
            ref={measureRef}
            aria-hidden="true"
            className="pointer-events-none invisible absolute left-0 top-0 h-[min(72vh,740px)] w-full overflow-hidden rounded-r-[10px] rounded-l px-7 pb-14 pt-8 md:px-16 md:pt-12"
          >
            <h2 className="mb-5 text-center font-serif text-xl font-bold md:text-2xl">
              {chapterLabel(chapter.number, chapter.title)}
            </h2>
            <div
              ref={measureContentRef}
              className="font-serif text-lg leading-[1.85] md:text-[22px]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => flipTo(currentPage + 1, false)}
          disabled={currentPage >= pages.length - 1 || Boolean(flip)}
          aria-label="Sonraki sayfa"
          className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#fffdf6]/90 text-[#7c2d4e] shadow-md transition disabled:opacity-30"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
