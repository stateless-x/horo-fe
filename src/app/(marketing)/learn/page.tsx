import type { Metadata } from 'next';
import { LearnIndexPage } from '@/components/learn/learn-content';
import { LEARN_ARTICLES } from '@/lib/learn-articles';

export const metadata: Metadata = {
  title: 'คลังความรู้เรื่องดวงและการรู้จักตัวเอง',
  description:
    'อ่านบทความภาษาไทยเรื่องปาจื้อ โหราศาสตร์ไทย MBTI และมูเตลู พร้อมแนวทางใช้ความเชื่อเป็นมุมมองประกอบการใช้ชีวิต',
  alternates: { canonical: '/learn' },
  openGraph: {
    title: 'คลังความรู้เรื่องดวงและการรู้จักตัวเอง | สายมู',
    description: 'บทความภาษาไทยเรื่องดวง ความเชื่อ และการรู้จักตัวเองจากสายมู',
    url: '/learn',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'คลังความรู้สายมู' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'คลังความรู้เรื่องดวงและการรู้จักตัวเอง | สายมู',
    description: 'บทความภาษาไทยเรื่องดวง ความเชื่อ และการรู้จักตัวเองจากสายมู',
    images: ['/og-image.jpg'],
  },
};

export default function LearnIndexRoute() {
  return <LearnIndexPage articles={LEARN_ARTICLES} />;
}
