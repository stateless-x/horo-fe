import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { Footer } from "@/components/layout/footer";
import { AdSenseScript } from "@/components/ads/adsense-script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "สายมู - ดูดวงออนไลน์ฟรี ด้วย AI | โหราศาสตร์ไทย × Bazi × MBTI",
    template: "%s | สายมู - ดูดวงออนไลน์",
  },
  description:
    "ดูดวงออนไลน์ฟรีด้วย AI ผสานโหราศาสตร์ไทย Bazi (ซื่อจู๋) และ MBTI วิเคราะห์ดวงชะตาตามบุคลิกภาพ 16 แบบ ดวงความรัก การเงิน อาชีพ ดูดวงคู่ และเส้นทางชีวิต คำทำนายเฉพาะบุคคลแม่นยำ เตือนจุดอ่อนตามบุคลิกภาพ",

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
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  openGraph: {
    title: "สายมู.com - ดูดวงออนไลน์ฟรี ด้วย AI | โหราศาสตร์ไทย × Bazi × MBTI",
    description:
      "ดูดวงออนไลน์ฟรีด้วย AI ผสานโหราศาสตร์ไทย Bazi และ MBTI วิเคราะห์ดวงชะตาตามบุคลิกภาพ ดวงความรัก การเงิน อาชีพ พร้อมคำเตือนเฉพาะบุคลิกภาพ",
    url: "https://xn--y3cbx6azb.com",
    type: "website",
    locale: "th_TH",
    siteName: "สายมู.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "สายมู - ดูดวงออนไลน์ฟรี",
        type: "image/jpeg",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "สายมู.com - ดูดวงออนไลน์ฟรี ด้วย AI | Bazi × MBTI",
    description:
      "ดูดวงฟรีด้วย AI ผสานโหราศาสตร์ไทย Bazi และ MBTI วิเคราะห์ดวงชะตาตามบุคลิกภาพ พร้อมคำเตือนเฉพาะบุคลิก | สายมู.com",
    images: ["/og-image.jpg"],
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
      <body>
        <AdSenseScript />
        <Analytics />
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
