import Link from 'next/link';
import { BASE_URL } from '@/lib/knowledge-base';
/**
 * Same 7 Q&As rendered both as the visible FAQ section below and as the
 * FAQPage JSON-LD in structuredData — keep these in sync when editing either.
 */
const FAQ_ITEMS = [
  {
    "question": "สายมูดูดวงแบบไหน",
    "answer": "สายมูเป็นเว็บดูดวงออนไลน์ฟรี ใช้ AI เรียบเรียงคำทำนายจากโหราศาสตร์ไทยและดวงจีนปาจื้อ ถ้าคุณระบุ MBTI เราจะนำมาใช้ประกอบคำแนะนำด้วย มีทั้งดวงส่วนตัว ดวงรายวัน และดวงคู่"
  },
  {
    "question": "ดูดวงฟรี ต้องสมัครก่อนไหม",
    "answer": "ดูผลเบื้องต้นได้ฟรีก่อนสมัคร เมื่ออยากอ่านดวงเต็มหรือกลับมาดูดวงรายวัน ให้เข้าสู่ระบบด้วย Google หรือ X การดูดวงมีจำนวนครั้งที่จำกัด โดยจะแจ้งให้ทราบเมื่อใช้ครบ"
  },
  {
    "question": "ต้องรู้อะไรบ้างก่อนดูดวง",
    "answer": "เตรียมชื่อเล่น วันเดือนปีเกิด และเพศกำเนิดสำหรับคำนวณปาจื้อ ถ้ารู้เวลาเกิดหรือ MBTI ก็ใส่เพิ่มได้ ไม่รู้สองอย่างนี้ก็ข้ามได้"
  },
  {
    "question": "ปาจื้อ หรือ Bazi คืออะไร",
    "answer": "ปาจื้อเป็นโหราศาสตร์จีนที่อ่านปี เดือน วัน และเวลาเกิดเป็นเสาชะตาสี่เสา สายมูใช้ข้อมูลนี้อ่านธาตุและตีความจังหวะชีวิตตามความเชื่อของศาสตร์นี้"
  },
  {
    "question": "ดูดวงด้วย AI เชื่อได้แค่ไหน",
    "answer": "AI ช่วยเรียบเรียงคำทำนายจากข้อมูลที่คุณให้และหลักโหราศาสตร์ที่ระบบใช้ คำทำนายอาจไม่ตรงกับชีวิตจริงทั้งหมด อ่านเพื่อความเพลิดเพลินและเป็นมุมมองประกอบการตัดสินใจได้ โดยคุณยังเป็นคนเลือกทางของตัวเอง"
  },
  {
    "question": "ไม่รู้ MBTI ดูดวงได้ไหม",
    "answer": "ได้เลย MBTI เป็นข้อมูลเสริมเพื่อประกอบคำแนะนำเรื่องนิสัย ข้ามขั้นตอนนี้ได้โดยยังดูดวงจากข้อมูลวันเกิด และกลับมาเพิ่ม MBTI ที่หน้าตั้งค่าได้ภายหลัง"
  },
  {
    "question": "ข้อมูลที่กรอกเอาไปใช้ทำอะไร",
    "answer": "เราใช้ข้อมูลที่คุณกรอกเพื่อคำนวณและจัดทำคำทำนาย รวมถึงเก็บไว้ให้กลับมาใช้งานต่อ ผู้ให้บริการระบบและ AI อาจประมวลผลข้อมูลตามที่ระบุในนโยบายความเป็นส่วนตัว อ่านรายละเอียดและช่องทางติดต่อได้ที่หน้านโยบายความเป็นส่วนตัว"
  }
];

/**
 * SEO Content Sections
 *
 * Server-side rendered component for SEO optimization.
 * JSON-LD structured data is invisible in <head>. The FAQ text below is
 * rendered visibly (an open, honest FAQ section) so it matches what's in
 * the FAQPage JSON-LD rather than being hidden from users.
 */
export function SEOSections() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${BASE_URL}/#webapp`,
        "publisher": { "@id": `${BASE_URL}/#organization` },
        "name": "สายมู.com ดูดวงด้วย AI",
        "alternateName": "สายมู",
        "applicationCategory": "LifestyleApplication",
        "description": "สายมู ดูดวงออนไลน์ฟรีด้วย AI จากโหราศาสตร์ไทย ปาจื้อ และ MBTI ที่คุณระบุ อ่านดวงส่วนตัว ดวงรายวัน และดวงคู่",
        "operatingSystem": "Web Browser",
        "url": "https://xn--y3cbx6azb.com",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "THB"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer,
          },
        })),
      },
      {
        // Same @id as the Organization node on /ai. Two pages describing the
        // same entity must agree on one identifier, or a search engine ends
        // up holding two half-strength entities instead of one strong one.
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        "name": "สายมู.com",
        "alternateName": "สายมู",
        "url": "https://xn--y3cbx6azb.com",
        "logo": "https://xn--y3cbx6azb.com/og-image.jpg",
        "description": "สายมู ดูดวงออนไลน์ฟรีด้วย AI จากโหราศาสตร์ไทย ปาจื้อ และ MBTI ที่คุณระบุ อ่านดวงส่วนตัว ดวงรายวัน และดวงคู่",
        "sameAs": [
          "https://twitter.com/สายมู",
          "https://xn--y3cbx6azb.com"
        ]
      }
    ]
  };

  return (
    <>
      {/* JSON-LD Structured Data.
          Plain <script>, not next/script: next/script defaults to
          strategy="afterInteractive", which injects the tag client-side after
          hydration, so the JSON-LD was absent from the server HTML that
          crawlers and AI answer engines read. A plain tag is rendered into
          the prerendered markup. Verify with:
            grep -c 'application/ld+json' .next/server/app/index.html */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Visible FAQ section — matches the FAQPage JSON-LD above so users
          see exactly what search engines see (no hidden/cloaked content). */}
      <section className="border-t border-surface2/20 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="font-heading text-ink text-2xl md:text-3xl mb-8 text-center">
            อยากรู้อีกนิดก่อนดูดวง
          </h2>
          <p className="mb-6 text-sm text-inkMuted text-center">อ่านเรื่องข้อมูลของคุณได้ที่ <Link href="/privacy" className="underline underline-offset-4">นโยบายความเป็นส่วนตัว</Link> แวะดู <Link href="/calendar" className="underline underline-offset-4">ปฏิทินไทย</Link> หรือดูข้อเท็จจริงทั้งหมดของสายมูที่ <Link href="/ai" className="underline underline-offset-4">หน้าข้อมูลอ้างอิง</Link></p>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-edge bg-white/3 open:border-accentBright/40 open:bg-accent/10 transition-colors"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 px-5 py-4 text-ink font-oracle text-sm md:text-base">
                  {item.question}
                  <svg
                    className="w-4 h-4 shrink-0 text-accentBright transition-transform group-open:rotate-90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </summary>
                <p className="px-5 pb-4 text-inkMuted font-oracle text-sm leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
