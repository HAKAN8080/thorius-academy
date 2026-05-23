import type { Metadata } from "next";
import { InstructorGuideView } from "@/components/marketing/instructor-guide/instructor-guide-view";

export const metadata: Metadata = {
  title: "Eğitmen Destek Kılavuzu | Thorius Academy",
  description:
    "Kurs konusu, hedef kitle, sunum teknikleri, SEO, yayınlama ve öğrenci desteği için Thorius eğitmen rehberi.",
};

export default function InstructorGuidePage() {
  return <InstructorGuideView />;
}
