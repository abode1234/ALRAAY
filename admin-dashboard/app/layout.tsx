import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "alraay Admin Dashboard",
  description: "لوحة تحكم الإدارة - alraay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${ibmPlexArabic.variable} font-sans antialiased`}>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
