import type { Metadata } from "next";
import { headers } from "next/headers";
import { routing } from "@/i18n/routing";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";
import { NavigationPending } from "@/components/layout/navigation-pending";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Thorius — Eğitim, LMS ve Kariyer Platformu",
    template: "%s | Thorius",
  },
  description:
    "Thorius Eğitim ve Danışmanlık: Thorius-LMS, Thorius Academy ve koçluk ekosistemi. Perakende planlama, İK ve yapay zeka eğitimleri.",
  keywords: [
    "perakende eğitimi",
    "merchandising",
    "OTB",
    "open-to-buy",
    "retail academy",
    "B2B eğitim",
    "perakende planlama",
    "yapay zeka perakende",
    "liderlik kursu",
    "Türkiye",
  ],
  authors: [{ name: "Thorius Eğitim ve Danışmanlık Ltd. Şti." }],
  creator: "Thorius Academy",
  publisher: "Thorius Eğitim ve Danışmanlık Ltd. Şti.",
  metadataBase: new URL("https://academy.thorius.com.tr"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Thorius — Eğitim, LMS ve Kariyer Platformu",
    description:
      "Thorius-LMS, Thorius Academy ve koçluk ekosistemi. Perakende, İK ve yapay zeka odaklı dijital öğrenme.",
    url: "https://academy.thorius.com.tr",
    siteName: "Thorius",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thorius",
    description: "Eğitim, LMS ve kariyer platformu",
    creator: "@thorius",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=4", sizes: "any" },
      { url: "/icon.png?v=4", type: "image/png", sizes: "512x512" },
      { url: "/favicon-32.png?v=4", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon.png?v=4",
    shortcut: "/favicon.ico?v=4",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = headers();
  const locale =
    headerList.get("x-next-intl-locale") ??
    routing.defaultLocale;

  return (
    <html lang={locale}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AnalyticsScripts />
        <Suspense fallback={null}>
          <NavigationPending />
        </Suspense>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
