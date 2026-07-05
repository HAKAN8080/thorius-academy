"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EbookReaderProps {
  slug: string;
  title: string;
  watermark: string;
}

const WATERMARK_POSITIONS = [
  { x: 0.28, y: 0.22 },
  { x: 0.52, y: 0.5 },
  { x: 0.34, y: 0.76 },
] as const;

function drawWatermark(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
) {
  const fontSize = Math.round(Math.min(width, height) * 0.16);
  const label = text.toUpperCase();

  context.save();
  context.globalAlpha = 0.14;
  context.fillStyle = "#0a1228";
  context.font = `700 ${fontSize}px Georgia, "Times New Roman", serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  for (const position of WATERMARK_POSITIONS) {
    context.save();
    context.translate(width * position.x, height * position.y);
    context.rotate((-24 * Math.PI) / 180);
    context.fillText(label, 0, 0);
    context.restore();
  }

  context.restore();
}

export function EbookReader({ slug, title, watermark }: EbookReaderProps) {
  const frontCanvasRef = useRef<HTMLCanvasElement>(null!);
  const backCanvasRef = useRef<HTMLCanvasElement>(null!);
  const flipInnerRef = useRef<HTMLDivElement | null>(null);
  const pdfRef = useRef<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [pageInput, setPageInput] = useState("1");

  const renderPageTo = useCallback(
    async (canvas: HTMLCanvasElement | null, pageNum: number) => {
      const pdf = pdfRef.current;
      if (!pdf || !canvas) return;

      const pdfPage = await pdf.getPage(pageNum);
      const viewport = pdfPage.getViewport({ scale: 1.35 });
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await pdfPage.render({
        canvas,
        viewport,
      }).promise;

      drawWatermark(context, viewport.width, viewport.height, watermark);
    },
    [watermark],
  );

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
        await renderPageTo(frontCanvasRef.current, 1);
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
  }, [renderPageTo, slug]);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const finishFlip = useCallback(
    async (targetPage: number) => {
      await renderPageTo(frontCanvasRef.current, targetPage);
      setPage(targetPage);
      setFlipping(false);
      if (flipInnerRef.current) {
        flipInnerRef.current.style.transition = "none";
        flipInnerRef.current.classList.remove(
          "ebook-flip-inner--forward",
          "ebook-flip-inner--backward",
        );
        void flipInnerRef.current.offsetWidth;
        flipInnerRef.current.style.transition = "";
      }
    },
    [renderPageTo],
  );

  const turnToPage = useCallback(
    async (targetPage: number) => {
      if (
        flipping ||
        targetPage < 1 ||
        targetPage > pageCount ||
        targetPage === page
      ) {
        return;
      }

      const forward = targetPage > page;
      setFlipping(true);

      await renderPageTo(backCanvasRef.current, targetPage);

      const inner = flipInnerRef.current;
      if (!inner) {
        setPage(targetPage);
        await renderPageTo(frontCanvasRef.current, targetPage);
        setFlipping(false);
        return;
      }

      const onTransitionEnd = (event: TransitionEvent) => {
        if (event.propertyName !== "transform") return;
        inner.removeEventListener("transitionend", onTransitionEnd);
        void finishFlip(targetPage);
      };

      inner.addEventListener("transitionend", onTransitionEnd);
      inner.classList.add(
        forward ? "ebook-flip-inner--forward" : "ebook-flip-inner--backward",
      );
    },
    [finishFlip, flipping, page, pageCount, renderPageTo],
  );

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
        void turnToPage(page - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        void turnToPage(page + 1);
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
  }, [page, turnToPage]);

  function handlePageJump(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = Number.parseInt(pageInput, 10);
    if (Number.isNaN(parsed)) return;
    void turnToPage(parsed);
  }

  function PageCanvas({
    canvasRef,
  }: {
    canvasRef: React.RefObject<HTMLCanvasElement>;
  }) {
    return (
      <canvas
        ref={canvasRef}
        className="block max-h-[calc(100vh-9rem)] w-auto max-w-full bg-white"
        draggable={false}
      />
    );
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
      className="relative flex min-h-screen flex-col bg-[#0a1228] text-white select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="text-xs text-primary-300">
            Sayfa {page} / {pageCount}
          </p>
        </div>
        <Button asChild size="sm" variant="ghost" className="text-white">
          <Link href="/kitaplarim">
            <X className="mr-1 h-4 w-4" />
            Kapat
          </Link>
        </Button>
      </header>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4 md:p-8">
        <button
          type="button"
          className="absolute inset-y-0 left-0 z-10 w-1/4 cursor-pointer bg-transparent md:w-[18%]"
          aria-label="Önceki sayfa"
          disabled={page <= 1 || flipping}
          onClick={() => void turnToPage(page - 1)}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 z-10 w-1/4 cursor-pointer bg-transparent md:w-[18%]"
          aria-label="Sonraki sayfa"
          disabled={page >= pageCount || flipping}
          onClick={() => void turnToPage(page + 1)}
        />

        <div className="ebook-flip-scene max-h-[calc(100vh-9rem)] rounded-lg shadow-2xl">
          <div ref={flipInnerRef} className="ebook-flip-inner">
            <div className="ebook-flip-face">
              <PageCanvas canvasRef={frontCanvasRef} />
            </div>
            <div className="ebook-flip-face ebook-flip-face--back">
              <PageCanvas canvasRef={backCanvasRef} />
            </div>
          </div>
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 px-4 py-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="border-white/20 bg-transparent text-white"
          disabled={page <= 1 || flipping}
          onClick={() => void turnToPage(page - 1)}
          aria-label="Önceki sayfa"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <form
          onSubmit={handlePageJump}
          className="flex items-center gap-2 text-sm text-primary-200"
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
            className="h-9 w-16 border-white/20 bg-white/5 text-center text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span>/ {pageCount}</span>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={flipping}
            className="border-white/20 bg-transparent text-white"
          >
            Git
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="border-white/20 bg-transparent text-white"
          disabled={page >= pageCount || flipping}
          onClick={() => void turnToPage(page + 1)}
          aria-label="Sonraki sayfa"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </footer>
    </div>
  );
}
