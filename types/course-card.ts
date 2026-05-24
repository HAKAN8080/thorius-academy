export interface CourseCardV2Props {
  slug: string;
  title: string;
  excerpt?: string;
  thumbnail: string;
  imageAlt?: string;
  category?: string;
  level?: string;
  instructor?: {
    name: string;
    avatar?: string;
  };
  rating?: number;
  ratingCount?: number;
  lessonCount?: number;
  duration?: string;
  priceNormal?: number | null;
  priceSale?: number | null;
  isEnrolled?: boolean;
  className?: string;
}
