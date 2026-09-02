import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ดูดวงฟรี ด้วย AI — เริ่มเปิดดวงของเจ้า | สายมู',
  description:
    'เริ่มดูดวงฟรีด้วย AI ผสานโหราศาสตร์ไทย Bazi (ซื่อจู๋) และ MBTI กรอกวันเกิดและบุคลิกภาพเพื่อรับคำทำนายเฉพาะบุคคล ดวงความรัก การเงิน และอาชีพ',
  alternates: {
    canonical: '/fortune',
  },
  openGraph: {
    title: 'ดูดวงฟรี ด้วย AI — เริ่มเปิดดวงของเจ้า | สายมู.com',
    description:
      'เริ่มดูดวงฟรีด้วย AI ผสานโหราศาสตร์ไทย Bazi และ MBTI รับคำทำนายเฉพาะบุคคล ดวงความรัก การเงิน และอาชีพ',
    type: 'website',
    locale: 'th_TH',
    siteName: 'สายมู.com',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'สายมู - ดูดวงออนไลน์ฟรี',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ดูดวงฟรี ด้วย AI — เริ่มเปิดดวงของเจ้า | สายมู.com',
    description:
      'เริ่มดูดวงฟรีด้วย AI ผสานโหราศาสตร์ไทย Bazi และ MBTI รับคำทำนายเฉพาะบุคคล ดวงความรัก การเงิน และอาชีพ',
    images: ['/og-image.jpg'],
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
