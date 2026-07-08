"use client";

import { LessonDocumentUploadField } from "@/components/instructor/lesson-document-upload-field";

interface LessonPdfUploadFieldProps {
  attachmentUrl: string;
  attachmentName: string;
  onChange: (next: { url: string; name: string } | null) => void;
  courseCacheId?: string;
  wpCourseId?: number;
  lessonId: string;
  disabled?: boolean;
}

export function LessonPdfUploadField(props: LessonPdfUploadFieldProps) {
  return <LessonDocumentUploadField kind="pdf" {...props} />;
}
