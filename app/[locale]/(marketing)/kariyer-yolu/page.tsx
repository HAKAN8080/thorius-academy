import type { Metadata } from "next";
import { CareerPathIndex } from "@/components/marketing/career-path-index";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kariyer Yolları",
  description:
    "Retail Planning, İnsan Kaynakları ve Yapay Zeka kariyer yolları — Thorius Academy uzmanlık programları.",
  openGraph: {
    title: "Kariyer Yolları | Thorius Academy",
    description:
      "Kurs değil kariyer sonucu — adım adım uzmanlık yolları.",
    type: "website",
  },
};

export default async function CareerPathsPage() {
  return <CareerPathIndex />;
}
