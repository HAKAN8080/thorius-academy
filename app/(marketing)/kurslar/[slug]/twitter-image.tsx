import Image, { generateImageMetadata as generateOgImageMetadata } from "./opengraph-image";
import { COURSE_OG_CONTENT_TYPE, COURSE_OG_SIZE } from "@/lib/seo/course-og-image";

export const runtime = "nodejs";
export const revalidate = 3600;
export const size = COURSE_OG_SIZE;
export const contentType = COURSE_OG_CONTENT_TYPE;
export const generateImageMetadata = generateOgImageMetadata;

export default Image;
