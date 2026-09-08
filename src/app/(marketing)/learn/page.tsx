import type { Metadata } from 'next';
import { LearnIndexPage } from '@/components/learn/learn-index';

export const metadata: Metadata = {
  title: 'คลังความรู้เรื่องดวงและการรู้จักตัวเอง',
  description:
    'รวมคู่มือภาษาไทยของศาสตร์ที่สายมูใช้ ทั้งโหราศาสตร์ไทย ปาจื้อ MBTI และมูเตลู พร้อมตารางอ้างอิงและข้อจำกัดของแต่ละศาสตร์',
  alternates: { canonical: '/learn' },
  openGraph: {
    title: 'คลังความรู้เรื่องดวงและการรู้จักตัวเอง | สายมู',
    description: 'คู่มือภาษาไทยของแต่ละศาสตร์ที่สายมูใช้ พร้อมตารางอ้างอิงและข้อจำกัด',
    url: '/learn',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'คลังความรู้สายมู' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'คลังความรู้เรื่องดวงและการรู้จักตัวเอง | สายมู',
    description: 'คู่มือภาษาไทยของแต่ละศาสตร์ที่สายมูใช้ พร้อมตารางอ้างอิงและข้อจำกัด',
    images: ['/og-image.jpg'],
  },
};

export default function LearnIndexRoute() {
  return <LearnIndexPage />;
}
