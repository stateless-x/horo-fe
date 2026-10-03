import type { Metadata, Viewport } from "next";
import "@fontsource/noto-sans-thai/300.css";
import "@fontsource/noto-sans-thai/400.css";
import "@fontsource/noto-sans-thai/500.css";
import "@fontsource/noto-sans-thai/600.css";
import "@fontsource/noto-sans-thai/700.css";
import "@fontsource/anuphan/400.css";
import "@fontsource/anuphan/500.css";
import "@fontsource/anuphan/600.css";
import "@fontsource/anuphan/700.css";
import "@fontsource/sarabun/200.css";
import "@fontsource/sarabun/300.css";
import "@fontsource/sarabun/400.css";
import "@fontsource/space-grotesk/300.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import { Providers } from "./providers";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";


export const metadata: Metadata = {
  title: {
    default: "ดูดวงออนไลน์ฟรี เรื่องงาน เรื่องรัก รู้จักตัวเอง | สายมู",
    template: "%s | สายมู",
  },
  description:
    "ดูดวงออนไลน์ฟรีกับสายมู ชวนอ่านเรื่องงาน ความรัก การเงิน และดวงคู่จากวันเกิด ใช้ AI เรียบเรียงดวงไทย ปาจื้อ และ MBTI ดูผลเบื้องต้นได้ก่อนสมัคร",

  keywords: [
    "ดูดวง",
    "ดูดวงฟรี",
    "ดูดวงออนไลน์",
    "ดูดวงไทย",
    "โหราศาสตร์ไทย",
    "Bazi",
    "ซื่อจู๋",
    "สี่เสาชะตา",
    "เสาสี่เกิด",
    "ดูดวงคู่",
    "ดวงชะตา",
    "ดูดวงความรัก",
    "ดูดวงการเงิน",
    "ดูดวงการงาน",
    "ดูดวงด้วย AI",
    "ห้าธาตุ",
    "นพเคราะห์",
    "จักรนพคุณ",
    "ดูดวงประจำปี",
    "ดูดวงวันเกิด",
    "MBTI",
    "MBTI ดูดวง",
    "บุคลิกภาพ 16 แบบ",
    "ดูดวงตาม MBTI",
    "INTP ดูดวง",
    "INFJ ดูดวง",
    "MBTI ความรัก",
    "สายมู",
  ],

  authors: [{ name: "สายมู" }],
  creator: "สายมู",
  publisher: "สายมู",

  metadataBase: new URL("https://xn--y3cbx6azb.com"),

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },

  openGraph: {
    title: "เรื่องงาน เรื่องรัก ลองเปิดดวงดู | สายมู",
    description:
      "มีเรื่องไหนอยู่ในใจ ลองอ่านดวงส่วนตัว ดวงรายวัน และดวงคู่กับสายมู ดูผลเบื้องต้นฟรี แล้วค่อยเข้าสู่ระบบเพื่ออ่านต่อ",
    url: "https://xn--y3cbx6azb.com",
    type: "website",
    locale: "th_TH",
    siteName: "สายมู.com",
    images: [
      {
        url: "/og-image-v2.jpg",
        width: 1200,
        height: 630,
        alt: "สายมู ดูดวงออนไลน์ฟรี",
        type: "image/jpeg",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "เรื่องงาน เรื่องรัก ลองเปิดดวงดู | สายมู",
    description:
      "มีเรื่องไหนอยู่ในใจ ลองอ่านดวงส่วนตัว ดวงรายวัน และดวงคู่กับสายมู ดูผลเบื้องต้นฟรี แล้วค่อยเข้าสู่ระบบเพื่ออ่านต่อ",
    images: ["/og-image-v2.jpg"],
    site: "@สายมู",
    creator: "@สายมู",
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

  verification: {
    // Add Google Search Console verification when available
    // google: 'your-verification-code',
    other: {
      'google-adsense-account': 'ca-pub-7565287726351560',
    },
  },

  category: "lifestyle",
};

export const viewport: Viewport = {
  // Light is the app default regardless of OS scheme, so the tab color matches it.
  themeColor: "#FAF9FD",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head />
      <body>
        <Analytics />
        <Providers>
          {children}
          <Footer />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
