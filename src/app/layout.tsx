import type { Metadata } from "next";
import { Providers } from "./providers";
import { Footer } from "@/components/layout/footer";
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

  metadataBase: new URL("https://xn--72caa6conb6gsa6b.com"),
  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "สายมู.com - ดูดวงออนไลน์ฟรี ด้วย AI | โหราศาสตร์ไทย × Bazi × MBTI",
    description:
      "ดูดวงออนไลน์ฟรีด้วย AI ผสานโหราศาสตร์ไทย Bazi และ MBTI วิเคราะห์ดวงชะตาตามบุคลิกภาพ ดวงความรัก การเงิน อาชีพ พร้อมคำเตือนเฉพาะบุคลิกภาพ",
    url: "https://xn--72caa6conb6gsa6b.com",
    type: "website",
    locale: "th_TH",
    siteName: "สายมู.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "สายมู - ดูดวงออนไลน์ฟรี",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "สายมู.com - ดูดวงออนไลน์ฟรี ด้วย AI | Bazi × MBTI",
    description:
      "ดูดวงฟรีด้วย AI ผสานโหราศาสตร์ไทย Bazi และ MBTI วิเคราะห์ดวงชะตาตามบุคลิกภาพ พร้อมคำเตือนเฉพาะบุคลิก | สายมู.com",
    images: ["/og-image.png"],
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
  },

  category: "lifestyle",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <Analytics />
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
