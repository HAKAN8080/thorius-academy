"use client";

import { useEffect, type RefObject } from "react";
import {
  PROGRESS_COMPLETION_THRESHOLD,
  PROGRESS_SAVE_INTERVAL_MS,
} from "@/lib/progress/client";
import { useProgressSaver } from "@/hooks/use-progress-saver";

type EmbedProvider = "youtube" | "vimeo";

interface UseEmbedVideoProgressOptions {
  provider: EmbedProvider;
  lessonId: string;
  courseId: number;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  enabled?: boolean;
  onComplete?: () => void;
}

type YouTubePlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
};

type VimeoPlayer = {
  getCurrentTime: () => Promise<number>;
  getDuration: () => Promise<number>;
  on: (
    event: "play" | "pause" | "ended" | "timeupdate",
    callback: (data?: { seconds?: number; duration?: number }) => void,
  ) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLIFrameElement,
        options: {
          events?: {
            onReady?: () => void;
            onStateChange?: (event: { data: number }) => void;
          };
        },
      ) => YouTubePlayer;
      PlayerState: {
        PLAYING: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
    Vimeo?: {
      Player: new (element: HTMLIFrameElement) => VimeoPlayer;
    };
  }
}

let youtubeApiPromise: Promise<void> | null = null;
let vimeoApiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve();
      };

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
}

function loadVimeoApi(): Promise<void> {
  if (window.Vimeo?.Player) {
    return Promise.resolve();
  }

  if (!vimeoApiPromise) {
    vimeoApiPromise = new Promise((resolve, reject) => {
      if (!document.querySelector('script[src*="player.vimeo.com/api/player.js"]')) {
        const script = document.createElement("script");
        script.src = "https://player.vimeo.com/api/player.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Vimeo API failed to load"));
        document.head.appendChild(script);
        return;
      }

      resolve();
    });
  }

  return vimeoApiPromise;
}

export function useEmbedVideoProgress({
  provider,
  lessonId,
  courseId,
  iframeRef,
  enabled = true,
  onComplete,
}: UseEmbedVideoProgressOptions) {
  const { saveProgress, queueSave, lastSavedRef, hasMarkedCompleteRef } =
    useProgressSaver({
      lessonId,
      courseId,
      onComplete,
    });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let destroyed = false;
    let player: YouTubePlayer | VimeoPlayer | null = null;
    let isPlaying = false;
    let saveInterval: ReturnType<typeof setInterval> | null = null;
    let completionInterval: ReturnType<typeof setInterval> | null = null;

    async function markComplete(currentSeconds: number) {
      if (hasMarkedCompleteRef.current) {
        return;
      }

      hasMarkedCompleteRef.current = true;
      await saveProgress(currentSeconds, true);
    }

    async function checkCompletion() {
      if (!player || hasMarkedCompleteRef.current || !isPlaying) {
        return;
      }

      try {
        if (provider === "youtube") {
          const ytPlayer = player as YouTubePlayer;
          const duration = ytPlayer.getDuration();
          if (!Number.isFinite(duration) || duration <= 0) {
            return;
          }

          const current = Math.floor(ytPlayer.getCurrentTime());
          if (current / duration >= PROGRESS_COMPLETION_THRESHOLD) {
            await markComplete(current);
          }
          return;
        }

        const vimeoPlayer = player as VimeoPlayer;
        const [currentRaw, durationRaw] = await Promise.all([
          vimeoPlayer.getCurrentTime(),
          vimeoPlayer.getDuration(),
        ]);
        const duration = durationRaw;
        if (!Number.isFinite(duration) || duration <= 0) {
          return;
        }

        const current = Math.floor(currentRaw);
        if (current / duration >= PROGRESS_COMPLETION_THRESHOLD) {
          await markComplete(current);
        }
      } catch (error) {
        console.error("[useEmbedVideoProgress] Completion check failed:", error);
      }
    }

    async function saveIfPlaying() {
      if (!player || !isPlaying || hasMarkedCompleteRef.current) {
        return;
      }

      try {
        const current =
          provider === "youtube"
            ? Math.floor((player as YouTubePlayer).getCurrentTime())
            : Math.floor(await (player as VimeoPlayer).getCurrentTime());

        if (current > lastSavedRef.current) {
          queueSave(current, false);
        }
      } catch (error) {
        console.error("[useEmbedVideoProgress] Save failed:", error);
      }
    }

    async function initYouTube(iframe: HTMLIFrameElement) {
      await loadYouTubeApi();
      if (destroyed) {
        return;
      }

      const ytPlayer = new window.YT!.Player(iframe, {
        events: {
          onStateChange: (event) => {
            const playing = event.data === window.YT!.PlayerState.PLAYING;
            const ended = event.data === window.YT!.PlayerState.ENDED;
            isPlaying = playing;

            if (ended) {
              const duration = Math.floor(ytPlayer.getDuration() || 0);
              void markComplete(duration);
            }
          },
        },
      });

      player = ytPlayer;
    }

    async function initVimeo(iframe: HTMLIFrameElement) {
      await loadVimeoApi();
      if (destroyed || !window.Vimeo?.Player) {
        return;
      }

      const vimeoPlayer = new window.Vimeo.Player(iframe);
      vimeoPlayer.on("play", () => {
        isPlaying = true;
      });
      vimeoPlayer.on("pause", () => {
        isPlaying = false;
      });
      vimeoPlayer.on("ended", async () => {
        isPlaying = false;
        try {
          const duration = Math.floor(await vimeoPlayer.getDuration());
          await markComplete(duration);
        } catch (error) {
          console.error("[useEmbedVideoProgress] Vimeo ended handler failed:", error);
        }
      });

      player = vimeoPlayer;
    }

    async function init() {
      const iframe = iframeRef.current;
      if (!iframe) {
        return;
      }

      try {
        if (provider === "youtube") {
          await initYouTube(iframe);
        } else {
          await initVimeo(iframe);
        }

        saveInterval = setInterval(() => {
          void saveIfPlaying();
        }, PROGRESS_SAVE_INTERVAL_MS);

        completionInterval = setInterval(() => {
          void checkCompletion();
        }, 2_000);
      } catch (error) {
        console.error("[useEmbedVideoProgress] Init failed:", error);
      }
    }

    void init();

    return () => {
      destroyed = true;
      isPlaying = false;
      if (saveInterval) {
        clearInterval(saveInterval);
      }
      if (completionInterval) {
        clearInterval(completionInterval);
      }
      player?.destroy();
      player = null;
    };
  }, [
    courseId,
    enabled,
    hasMarkedCompleteRef,
    iframeRef,
    lastSavedRef,
    lessonId,
    provider,
    queueSave,
    saveProgress,
  ]);
}
