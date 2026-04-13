import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'คุณถูกเชิญมาดูดวงคู่ | สายมู.com',
  description: 'เพื่อนของคุณเชิญมาดูดวงความสัมพันธ์ร่วมกัน วิเคราะห์ด้วย AI ผสานโหราศาสตร์ไทยและ Bazi | สายมู.com',

  openGraph: {
    title: 'คุณถูกเชิญมาดูดวงคู่ | สายมู.com',
    description: 'เพื่อนของคุณเชิญมาดูดวงความสัมพันธ์ร่วมกัน วิเคราะห์ด้วย AI ผสานโหราศาสตร์ไทยและ Bazi | สายมู.com',
    type: 'website',
    locale: 'th_TH',
    siteName: 'สายมู.com',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'สายมู.com - ดูดวงออนไลน์ฟรี',
        type: 'image/jpeg',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'คุณถูกเชิญมาดูดวงคู่ | สายมู.com',
    description: 'เพื่อนของคุณเชิญมาดูดวงความสัมพันธ์ร่วมกัน วิเคราะห์ด้วย AI ผสานโหราศาสตร์ไทยและ Bazi | สายมู.com',
    images: ['/og-image.jpg'],
    site: '@สายมู',
  },
};

export default function InviteTokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
