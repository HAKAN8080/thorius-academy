"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EbookReaderProps {
  slug: string;
  title: string;
  watermark: string;
}

export function EbookReader({ slug, title, watermark }: EbookReaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfRef = useRef<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flipping, setFlipping] = useState(false);

  const renderPage = useCallback(async (pageNum: number) => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
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
        await renderPage(1);
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
  }, [renderPage, slug]);

  useEffect(() => {
    if (pageCount > 0 && !loading) {
      void renderPage(page);
    }
  }, [page, pageCount, loading, renderPage]);

  useEffect(() => {
    const block = (event: Event) => event.preventDefault();
    const blockKeys = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        ["c", "p", "s", "a"].includes(event.key.toLowerCase())
      ) {
        event.preventDefault();
      }
      if (event.key === "PrintScreen") {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("keydown", blockKeys);

    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  async function changePage(next: number) {
    if (flipping || next < 1 || next > pageCount) return;
    setFlipping(true);
    setPage(next);
    window.setTimeout(() => setFlipping(false), 320);
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
        <div
          className={`relative max-h-[calc(100vh-8rem)] overflow-hidden rounded-lg shadow-2xl transition-transform duration-300 ${
            flipping ? "scale-[0.98] rotate-y-6" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            perspective: "1200px",
          }}
        >
          <canvas
            ref={canvasRef}
            className="max-h-[calc(100vh-8rem)] w-auto max-w-full bg-white"
            draggable={false}
          />
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

      <footer className="flex items-center justify-center gap-4 border-t border-white/10 px-4 py-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="border-white/20 bg-transparent text-white"
          disabled={page <= 1}
          onClick={() => void changePage(page - 1)}
          aria-label="Önceki sayfa"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm text-primary-200">
          {page} / {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="border-white/20 bg-transparent text-white"
          disabled={page >= pageCount}
          onClick={() => void changePage(page + 1)}
          aria-label="Sonraki sayfa"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </footer>
    </div>
  );
}
