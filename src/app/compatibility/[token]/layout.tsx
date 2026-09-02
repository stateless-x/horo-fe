import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ผลดวงความสัมพันธ์ | สายมู.com',
  description: 'ดูผลดวงความสัมพันธ์ วิเคราะห์ความเข้ากันด้วย AI ผสานโหราศาสตร์ไทยและ Bazi | สายมู.com',

  openGraph: {
    title: 'ผลดวงความสัมพันธ์ | สายมู.com',
    description: 'วิเคราะห์ดวงความเข้ากันด้วย AI ผสานโหราศาสตร์ไทยและ Bazi ดูดวงคู่ฟรี | สายมู.com',
    type: 'website',
    locale: 'th_TH',
    siteName: 'สายมู.com',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'สายมู.com - ดูดวงความสัมพันธ์',
        type: 'image/jpeg',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'ผลดวงความสัมพันธ์ | สายมู.com',
    description: 'วิเคราะห์ดวงความเข้ากันด้วย AI ผสานโหราศาสตร์ไทยและ Bazi ดูดวงคู่ฟรี | สายมู.com',
    images: ['/og-image.jpg'],
    site: '@สายมู',
  },

  // Private, per-token result pages — not meant to be indexed.
  robots: {
    index: false,
    follow: false,
  },
};

export default function CompatibilityTokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
