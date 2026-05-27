import type { Metadata } from "next";
import { AboutPageView } from "@/components/marketing/about-page-view";

export const metadata: Metadata = {
  title: "Hakkımızda | Thorius Academy",
  description:
    "Thorius Academy misyon, vizyon ve değerleri. Eğitimde yeni nesil deneyim — erişilebilir, kaliteli ve etki odaklı dijital eğitimler.",
};

export default function HakkimizdaPage() {
  return <AboutPageView />;
}
