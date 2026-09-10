import type { Metadata } from 'next';

/**
 * Share-preview copy for a compatibility result someone sent to a friend.
 *
 * Written for the *recipient*, who has not seen the reading and has no account.
 * The old copy ("ผลดวงความสัมพันธ์ | สายมู.com") described the filing category
 * rather than giving anyone a reason to tap, so this leads with the open loop —
 * a result exists and it is about the two of them — and lets the score stay
 * unseen until they open it.
 *
 * Deliberately carries no partner name, score, or element: those are per-token
 * values and this is static metadata, but more importantly partner names are
 * user-entered and OG previews get cached by third-party crawlers.
 */
export const metadata: Metadata = {
  title: 'มีคนส่งผลดวงคู่มาให้คุณ',
  description:
    'เพื่อนเช็คดวงความเข้ากันไว้แล้ว และอยากให้คุณเห็นผล เปิดดูได้เลย ฟรี ไม่ต้องสมัคร | สายมู.com',

  openGraph: {
    title: 'มีคนส่งผลดวงคู่มาให้คุณ 👀',
    description:
      'เขาเช็คดวงความเข้ากันไว้แล้ว เหลือแค่คุณกดดู ฟรี ไม่ต้องสมัคร',
    type: 'website',
    locale: 'th_TH',
    siteName: 'สายมู.com',
    images: [
      {
        url: '/og-image-v2.jpg',
        width: 1200,
        height: 630,
        alt: 'สายมู.com ดูดวงความสัมพันธ์',
        type: 'image/jpeg',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'มีคนส่งผลดวงคู่มาให้คุณ 👀',
    description:
      'เขาเช็คดวงความเข้ากันไว้แล้ว เหลือแค่คุณกดดู ฟรี ไม่ต้องสมัคร',
    images: ['/og-image-v2.jpg'],
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
