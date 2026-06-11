"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Link2 } from "lucide-react";
import { toast } from "sonner";
import * as tus from "tus-js-client";
import { prepareLessonVideoUpload } from "@/lib/actions/instructor-lesson-uploads";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LESSON_VIDEO_MAX_BYTES } from "@/lib/upload/file-guard";

type VideoSourceMode = "url" | "upload";

interface LessonVideoSourceFieldProps {
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
  courseCacheId?: string;
  wpCourseId?: number;
  lessonId: string;
  lessonTitle: string;
  disabled?: boolean;
}

export function LessonVideoSourceField({
  videoUrl,
  onVideoUrlChange,
  courseCacheId,
  wpCourseId,
  lessonId,
  lessonTitle,
  disabled = false,
}: LessonVideoSourceFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<VideoSourceMode>("url");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > LESSON_VIDEO_MAX_BYTES) {
      toast.error("Video en fazla 500 MB olabilir.");
      event.target.value = "";
      return;
    }

    startTransition(async () => {
      setUploadProgress(0);

      const session = await prepareLessonVideoUpload({
        courseCacheId,
        wpCourseId,
        lessonId,
        lessonTitle,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      if ("error" in session) {
        toast.error(session.error);
        setUploadProgress(null);
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: session.tusEndpoint,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          metadata: {
            filetype: file.type,
            title: file.name,
          },
          headers: {
            AuthorizationSignature: session.authorizationSignature,
            AuthorizationExpire: String(session.authorizationExpire),
            VideoId: session.videoId,
            LibraryId: session.libraryId,
          },
          onError: (error) => reject(error),
          onProgress: (bytesUploaded, bytesTotal) => {
            if (bytesTotal > 0) {
              setUploadProgress(Math.round((bytesUploaded / bytesTotal) * 100));
            }
          },
          onSuccess: () => resolve(),
        });

        upload.start();
      })
        .then(() => {
          onVideoUrlChange(session.playUrl);
          setMode("url");
          setUploadProgress(null);
          toast.success("Video Bunny Stream'e yüklendi.");
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Video yüklenemedi.";
          toast.error(message);
          setUploadProgress(null);
        });
    });

    event.target.value = "";
  }

  return (
    <div className="space-y-3">
      <Label>Video</Label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled || isPending}
          onClick={() => setMode("url")}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium ${
            mode === "url"
              ? "border-[#D4AF37] bg-[#0B1E3F] text-[#D4AF37]"
              : "border-primary-200 text-[#0B1E3F]"
          }`}
        >
          <Link2 className="h-4 w-4" />
          Link ile
        </button>
        <button
          type="button"
          disabled={disabled || isPending}
          onClick={() => setMode("upload")}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium ${
            mode === "upload"
              ? "border-[#D4AF37] bg-[#0B1E3F] text-[#D4AF37]"
              : "border-primary-200 text-[#0B1E3F]"
          }`}
        >
          <Upload className="h-4 w-4" />
          Dosya yükle
        </button>
      </div>

      {mode === "url" ? (
        <div className="space-y-2">
          <Input
            id="video-url"
            value={videoUrl}
            onChange={(e) => onVideoUrlChange(e.target.value)}
            disabled={disabled || isPending}
            placeholder="MP4/CDN linki veya Bunny Stream play/embed URL"
          />
          <p className="text-xs text-primary-500">
            Harici link kayıtta Bunny Stream&apos;e aktarılır; kurs collection
            ve &quot;Kurs — Ders&quot; adlandırması uygulanır. YouTube/Vimeo
            desteklenmez.
          </p>
        </div>
      ) : (
        <div className="space-y-2 rounded-xl border border-dashed border-primary-200 p-4">
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
            className="hidden"
            disabled={disabled || isPending}
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isPending}
            onClick={() => inputRef.current?.click()}
          >
            {isPending
              ? uploadProgress != null
                ? `Yükleniyor %${uploadProgress}`
                : "Hazırlanıyor..."
              : "Video dosyası seç"}
          </Button>
          <p className="text-xs text-primary-500">
            MP4, WebM veya MOV · en fazla 500 MB · Bunny Stream kütüphanesinde
            kurs klasörü (collection) açılır; video adı &quot;Kurs adı — Ders
            adı&quot; olur.
          </p>
          {videoUrl ? (
            <p className="truncate text-xs text-emerald-700">
              Hazır: {videoUrl}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
