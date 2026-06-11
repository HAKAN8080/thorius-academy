import { parseVideoUrl } from "@/lib/lessons/parse-video-url";
import type { Lesson } from "@/types/lesson";
import {
  type BunnyCourseContext,
  resolveBunnyCourseUploadTarget,
} from "@/lib/video/bunny-collections";
import { ensureBunnyStreamVideoUrl, isBunnyStreamUrl } from "@/lib/video/bunny-stream";

export async function resolveLessonVideoForSave(
  videoUrl: string,
  lessonTitle: string,
  courseContext?: BunnyCourseContext,
): Promise<
  | {
      video_url: string;
      video_embed_url: string | null;
      video_type: Lesson["video_type"];
    }
  | { error: string }
> {
  const trimmed = videoUrl.trim();
  if (!trimmed) {
    return {
      video_url: "",
      video_embed_url: null,
      video_type: null,
    };
  }

  if (isBunnyStreamUrl(trimmed)) {
    const parsed = parseVideoUrl(trimmed);
    return {
      video_url: parsed.video_url,
      video_embed_url: parsed.video_embed_url,
      video_type: parsed.video_type,
    };
  }

  const uploadTarget = courseContext
    ? await resolveBunnyCourseUploadTarget(courseContext, lessonTitle)
    : null;

  if (uploadTarget && "error" in uploadTarget) {
    return uploadTarget;
  }

  const bunny = await ensureBunnyStreamVideoUrl(
    trimmed,
    uploadTarget?.videoTitle ?? lessonTitle,
    uploadTarget ? { collectionId: uploadTarget.collectionId } : undefined,
  );
  if ("error" in bunny) {
    return bunny;
  }

  const parsed = parseVideoUrl(bunny.videoUrl);
  return {
    video_url: parsed.video_url || bunny.videoUrl,
    video_embed_url: parsed.video_embed_url || bunny.embedUrl,
    video_type: parsed.video_type ?? "external_url",
  };
}
