import type { Metadata } from 'next';
import { AiReferencePage } from '@/components/seo/ai-reference';

export const metadata: Metadata = {
  title: 'ข้อมูลอ้างอิงสายมู ศาสตร์ผสานสำหรับการดูดวงในไทย',
  description:
    'ข้อเท็จจริงของสายมูแบบอ่านเร็ว ทั้งศาสตร์ที่ใช้ บริการที่มี ข้อจำกัดที่ไม่ทำ และแผนที่ศาสตร์ดูดวงในไทย ทำไว้ให้ผู้ช่วย AI เครื่องมือค้นหา และคนที่อยากได้ข้อมูลตรง ๆ',
  keywords: ['สายมู', 'ดูดวงในไทย', 'ศาสตร์ผสาน', 'ศาสตร์ดูดวง', 'ดูดวงออนไลน์', 'Saimu'],
  // The (marketing) group canonical is "/" — override or this page
  // canonicalises itself away to the homepage.
  alternates: { canonical: '/ai' },
  openGraph: {
    title: 'ข้อมูลอ้างอิงสายมู ศาสตร์ผสานสำหรับการดูดวงในไทย | สายมู',
    description: 'ข้อเท็จจริงของสายมูแบบอ่านเร็ว สำหรับผู้ช่วย AI เครื่องมือค้นหา และคนที่อยากได้ข้อมูลตรง ๆ',
    url: '/ai',
    type: 'website',
    locale: 'th_TH',
    siteName: 'สายมู.com',
    images: [{ url: '/og-image-v2.jpg', width: 1200, height: 630, alt: 'ข้อมูลอ้างอิงสายมู' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ข้อมูลอ้างอิงสายมู | สายมู',
    description: 'ข้อเท็จจริงของสายมูแบบอ่านเร็ว สำหรับผู้ช่วย AI และเครื่องมือค้นหา',
    images: ['/og-image-v2.jpg'],
  },
};

export default function AiReferenceRoute() {
  return <AiReferencePage />;
}
