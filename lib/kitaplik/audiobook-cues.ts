export interface AudiobookCue {
  startMs: number;
  endMs: number;
  textTr: string;
}

export interface AudiobookTimingPayload {
  cues?: AudiobookCue[];
}

/** Active cue index for current playback time (ms). Returns -1 if none. */
export function findActiveCueIndex(
  cues: AudiobookCue[],
  timeMs: number,
): number {
  if (!cues.length || !Number.isFinite(timeMs) || timeMs < 0) return -1;

  let lo = 0;
  let hi = cues.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const cue = cues[mid];
    if (timeMs < cue.startMs) {
      hi = mid - 1;
    } else if (timeMs >= cue.endMs) {
      lo = mid + 1;
    } else {
      return mid;
    }
  }

  // Between cues: show the last cue that has started.
  if (hi >= 0 && timeMs >= cues[hi].startMs) return hi;
  return -1;
}

export function parseAudiobookCues(payload: unknown): AudiobookCue[] {
  if (!payload || typeof payload !== "object") return [];
  const cues = (payload as AudiobookTimingPayload).cues;
  if (!Array.isArray(cues)) return [];

  return cues
    .map((cue) => {
      if (!cue || typeof cue !== "object") return null;
      const startMs = Number((cue as AudiobookCue).startMs);
      const endMs = Number((cue as AudiobookCue).endMs);
      const textTr = String((cue as AudiobookCue).textTr ?? "").trim();
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || !textTr) {
        return null;
      }
      if (endMs <= startMs) return null;
      return { startMs, endMs, textTr };
    })
    .filter((cue): cue is AudiobookCue => cue !== null);
}
