import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Horo - ดูดวงไทยฟรี',
  description: 'ดูดวงฟรีด้วยศาสตร์โหราจีนโบราณ (Bazi) และโหราศาสตร์ไทย รู้ดวงชะตา ดูความเข้ากันของคู่ วิเคราะห์แม่นยำด้วย AI',

  keywords: ['ดูดวง', 'ดูดวงฟรี', 'ดูดวงไทย', 'โหราศาสตร์', 'Bazi', 'สี่เสาชะตา', 'ดูดวงคู่', 'ดวงชะตา'],

  openGraph: {
    title: 'Horo - ดูดวงไทยฟรี',
    description: 'ดูดวงฟรีด้วย Bazi และโหราศาสตร์ไทย รู้ดวงชะตา ดูความเข้ากันของคู่',
    type: 'website',
    locale: 'th_TH',
    siteName: 'Horo',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Horo - ดูดวงไทยฟรี',
    description: 'ดูดวงฟรีด้วยศาสตร์โหราจีนโบราณและโหราศาสตร์ไทย',
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
