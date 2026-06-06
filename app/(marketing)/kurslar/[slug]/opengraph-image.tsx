import {
  COURSE_OG_CONTENT_TYPE,
  COURSE_OG_SIZE,
  getCourseOgAlt,
  renderCourseOgImage,
} from "@/lib/seo/course-og-image";

export const runtime = "nodejs";
export const revalidate = 3600;
export const size = COURSE_OG_SIZE;
export const contentType = COURSE_OG_CONTENT_TYPE;

interface CourseOgImageProps {
  params: { slug: string };
}

export async function generateImageMetadata({ params }: CourseOgImageProps) {
  const alt = await getCourseOgAlt(params.slug);

  return [
    {
      id: 0,
      contentType: COURSE_OG_CONTENT_TYPE,
      size: COURSE_OG_SIZE,
      alt,
    },
  ];
}

export default async function Image({ params }: CourseOgImageProps) {
  return renderCourseOgImage(params.slug);
}
