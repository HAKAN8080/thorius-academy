import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon", type: "image/png" },
    ],
    apple: "/apple-icon",
    shortcut: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Suspense fallback={null}>
          <NavigationPending />
        </Suspense>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
