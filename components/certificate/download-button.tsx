"use client";

import { useCallback, useEffect, useState } from "react";
import { Award, Loader2 } from "lucide-react";

interface DownloadCertificateButtonProps {
  courseId: number;
  initialCompletionPercent?: number;
  className?: string;
}

export function DownloadCertificateButton({
  courseId,
  initialCompletionPercent = 0,
  className = "",
}: DownloadCertificateButtonProps) {
  const [completionPercent, setCompletionPercent] = useState(
    initialCompletionPercent,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCompletion = useCallback(async () => {
    try {
      const response = await fetch(`/api/progress/course/${courseId}`);
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as { completion_percent?: number };
      if (typeof data.completion_percent === "number") {
        setCompletionPercent(data.completion_percent);
      }
    } catch {
      // Progress fetch is best-effort for button visibility.
    }
  }, [courseId]);

  useEffect(() => {
    function handleRefresh(event: Event) {
      const detail = (event as CustomEvent<{ courseId?: number }>).detail;
      if (!detail?.courseId || detail.courseId === courseId) {
        void refreshCompletion();
      }
    }

    window.addEventListener("course-progress-refresh", handleRefresh);
    return () => {
      window.removeEventListener("course-progress-refresh", handleRefresh);
    };
  }, [courseId, refreshCompletion]);

  async function handleDownload() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/certificate/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: courseId }),
      });

      const data = (await response.json()) as {
        certificate_url?: string;
        error?: string;
      };

      if (!response.ok || !data.certificate_url) {
        throw new Error(data.error || "Belge oluşturulamadı.");
      }

      window.open(data.certificate_url, "_blank", "noopener,noreferrer");
    } catch (downloadError) {
      const message =
        downloadError instanceof Error
          ? downloadError.message
          : "Belge indirilemedi.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (completionPercent < 100) {
    return null;
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-lg border border-[#D4AF37] bg-[#0B1E3F] px-4 py-2 text-sm font-semibold text-[#D4AF37] transition hover:bg-[#0B1E3F]/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Award className="h-4 w-4" />
        )}
        Katılım Belgesini İndir
      </button>
      {error ? (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
