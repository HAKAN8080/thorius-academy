"use client";

import type { LegacyRef, ReactNode, RefObject } from "react";
import { cn } from "@/lib/utils";

interface ProtectedVideoShellProps {
  children: ReactNode;
  className?: string;
}

export function blockVideoContextMenu(event: React.MouseEvent): void {
  event.preventDefault();
}

export function ProtectedVideoShell({
  children,
  className,
}: ProtectedVideoShellProps) {
  return (
    <div
      className={cn("relative select-none", className)}
      onContextMenu={blockVideoContextMenu}
    >
      {children}
    </div>
  );
}

interface ProtectedHtml5VideoProps {
  src: string;
  videoRef?: RefObject<HTMLVideoElement | null>;
}

export function ProtectedHtml5Video({
  src,
  videoRef,
}: ProtectedHtml5VideoProps) {
  return (
    <ProtectedVideoShell className="aspect-video overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef as LegacyRef<HTMLVideoElement>}
        src={src}
        controls
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        playsInline
        draggable={false}
        onContextMenu={blockVideoContextMenu}
        crossOrigin="anonymous"
        className="h-full w-full pointer-events-auto"
      >
        Tarayıcınız video oynatmayı desteklemiyor.
      </video>
    </ProtectedVideoShell>
  );
}

interface ProtectedVideoIframeProps {
  src: string;
  title: string;
  iframeRef?: RefObject<HTMLIFrameElement | null>;
  allow?: string;
}

export function ProtectedVideoIframe({
  src,
  title,
  iframeRef,
  allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen",
}: ProtectedVideoIframeProps) {
  return (
    <ProtectedVideoShell className="aspect-video overflow-hidden rounded-2xl bg-black">
      <iframe
        ref={iframeRef as LegacyRef<HTMLIFrameElement>}
        src={src}
        title={title}
        className="h-full w-full border-0"
        allow={allow}
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </ProtectedVideoShell>
  );
}
