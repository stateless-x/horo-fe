import type { Metadata } from 'next';

/**
 * Share-preview copy for an invite link — the one path where the sender is
 * explicitly asking someone to join them, so the preview should read like an
 * invitation from a person, not a description of a product.
 *
 * The old copy repeated the same "วิเคราะห์ด้วย AI ผสานโหราศาสตร์ไทยและ Bazi"
 * sentence as every other page; a recipient scrolling LINE cannot tell it apart
 * from an ad. This names the one thing only they can do: complete the pair.
 */
export const metadata: Metadata = {
  title: 'เพื่อนชวนคุณมาเช็คดวงคู่',
  description:
    'เขาอยากรู้ว่าคุณสองคนเข้ากันแค่ไหน ใส่แค่วันเกิด แล้วดูผลพร้อมกัน ฟรี | สายมู.com',

  openGraph: {
    title: 'เพื่อนชวนคุณมาเช็คดวงคู่ 💫',
    description: 'เขาอยากรู้ว่าคุณสองคนเข้ากันแค่ไหน ใส่แค่วันเกิด แล้วดูผลพร้อมกัน ฟรี',
    type: 'website',
    locale: 'th_TH',
    siteName: 'สายมู.com',
    images: [
      {
        url: '/og-image-v2.jpg',
        width: 1200,
        height: 630,
        alt: 'สายมู.com ดูดวงออนไลน์ฟรี',
        type: 'image/jpeg',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'เพื่อนชวนคุณมาเช็คดวงคู่ 💫',
    description: 'เขาอยากรู้ว่าคุณสองคนเข้ากันแค่ไหน ใส่แค่วันเกิด แล้วดูผลพร้อมกัน ฟรี',
    images: ['/og-image-v2.jpg'],
    site: '@สายมู',
  },

  // Private, per-invite share links — not meant to be indexed.
  robots: {
    index: false,
    follow: false,
  },
};

export default function InviteTokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
