import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ | สายมู',
  description: 'เข้าสู่ระบบสายมูเพื่อดูดวงชะตาของคุณ วิเคราะห์ด้วย AI ผสานโหราศาสตร์ไทย Bazi และ MBTI',
  alternates: {
    canonical: '/login',
  },
  openGraph: {
    title: 'เข้าสู่ระบบ | สายมู.com',
    description: 'เข้าสู่ระบบสายมูเพื่อดูดวงชะตาของคุณ วิเคราะห์ด้วย AI ผสานโหราศาสตร์ไทย Bazi และ MBTI',
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
    title: 'เข้าสู่ระบบ | สายมู.com',
    description: 'เข้าสู่ระบบสายมูเพื่อดูดวงชะตาของคุณ วิเคราะห์ด้วย AI ผสานโหราศาสตร์ไทย Bazi และ MBTI',
    images: ['/og-image.jpg'],
    site: '@สายมู',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
