import Script from 'next/script';

/**
 * SEO Content Sections
 *
 * Server-side rendered component for SEO optimization.
 * JSON-LD structured data is invisible in <head>.
 * All text content is collapsed in a <details> element —
 * crawlable by search engines but hidden from users by default.
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
        "description": "ดูดวงออนไลน์ฟรีด้วยปัญญาประดิษฐ์ ผสานโหราศาสตร์ไทยและ Bazi (ซื่อจู๋) วิเคราะห์ชะตา ดวงความรัก การเงิน และเส้นทางชีวิต",
        "operatingSystem": "Web Browser",
        "url": "https://สายมู.com",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "THB"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "สายมู คืออะไร?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "สายมู เป็นแพลตฟอร์มดูดวงออนไลน์ที่ใช้ปัญญาประดิษฐ์ (AI) วิเคราะห์ชะตาชีวิตด้วยโหราศาสตร์ไทยและ Bazi (ซื่อจู๋) เพื่อให้คำทำนายที่แม่นยำและเฉพาะบุคคล"
            }
          },
          {
            "@type": "Question",
            "name": "Bazi (ซื่อจู๋) คืออะไร?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Bazi หรือ ซื่อจู๋ (四柱命理) คือศาสตร์โหราจีนโบราณที่วิเคราะห์ชะตาจากเสาสี่เกิด (ปี เดือน วัน ชั่วโมง) และธาตุทั้งห้า (ไม้ ไฟ ดิน โลหะ น้ำ) เพื่อทำนายบุคลิก โชคลาภ และเส้นทางชีวิต"
            }
          },
          {
            "@type": "Question",
            "name": "ดูดวงฟรีได้จริงหรือไม่?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "ใช่ สายมู ให้บริการดูดวงออนไลน์ฟรี 100% คุณสามารถรับคำทำนายเบื้องต้นและดูดวงประจำวันได้โดยไม่เสียค่าใช้จ่าย"
            }
          },
          {
            "@type": "Question",
            "name": "ต้องใช้ข้อมูลอะไรบ้างในการดูดวง?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "ต้องใช้วันเดือนปีเกิด (วันที่เกิดตามปฏิทินสากล) และเวลาเกิด (ถ้ารู้จะแม่นยำกว่า) ระบบจะคำนวณ Bazi และดวงชะตาไทยให้โดยอัตโนมัติ"
            }
          },
          {
            "@type": "Question",
            "name": "AI ดูดวงแม่นจริงหรือ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "AI ของเราได้รับการฝึกฝนด้วยหลักการโหราศาสตร์ไทยและ Bazi แบบดั้งเดิม ผสมผสานกับการวิเคราะห์ข้อมูลจำนวนมาก ให้คำทำนายที่สอดคล้องกับหลักโหราศาสตร์และปรับแต่งให้เข้ากับบริบทสมัยใหม่"
            }
          },
          {
            "@type": "Question",
            "name": "ข้อมูลส่วนตัวปลอดภัยไหม?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "เราใช้มาตรฐานความปลอดภัยระดับสูง เข้ารหัสข้อมูลทั้งหมด และไม่แชร์ข้อมูลส่วนตัวกับบุคคลที่สาม คุณสามารถลบข้อมูลได้ตลอดเวลา"
            }
          }
        ]
      },
      {
        "@type": "Organization",
        "name": "สายมู.com",
        "alternateName": "สายมู",
        "url": "https://xn--72caa6conb6gsa6b.com",
        "logo": "https://xn--72caa6conb6gsa6b.com/logo.png",
        "description": "แพลตฟอร์มดูดวงออนไลน์ด้วย AI ผสานโหราศาสตร์ไทยและ Bazi",
        "sameAs": [
          "https://twitter.com/สายมู",
          "https://สายมู.com"
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

      {/* Collapsed SEO Content — crawlable but hidden from users */}
      <section className="border-t border-darkPurple/20 mt-16">
        <details className="max-w-3xl mx-auto px-6 py-8">
          <summary className="cursor-pointer text-ashGray/50 text-sm font-oracle hover:text-ashGray/70 transition-colors list-none flex items-center gap-2">
            <svg
              className="w-4 h-4 transition-transform [[open]>&]:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            เกี่ยวกับสายมู — ดูดวงออนไลน์ด้วย AI
          </summary>

          <div className="mt-6 space-y-8 text-ashGray/40 text-xs leading-relaxed font-oracle">
            {/* About */}
            <div>
              <h2 className="text-sm text-ashGray/50 font-heading mb-2">
                ดูดวงออนไลน์ฟรี ด้วย AI — ผสานโหราศาสตร์ไทย × Bazi (ซื่อจู๋)
              </h2>
              <p>
                สายมู คือแพลตฟอร์มดูดวงออนไลน์ที่ใช้ปัญญาประดิษฐ์ (AI)
                วิเคราะห์ชะตาชีวิตของคุณด้วยโหราศาสตร์ไทยและ Bazi (ซื่อจู๋ - 四柱命理)
                ศาสตร์โหราจีนโบราณที่มีความแม่นยำสูง รับคำทำนายเฉพาะบุคคลเกี่ยวกับ
                ดวงความรัก การเงิน อาชีพการงาน และเส้นทางชีวิต โดยไม่เสียค่าใช้จ่าย
              </p>
              <p className="mt-2">
                ระบบของเราผสานภูมิปัญญาไทยดั้งเดิม เช่น ดูดวงตามวันเกิด นพเคราะห์ และจักรนพคุณ
                เข้ากับ Bazi ที่วิเคราะห์จากเสาสี่เกิด (ปี เดือน วัน เวลา) และธาตุทั้งห้า
                (ไม้ ไฟ ดิน โลหะ น้ำ) เพื่อให้คำแนะนำที่ครอบคลุมและลึกซึ้ง
              </p>
            </div>

            {/* How it works */}
            <div>
              <h2 className="text-sm text-ashGray/50 font-heading mb-2">วิธีการทำงาน</h2>
              <ol className="list-decimal list-inside space-y-1">
                <li>กรอกข้อมูลเกิด — ระบุวันเดือนปีเกิดและเวลาเกิด ระบบจะแปลงเป็นข้อมูล Bazi และคำนวณดวงชะตาไทยโดยอัตโนมัติ</li>
                <li>AI วิเคราะห์ชะตา — วิเคราะห์เสาสี่เกิด ธาตุทั้งห้า นพเคราะห์ และวงจรชีวิต 10 ปี (大運)</li>
                <li>รับคำทำนายเฉพาะบุคคล — ครอบคลุมทุกด้าน: บุคลิกภาพ ความรัก การเงิน อาชีพ สุขภาพ และคำแนะนำ</li>
              </ol>
            </div>

            {/* Services */}
            <div>
              <h2 className="text-sm text-ashGray/50 font-heading mb-2">บริการดูดวงครบวงจร</h2>
              <ul className="space-y-1">
                <li>ดูดวงความรัก — วิเคราะห์ชะตารัก ความเข้ากันได้กับคู่ครอง จังหวะเวลาความรัก</li>
                <li>ดูดวงการงาน — อาชีพที่เหมาะสม จุดแข็ง-จุดอ่อน โอกาสในการทำงาน</li>
                <li>ดูดวงการเงิน — โชคลาภ ช่วงเวลาลงทุน คำเตือนเรื่องการเงิน</li>
                <li>ดูดวงประจำปี — คำทำนายรายปี จังหวะเวลาดี-ร้าย สีและเลขมงคล</li>
                <li>ดูดวงธาตุ — สมดุลห้าธาตุ คำแนะนำเสริมดวงด้วยสี อัญมณี ทิศทาง</li>
              </ul>
            </div>

            {/* Five elements */}
            <div>
              <h2 className="text-sm text-ashGray/50 font-heading mb-2">ห้าธาตุใน Bazi</h2>
              <ul className="space-y-1">
                <li>ธาตุไม้ (Wood) — การเติบโต ความคิดสร้างสรรค์ ความยืดหยุ่น</li>
                <li>ธาตุไฟ (Fire) — พลังงาน ความกระตือรือร้น ความหลงใหล</li>
                <li>ธาตุดิน (Earth) — ความมั่นคง ความน่าเชื่อถือ การบำรุงเลี้ยง</li>
                <li>ธาตุโลหะ (Metal) — ความมีระเบียบ ความยุติธรรม ความแข็งแกร่ง</li>
                <li>ธาตุน้ำ (Water) — ปัญญา ความลึกลับ การปรับตัว</li>
              </ul>
            </div>

            {/* Thai vs Bazi */}
            <div>
              <h2 className="text-sm text-ashGray/50 font-heading mb-2">ความแตกต่างระหว่างโหราศาสตร์ไทยกับ Bazi</h2>
              <p>
                โหราศาสตร์ไทยเน้นวิเคราะห์จากวันเกิด นพเคราะห์ จักรนพคุณ ใช้ดูความสัมพันธ์ โชคลาภ จังหวะเวลา
                Bazi (ซื่อจู๋) วิเคราะห์จากเสาสี่เกิดและธาตุทั้ง 60 องค์ ให้มุมมองลึกเรื่องบุคลิกภาพ พรสวรรค์ วงจรชีวิต 10 ปี
                เหมาะสำหรับวางแผนชีวิตระยะยาว
              </p>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-sm text-ashGray/50 font-heading mb-2">คำถามที่พบบ่อย</h2>
              <dl className="space-y-2">
                <div><dt className="text-ashGray/50">สายมู คืออะไร?</dt><dd>แพลตฟอร์มดูดวงออนไลน์ด้วย AI ผสานโหราศาสตร์ไทยและ Bazi</dd></div>
                <div><dt className="text-ashGray/50">ดูดวงฟรีได้จริงหรือไม่?</dt><dd>ใช่ ให้บริการฟรี 100% รับคำทำนายเบื้องต้นและดูดวงประจำวันได้ไม่เสียค่าใช้จ่าย</dd></div>
                <div><dt className="text-ashGray/50">ต้องใช้ข้อมูลอะไร?</dt><dd>วันเดือนปีเกิดและเวลาเกิด ระบบคำนวณ Bazi และดวงชะตาไทยอัตโนมัติ</dd></div>
                <div><dt className="text-ashGray/50">AI ดูดวงแม่นจริงหรือ?</dt><dd>ฝึกฝนด้วยหลักโหราศาสตร์ดั้งเดิม ผสมการวิเคราะห์ข้อมูล ให้คำทำนายสอดคล้องกับหลักโหราศาสตร์</dd></div>
                <div><dt className="text-ashGray/50">ข้อมูลส่วนตัวปลอดภัยไหม?</dt><dd>เข้ารหัสข้อมูลทั้งหมด ไม่แชร์กับบุคคลที่สาม ลบข้อมูลได้ตลอดเวลา</dd></div>
              </dl>
            </div>

            {/* Glossary */}
            <div>
              <h2 className="text-sm text-ashGray/50 font-heading mb-2">อภิธานศัพท์โหราศาสตร์</h2>
              <dl className="space-y-1">
                <div><dt className="text-ashGray/50 inline">Bazi (ซื่อจู๋):</dt> <dd className="inline">ศาสตร์โหราจีนวิเคราะห์จากเสาสี่เกิด</dd></div>
                <div><dt className="text-ashGray/50 inline">เสาสี่เกิด:</dt> <dd className="inline">สี่เสาหลักในดวงชะตา Bazi — เสาปี เสาเดือน เสาวัน เสาชั่วโมง</dd></div>
                <div><dt className="text-ashGray/50 inline">ห้าธาตุ:</dt> <dd className="inline">ไม้ ไฟ ดิน โลหะ น้ำ — องค์ประกอบพื้นฐานใน Bazi</dd></div>
                <div><dt className="text-ashGray/50 inline">นพเคราะห์:</dt> <dd className="inline">เทพเจ้าทั้งเก้าในโหราศาสตร์ไทย</dd></div>
                <div><dt className="text-ashGray/50 inline">จักรนพคุณ:</dt> <dd className="inline">วงจรโชคชะตาหมุนเวียนทุก 9 ปี</dd></div>
                <div><dt className="text-ashGray/50 inline">วงจร 10 ปี (大運):</dt> <dd className="inline">วงจรชะตาชีวิตใน Bazi เปลี่ยนทุก 10 ปี</dd></div>
                <div><dt className="text-ashGray/50 inline">ดูดวงคู่:</dt> <dd className="inline">วิเคราะห์ความเข้ากันได้ระหว่างสองคน</dd></div>
              </dl>
            </div>
          </div>
        </details>
      </section>
    </>
  );
}
