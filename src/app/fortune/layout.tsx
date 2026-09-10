import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ดูดวงฟรี เริ่มจากวันเกิดของคุณ',
  description:
    'ดูดวงฟรีจากวันเกิดกับสายมู บอกชื่อและข้อมูลเกิดเพื่อดูผลเบื้องต้น ใช้ดวงไทย ปาจื้อ และ MBTI ที่คุณเลือกบอก อยากอ่านครบทั้ง 6 ด้าน ค่อยเข้าสู่ระบบ',
  alternates: {
    canonical: '/fortune',
  },
  openGraph: {
    title: 'ดูดวงฟรี เริ่มจากวันเกิดของคุณ | สายมู.com',
    description:
      'เริ่มดูดวงฟรีด้วย AI ผสานโหราศาสตร์ไทย Bazi และ MBTI รับคำทำนายเฉพาะบุคคล ดวงความรัก การเงิน และอาชีพ',
    type: 'website',
    locale: 'th_TH',
    siteName: 'สายมู.com',
    images: [
      {
        url: '/og-image-v2.jpg',
        width: 1200,
        height: 630,
        alt: 'สายมู ดูดวงออนไลน์ฟรี',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ดูดวงฟรี เริ่มจากวันเกิดของคุณ | สายมู.com',
    description:
      'เริ่มดูดวงฟรีด้วย AI ผสานโหราศาสตร์ไทย Bazi และ MBTI รับคำทำนายเฉพาะบุคคล ดวงความรัก การเงิน และอาชีพ',
    images: ['/og-image-v2.jpg'],
    site: '@สายมู',
  },
};

export default function FortuneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
