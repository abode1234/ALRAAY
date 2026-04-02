import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QuickViewProvider } from "@/contexts/QuickViewContext";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ['arabic', 'latin'],
  variable: '--font-ibm-plex-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://alraay.com'),
  title: {
    default: 'alraay | بناء تجميعات الكمبيوتر وقطع الألعاب',
    template: '%s | alraay',
  },
  description: 'شركة الرأي هي شركة عراقية متخصصة في بيع وتوزيع منتجات الحاسبات وتقنيات المعلومات، بدأت نشاطها منذ أكثر من ثلاثة عقود وأصبحت أحد الموردين البارزين في العراق',
  keywords: ['الرأي', 'الرأي', 'رأي', 'رأي', 'شركة الرأي', 'شركة الرأي', 'الرأي', 'alraay', 'Al-Raay', 'Al-Raay', 'كمبيوتر', 'العاب', 'تجميعات', 'معالج', 'كرت شاشة', 'رام', 'العراق', 'بغداد', 'قطع كمبيوتر', 'PC builds', 'تجميعات كمبيوتر العراق'],
  icons: {
    icon: '/favicon.svg',
    apple: '/Al-Raay.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_IQ',
    url: 'https://alraay.com',
    siteName: 'alraay',
    title: 'alraay | بناء تجميعات الكمبيوتر وقطع الألعاب',
    description: 'شركة الرأي هي شركة عراقية متخصصة في بيع وتوزيع منتجات الحاسبات وتقنيات المعلومات، بدأت نشاطها منذ أكثر من ثلاثة عقود',
    images: [
      {
        url: '/Al-Raay.svg',
        width: 512,
        height: 512,
        alt: 'alraay',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'alraay | بناء تجميعات الكمبيوتر وقطع الألعاب',
    description: 'شركة الرأي هي شركة عراقية متخصصة في بيع وتوزيع منتجات الحاسبات وتقنيات المعلومات، بدأت نشاطها منذ أكثر من ثلاثة عقود',
    images: ['/Al-Raay.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://alraay.com',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'alraay - شركة الرأي',
              alternateName: ['الرأي', 'الرأي', 'Al-Raay', 'Al-Raay', 'شركة الرأي', 'شركة الرأي'],
              url: 'https://alraay.com',
              logo: 'https://alraay.com/Al-Raay.svg',
              description: 'شركة الرأي هي شركة عراقية متخصصة في بيع وتوزيع منتجات الحاسبات وتقنيات المعلومات، بدأت نشاطها منذ أكثر من ثلاثة عقود',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'IQ',
              },
              sameAs: [],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'alraay',
              alternateName: ['الرأي', 'الرأي'],
              url: 'https://alraay.com',
            }),
          }}
        />
      </head>
      <body className={`min-h-screen flex flex-col ${ibmPlexArabic.className}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <QuickViewProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="top-center" richColors closeButton />
          </QuickViewProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
