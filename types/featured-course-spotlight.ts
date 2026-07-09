import type { CourseLanguageCode } from "@/lib/course/course-language";

export interface FeaturedCourseAttachment {
  name: string;
  type: "pdf" | "excel";
}

export interface FeaturedCourseSpotlight {
  id: string;
  slug: string;
  wpCourseId: number | null;
  title: string;
  subtitle: string | null;
  summary: string;
  coverImageUrl: string | null;
  category: string | null;
  level: string;
  language: CourseLanguageCode;
  subtitleLanguage: CourseLanguageCode | null;
  instructorName: string | null;
  instructorAvatar: string | null;
  lessonCount: number;
  durationLabel: string;
  targetAudience: string[];
  learningOutcomes: string[];
  attachments: FeaturedCourseAttachment[];
  attachmentCount: number;
  priceNormal: number | null;
  priceSale: number | null;
  isFree: boolean;
}
