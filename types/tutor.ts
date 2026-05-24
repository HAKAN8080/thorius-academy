export interface TutorTopic {
  ID: string | number;
  post_title: string;
  post_content: string;
  post_name: string;
}

export interface TutorVideo {
  source: "external_url" | "youtube" | "html5" | "vimeo" | "embedded" | "";
  source_video_id: string;
  poster: string;
  poster_url: string;
  source_html5: string;
  source_external_url: string;
  source_shortcode: string;
  source_youtube: string;
  source_vimeo: string;
  source_embedded: string;
  runtime: { hours: string; minutes: string; seconds: string };
  duration_sec?: string;
  playtime?: string;
}

export interface TutorLesson {
  ID: number;
  post_title: string;
  post_content: string;
  post_name: string;
  topic_id: number;
  attachments: unknown[];
  thumbnail: boolean;
  video: TutorVideo[];
}

export interface TutorApiResponse<T> {
  code: string;
  message: string;
  data: T;
}
