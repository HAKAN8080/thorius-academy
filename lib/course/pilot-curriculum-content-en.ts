import type { AppLocale } from "@/i18n/routing";
import { pickLocalized } from "@/lib/course/resolve-course-content";

export interface PilotCurriculumContentEn {
  course_slug: string;
  sections: Record<string, string>;
  lessons: Record<string, string>;
}

export const PILOT_CURRICULUM_CONTENT_EN: PilotCurriculumContentEn[] = [
  {
    course_slug:
      "musteri-taleplerini-verilere-dokmenin-yolu-stock-option-plan-tasarim-option-plan-ve-range-plan",
    sections: {
      Giriş: "Introduction",
      "Stock Option": "Stock Option",
      "Tasarım Option Plan": "Design Option Plan",
      "Range Plan": "Range Plan",
      Kapanış: "Closing",
    },
    lessons: {
      Giriş: "Introduction",
      İçerik: "Overview",
      "Stock Option Nedir?": "What Is a Stock Option?",
      "Stock Option Plan Toplantısı Katılımcıları":
        "Stock Option Plan Meeting Participants",
      "Stock Option Plan Hazırlık Süreci":
        "Stock Option Plan Preparation Process",
      "Stock Option Toplantısı Periyotları":
        "Stock Option Meeting Cadence",
      "Stock Option Plan Belirleme": "Defining the Stock Option Plan",
      "Stock Option Plan Belirleme Detay":
        "Stock Option Plan Definition (Detail)",
      "Örnek: Bir Hazır Giyim Firması – Stock Option Çalışması (1. Aşama)":
        "Case Study: Apparel Retailer Stock Option Work (Stage 1)",
      "Örnek: Bir Hazır Giyim Firması – Stock Option Çalışması (2. Aşama)":
        "Case Study: Apparel Retailer Stock Option Work (Stage 2)",
      "Örnek: Bir Hazır Giyim Firması – Stock Option Çalışması (3. Aşama)":
        "Case Study: Apparel Retailer Stock Option Work (Stage 3)",
      "Tasarım Option Planı Nedir?": "What Is a Design Option Plan?",
      "Tasarım Option Plan Gant Örneği":
        "Design Option Plan Gantt Chart Example",
      "Range Plan Nedir?": "What Is a Range Plan?",
      "Range Plan Kriterlerinin Belirlenmesi":
        "Defining Range Plan Criteria",
      "Boston Matrisi (BCG) Nedir Planlamada Nasıl Kullanılır?":
        "Boston Matrix (BCG): What It Is and How Planners Use It",
      "Range Belirlerken Hangi Yol İzlenir?":
        "How to Build a Range Plan",
      "Rekabet Analizi ve Fiyat Rekabeti":
        "Competitive Analysis and Price Competition",
      Kapanış: "Closing",
    },
  },
];

const pilotBySlug = new Map(
  PILOT_CURRICULUM_CONTENT_EN.map((entry) => [entry.course_slug, entry]),
);

export function resolveCurriculumTitle(
  locale: AppLocale,
  courseSlug: string,
  trTitle: string,
  dbEn?: string | null,
): string {
  const localized = pickLocalized(locale, trTitle, dbEn);
  if (locale !== "en" || localized !== trTitle) {
    return localized;
  }

  const pilot = pilotBySlug.get(courseSlug);
  if (!pilot) {
    return trTitle;
  }

  return pilot.sections[trTitle] ?? pilot.lessons[trTitle] ?? trTitle;
}

const SECTION_FALLBACK_EN: Record<string, string> = {
  Müfredat: "Curriculum",
  Diğer: "Other",
};

export function resolveCurriculumSectionTitle(
  locale: AppLocale,
  courseSlug: string,
  trTitle: string,
  dbEn?: string | null,
): string {
  const resolved = resolveCurriculumTitle(locale, courseSlug, trTitle, dbEn);
  if (locale === "en" && resolved === trTitle) {
    return SECTION_FALLBACK_EN[trTitle] ?? trTitle;
  }
  return resolved;
}
