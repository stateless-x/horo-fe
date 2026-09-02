import Script from 'next/script';

/**
 * Same 7 Q&As rendered both as the visible FAQ section below and as the
 * FAQPage JSON-LD in structuredData — keep these in sync when editing either.
 */
const FAQ_ITEMS = [
  {
    question: 'สายมู คืออะไร?',
    answer:
      'สายมู เป็นแพลตฟอร์มดูดวงออนไลน์ที่ใช้ปัญญาประดิษฐ์ (AI) วิเคราะห์ชะตาชีวิตด้วยโหราศาสตร์ไทย Bazi (ซื่อจู๋) และ MBTI เพื่อให้คำทำนายที่แม่นยำ เฉพาะบุคคล และเข้าถึงตัวตนผ่านบุคลิกภาพ 16 แบบ',
  },
  {
    question: 'Bazi (ซื่อจู๋) คืออะไร?',
    answer:
      'Bazi หรือ ซื่อจู๋ (四柱命理) คือศาสตร์โหราจีนโบราณที่วิเคราะห์ชะตาจากเสาสี่เกิด (ปี เดือน วัน ชั่วโมง) และธาตุทั้งห้า (ไม้ ไฟ ดิน โลหะ น้ำ) เพื่อทำนายบุคลิก โชคลาภ และเส้นทางชีวิต',
  },
  {
    question: 'ดูดวงฟรีได้จริงหรือไม่?',
    answer:
      'ใช่ สายมู ให้บริการดูดวงออนไลน์ฟรี 100% คุณสามารถรับคำทำนายเบื้องต้นและดูดวงประจำวันได้โดยไม่เสียค่าใช้จ่าย',
  },
  {
    question: 'ต้องใช้ข้อมูลอะไรบ้างในการดูดวง?',
    answer:
      'ต้องใช้วันเดือนปีเกิด เวลาเกิด (ถ้ารู้จะแม่นยำกว่า) และ MBTI (ไม่จำเป็น แต่ช่วยให้คำทำนายเข้าถึงตัวตนมากขึ้น) ระบบจะคำนวณ Bazi ดวงชะตาไทย และผสมผสาน MBTI ให้โดยอัตโนมัติ',
  },
  {
    question: 'AI ดูดวงแม่นจริงหรือ?',
    answer:
      'AI ของเราผสานหลักโหราศาสตร์ไทย Bazi แบบดั้งเดิม และจิตวิทยาบุคลิกภาพ MBTI ทำให้คำทำนายสอดคล้องกับทั้งดวงดาวและตัวตนของคุณ เช่น คนที่มีธาตุน้ำและเป็น INTP จะได้รับคำเตือนเรื่องการตัดสินใจช้าตามจุดอ่อนของบุคลิกภาพ',
  },
  {
    question: 'MBTI คืออะไร? ทำไมถึงใช้ร่วมกับการดูดวง?',
    answer:
      'MBTI (Myers-Briggs Type Indicator) คือระบบจำแนกบุคลิกภาพ 16 แบบ เช่น INTP ENFJ ISFP สายมูใช้ MBTI ร่วมกับ Bazi เพื่อให้คำทำนายเข้าถึงตัวตนมากขึ้น เช่น เตือนว่าบุคลิกภาพแบบของคุณมักตอบสนองต่อสถานการณ์อย่างไร จุดอ่อนที่ควรระวัง และคำแนะนำเสริมดวงที่เหมาะกับนิสัยของคุณจริงๆ',
  },
  {
    question: 'ข้อมูลส่วนตัวปลอดภัยไหม?',
    answer:
      'เราใช้มาตรฐานความปลอดภัยระดับสูง เข้ารหัสข้อมูลทั้งหมด และไม่แชร์ข้อมูลส่วนตัวกับบุคคลที่สาม คุณสามารถลบข้อมูลได้ตลอดเวลา',
  },
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
        "name": "สายมู.com - ดูดวงด้วย AI",
        "alternateName": "สายมู",
        "applicationCategory": "LifestyleApplication",
        "description": "ดูดวงออนไลน์ฟรีด้วยปัญญาประดิษฐ์ ผสานโหราศาสตร์ไทย Bazi (ซื่อจู๋) และ MBTI วิเคราะห์ชะตาตามบุคลิกภาพ 16 แบบ ดวงความรัก การเงิน และเส้นทางชีวิต พร้อมคำเตือนเฉพาะบุคลิกภาพ",
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
        "@type": "Organization",
        "name": "สายมู.com",
        "alternateName": "สายมู",
        "url": "https://xn--y3cbx6azb.com",
        "logo": "https://xn--y3cbx6azb.com/og-image.jpg",
        "description": "แพลตฟอร์มดูดวงออนไลน์ด้วย AI ผสานโหราศาสตร์ไทย Bazi และ MBTI",
        "sameAs": [
          "https://twitter.com/สายมู",
          "https://xn--y3cbx6azb.com"
        ]
      }
    ]
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Visible FAQ section — matches the FAQPage JSON-LD above so users
          see exactly what search engines see (no hidden/cloaked content). */}
      <section className="border-t border-darkPurple/20 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="font-heading text-ghostWhite text-2xl md:text-3xl mb-8 text-center">
            คำถามที่พบบ่อย
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-white/10 bg-white/3 open:border-amethyst/40 open:bg-royalPurple/10 transition-colors"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 px-5 py-4 text-ghostWhite font-oracle text-sm md:text-base">
                  {item.question}
                  <svg
                    className="w-4 h-4 shrink-0 text-amethyst transition-transform group-open:rotate-90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </summary>
                <p className="px-5 pb-4 text-ashGray font-oracle text-sm leading-relaxed">
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
