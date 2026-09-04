import type { Metadata } from 'next';
import { AppHeader } from '@/components/layout/app-header';

export const metadata: Metadata = {
  title: 'ดวงชะตาของเจ้า | สายมู.com',
  description: 'มาดูดวงของเจ้ากันเถอะ! วิเคราะห์ดวงชะตาด้วย AI ผสานโหราศาสตร์ไทยและ Bazi | สายมู.com',

  openGraph: {
    title: 'มาดูดวงของเจ้ากันเถอะ! | สายมู.com',
    description: 'ดูดวงชะตาด้วย AI ผสานโหราศาสตร์ไทยและ Bazi วิเคราะห์ดวงความรัก การเงิน อาชีพ | สายมู.com',
    type: 'website',
    locale: 'th_TH',
    siteName: 'สายมู.com',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'สายมู.com - ดูดวงออนไลน์ฟรี',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'มาดูดวงของเจ้ากันเถอะ! | สายมู.com',
    description: 'ดูดวงชะตาด้วย AI ผสานโหราศาสตร์ไทยและ Bazi วิเคราะห์ดวงความรัก การเงิน อาชีพ | สายมู.com',
    images: ['/og-image.jpg'],
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
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
