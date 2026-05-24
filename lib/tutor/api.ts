import type { TutorApiResponse, TutorLesson, TutorTopic } from "@/types/tutor";

const TUTOR_API_BASE = "https://thorius.com.tr/wp-json/tutor/v1";

function getAuthHeader(): string {
  const key = process.env.TUTOR_CONSUMER_KEY;
  const secret = process.env.TUTOR_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error("Tutor API credentials missing in env");
  }
  return "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");
}

async function tutorFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${TUTOR_API_BASE}${endpoint}`, {
    headers: { Authorization: getAuthHeader() },
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Tutor API error ${res.status}: ${endpoint}`);
  }
  return res.json();
}

export async function fetchTutorTopics(courseId: number): Promise<TutorTopic[]> {
  const data = await tutorFetch<TutorApiResponse<TutorTopic[]>>(
    `/topics?course_id=${courseId}`
  );
  return data.data || [];
}

export async function fetchTutorLessons(topicId: number): Promise<TutorLesson[]> {
  const data = await tutorFetch<TutorApiResponse<TutorLesson[]>>(
    `/lessons?topic_id=${topicId}`
  );
  return data.data || [];
}

export async function fetchCourseFullStructure(courseId: number) {
  const topics = await fetchTutorTopics(courseId);
  const topicsWithLessons = await Promise.all(
    topics.map(async (topic, idx) => {
      const topicId =
        typeof topic.ID === "string" ? parseInt(topic.ID, 10) : topic.ID;
      const lessons = await fetchTutorLessons(topicId);
      return {
        topic_id: topicId,
        topic_title: topic.post_title,
        topic_order: idx + 1,
        lessons: lessons.reverse(),
      };
    })
  );
  return topicsWithLessons;
}

function videoRuntimeToSeconds(runtime: {
  hours: string;
  minutes: string;
  seconds: string;
}): number {
  const h = parseInt(runtime.hours, 10) || 0;
  const m = parseInt(runtime.minutes, 10) || 0;
  const s = parseInt(runtime.seconds, 10) || 0;
  return h * 3600 + m * 60 + s;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

export function extractVideoUrl(video: TutorLesson["video"]): {
  type: "external_url" | "youtube" | "html5" | "vimeo" | null;
  url: string | null;
  embedUrl: string | null;
  duration: number;
} {
  if (!video || video.length === 0) {
    return { type: null, url: null, embedUrl: null, duration: 0 };
  }
  const v = video[0];
  const duration = videoRuntimeToSeconds(v.runtime);

  if (v.source === "external_url" && v.source_external_url) {
    return {
      type: "external_url",
      url: v.source_external_url,
      embedUrl: v.source_external_url,
      duration,
    };
  }
  if (v.source === "youtube" && v.source_youtube) {
    const videoId = extractYouTubeId(v.source_youtube);
    return {
      type: "youtube",
      url: v.source_youtube,
      embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
      duration,
    };
  }
  if (v.source === "vimeo" && v.source_vimeo) {
    return { type: "vimeo", url: v.source_vimeo, embedUrl: null, duration };
  }
  if (v.source === "html5" && v.source_html5) {
    return {
      type: "html5",
      url: v.source_html5,
      embedUrl: v.source_html5,
      duration,
    };
  }
  return { type: null, url: null, embedUrl: null, duration };
}
