"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Maximize, Minimize, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EbookReaderProps {
  slug: string;
  title: string;
  watermark: string;
}

export function EbookReader({ slug, title, watermark }: EbookReaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfRef = useRef<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(
    null,
  );
  const [pageInput, setPageInput] = useState("1");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const renderPage = useCallback(async (pageNum: number) => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas) return;

    const pdfPage = await pdf.getPage(pageNum);
    const baseViewport = pdfPage.getViewport({ scale: 1 });

    const stage = stageRef.current;
    const maxHeight = Math.max((stage?.clientHeight ?? 480) - 16, 240);
    const maxWidth = Math.max((stage?.clientWidth ?? 320) - 16, 240);
    const cssScale = Math.min(
      maxHeight / baseViewport.height,
      maxWidth / baseViewport.width,
      2.5,
    );
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssViewport = pdfPage.getViewport({ scale: cssScale });
    const viewport = pdfPage.getViewport({ scale: cssScale * dpr });
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = `${cssViewport.width}px`;
    canvas.style.height = `${cssViewport.height}px`;

    await pdfPage.render({
      canvas,
      viewport,
    }).promise;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        const response = await fetch(`/api/ebook/${slug}/document`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(
            response.status === 403
              ? "Bu e-kitaba erişim yetkiniz yok."
              : "E-kitap yüklenemedi.",
          );
        }

        const buffer = await response.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: buffer }).promise;

        if (cancelled) return;

        pdfRef.current = pdf;
        setPageCount(pdf.numPages);
        setPage(1);
        setPageInput("1");
        setLoading(false);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "E-kitap açılamadı.",
          );
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (pageCount > 0 && !loading) {
      void renderPage(page);
    }
  }, [page, pageCount, loading, renderPage]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || loading) return;

    let frame = 0;
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (pdfRef.current) void renderPage(page);
      });
    });
    observer.observe(stage);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [page, loading, renderPage]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (container.requestFullscreen) {
        await container.requestFullscreen();
      }
    } catch {
      // Fullscreen not supported or blocked; ignore.
    }
  }, []);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  useEffect(() => {
    const block = (event: Event) => event.preventDefault();
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        ["c", "p", "s", "a"].includes(event.key.toLowerCase())
      ) {
        event.preventDefault();
        return;
      }
      if (event.key === "PrintScreen") {
        event.preventDefault();
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT") return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        void changePage(page - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        void changePage(page + 1);
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
  }, [page]);

  function changePage(next: number) {
    if (flipping || next < 1 || next > pageCount || next === page) return;
    setFlipDirection(next > page ? "next" : "prev");
    setFlipping(true);
    setPage(next);
    window.setTimeout(() => {
      setFlipping(false);
      setFlipDirection(null);
    }, 360);
  }

  function handlePageJump(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = Number.parseInt(pageInput, 10);
    if (Number.isNaN(parsed)) return;
    changePage(parsed);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1228] text-primary-100">
        Kitap açılıyor…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a1228] px-6 text-center text-primary-100">
        <p>{error}</p>
        <Button asChild variant="outline">
          <Link href="/kitaplarim">Kitaplarıma dön</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex h-dvh flex-col bg-[#0a1228] text-white select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-white/10 px-3 py-2 md:px-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 border-white/20 bg-transparent text-white"
            disabled={page <= 1 || flipping}
            onClick={() => changePage(page - 1)}
            aria-label="Önceki sayfa"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <form
            onSubmit={handlePageJump}
            className="flex items-center gap-1.5 text-sm text-primary-200"
          >
            <label htmlFor="ebook-page-input" className="sr-only">
              Sayfa numarası
            </label>
            <Input
              id="ebook-page-input"
              type="number"
              min={1}
              max={pageCount}
              value={pageInput}
              disabled={flipping}
              onChange={(event) => setPageInput(event.target.value)}
              className="h-8 w-14 border-white/20 bg-white/5 text-center text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="whitespace-nowrap">/ {pageCount}</span>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={flipping}
              className="h-8 border-white/20 bg-transparent px-2.5 text-white"
            >
              Git
            </Button>
          </form>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 border-white/20 bg-transparent text-white"
            disabled={page >= pageCount || flipping}
            onClick={() => changePage(page + 1)}
            aria-label="Sonraki sayfa"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="ml-1 h-8 w-8 border-white/20 bg-transparent text-white md:ml-2"
            onClick={() => void toggleFullscreen()}
            aria-label={isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>

          <Button
            asChild
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white"
          >
            <Link href="/kitaplarim" aria-label="Kapat">
              <X className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <div
        ref={stageRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2 md:p-3"
      >
        <button
          type="button"
          className="absolute inset-y-0 left-0 z-10 w-1/5 cursor-pointer bg-transparent md:w-[15%]"
          aria-label="Önceki sayfa"
          disabled={page <= 1 || flipping}
          onClick={() => changePage(page - 1)}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 z-10 w-1/5 cursor-pointer bg-transparent md:w-[15%]"
          aria-label="Sonraki sayfa"
          disabled={page >= pageCount || flipping}
          onClick={() => changePage(page + 1)}
        />

        <div
          className={`relative overflow-hidden rounded-lg shadow-2xl ${
            flipping && flipDirection === "next"
              ? "ebook-page-turn-next"
              : flipping && flipDirection === "prev"
                ? "ebook-page-turn-prev"
                : ""
          }`}
          style={{ transformStyle: "preserve-3d", perspective: "1200px" }}
        >
          <canvas ref={canvasRef} className="block bg-white" draggable={false} />
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.12]"
            aria-hidden
          >
            <p
              className="rotate-[-24deg] text-center text-sm font-semibold uppercase tracking-widest text-primary-900 md:text-base"
              style={{ textShadow: "0 0 1px rgba(0,0,0,0.2)" }}
            >
              {watermark}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
