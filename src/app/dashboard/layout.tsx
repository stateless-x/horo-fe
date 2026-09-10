import type { Metadata } from 'next';
import { DashboardProfileGate } from '@/components/dashboard/dashboard-profile-gate';

export const metadata: Metadata = {
  title: 'ดวงชะตาของคุณ',
  description: 'ลองมาเปิดดวงของคุณกัน วิเคราะห์ดวงชะตาด้วย AI ผสานโหราศาสตร์ไทยและ Bazi | สายมู.com',

  openGraph: {
    title: 'ลองมาเปิดดวงของคุณกัน | สายมู.com',
    description: 'ดูดวงชะตาด้วย AI ผสานโหราศาสตร์ไทยและ Bazi วิเคราะห์ดวงความรัก การเงิน อาชีพ | สายมู.com',
    type: 'website',
    locale: 'th_TH',
    siteName: 'สายมู.com',
    images: [
      {
        url: '/og-image-v2.jpg',
        width: 1200,
        height: 630,
        alt: 'สายมู.com ดูดวงออนไลน์ฟรี',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'ลองมาเปิดดวงของคุณกัน | สายมู.com',
    description: 'ดูดวงชะตาด้วย AI ผสานโหราศาสตร์ไทยและ Bazi วิเคราะห์ดวงความรัก การเงิน อาชีพ | สายมู.com',
    images: ['/og-image-v2.jpg'],
    site: '@สายมู',
    creator: '@สายมู',
  },

  // Private, authenticated app area — not meant to be indexed.
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardProfileGate>{children}</DashboardProfileGate>;
}
