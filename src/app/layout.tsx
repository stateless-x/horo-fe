import type { Metadata } from 'next';
import { Providers } from './providers';
import { Footer } from '@/components/layout/footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'สายมู - ดูดวงออนไลน์ฟรี ด้วย AI | โหราศาสตร์ไทย × Bazi (ซื่อจู๋)',
    template: '%s | สายมู - ดูดวงออนไลน์',
  },
  description: 'ดูดวงออนไลน์ฟรีด้วย AI ผสานโหราศาสตร์ไทยและ Bazi (ซื่อจู๋) วิเคราะห์ดวงชะตา ดวงความรัก การเงิน อาชีพ ดูดวงคู่ และเส้นทางชีวิต รับคำทำนายเฉพาะบุคคลแม่นยำจากเสาสี่เกิดและห้าธาตุ',

  keywords: [
    'ดูดวง',
    'ดูดวงฟรี',
    'ดูดวงออนไลน์',
    'ดูดวงไทย',
    'โหราศาสตร์ไทย',
    'Bazi',
    'ซื่อจู๋',
    'สี่เสาชะตา',
    'เสาสี่เกิด',
    'ดูดวงคู่',
    'ดวงชะตา',
    'ดูดวงความรัก',
    'ดูดวงการเงิน',
    'ดูดวงการงาน',
    'ดูดวงด้วย AI',
    'ห้าธาตุ',
    'นพเคราะห์',
    'จักรนพคุณ',
    'ดูดวงประจำปี',
    'ดูดวงวันเกิด',
    'สายมู',
  ],

  authors: [{ name: 'สายมู' }],
  creator: 'สายมู',
  publisher: 'สายมู',

  metadataBase: new URL('https://xn--72caa6conb6gsa6b.com'),
  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: 'สายมู.com - ดูดวงออนไลน์ฟรี ด้วย AI | โหราศาสตร์ไทย × Bazi',
    description: 'ดูดวงออนไลน์ฟรีด้วย AI ผสานโหราศาสตร์ไทยและ Bazi วิเคราะห์ดวงชะตา ดวงความรัก การเงิน อาชีพ รับคำทำนายเฉพาะบุคคลแม่นยำ',
    url: 'https://xn--72caa6conb6gsa6b.com',
    type: 'website',
    locale: 'th_TH',
    siteName: 'สายมู.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'สายมู - ดูดวงออนไลน์ฟรี',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'สายมู.com - ดูดวงออนไลน์ฟรี ด้วย AI',
    description: 'ดูดวงฟรีด้วย AI ผสานโหราศาสตร์ไทยและ Bazi วิเคราะห์ดวงชะตา ดวงความรัก การเงิน อาชีพ | สายมู.com',
    images: ['/og-image.png'],
    site: '@สายมู',
    creator: '@สายมู',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  verification: {
    // Add Google Search Console verification when available
    // google: 'your-verification-code',
  },

  category: 'lifestyle',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
