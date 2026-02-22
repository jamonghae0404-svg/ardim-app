import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { BottomNav, SideNav } from "@/components/nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "스마트 출석부 | 아르딤 복지관",
  description: "복지관 스마트 출석 관리 시스템",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "스마트 출석부",
  },
  formatDetection: { telephone: false },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} antialiased bg-gray-50 font-sans`}>
        <div className="flex min-h-screen">
          <SideNav />
          <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
            {children}
          </main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
