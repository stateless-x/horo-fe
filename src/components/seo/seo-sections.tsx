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
        "description": "ดูดวงออนไลน์ฟรีด้วยปัญญาประดิษฐ์ ผสานโหราศาสตร์ไทย Bazi (ซื่อจู๋) และ MBTI วิเคราะห์ชะตาตามบุคลิกภาพ 16 แบบ ดวงความรัก การเงิน และเส้นทางชีวิต พร้อมคำเตือนเฉพาะบุคลิกภาพ",
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
              "text": "สายมู เป็นแพลตฟอร์มดูดวงออนไลน์ที่ใช้ปัญญาประดิษฐ์ (AI) วิเคราะห์ชะตาชีวิตด้วยโหราศาสตร์ไทย Bazi (ซื่อจู๋) และ MBTI เพื่อให้คำทำนายที่แม่นยำ เฉพาะบุคคล และเข้าถึงตัวตนผ่านบุคลิกภาพ 16 แบบ"
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
              "text": "ต้องใช้วันเดือนปีเกิด เวลาเกิด (ถ้ารู้จะแม่นยำกว่า) และ MBTI (ไม่จำเป็น แต่ช่วยให้คำทำนายเข้าถึงตัวตนมากขึ้น) ระบบจะคำนวณ Bazi ดวงชะตาไทย และผสมผสาน MBTI ให้โดยอัตโนมัติ"
            }
          },
          {
            "@type": "Question",
            "name": "AI ดูดวงแม่นจริงหรือ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "AI ของเราผสานหลักโหราศาสตร์ไทย Bazi แบบดั้งเดิม และจิตวิทยาบุคลิกภาพ MBTI ทำให้คำทำนายสอดคล้องกับทั้งดวงดาวและตัวตนของคุณ เช่น คนที่มีธาตุน้ำและเป็น INTP จะได้รับคำเตือนเรื่องการตัดสินใจช้าตามจุดอ่อนของบุคลิกภาพ"
            }
          },
          {
            "@type": "Question",
            "name": "MBTI คืออะไร? ทำไมถึงใช้ร่วมกับการดูดวง?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "MBTI (Myers-Briggs Type Indicator) คือระบบจำแนกบุคลิกภาพ 16 แบบ เช่น INTP ENFJ ISFP สายมูใช้ MBTI ร่วมกับ Bazi เพื่อให้คำทำนายเข้าถึงตัวตนมากขึ้น เช่น เตือนว่าบุคลิกภาพแบบของคุณมักตอบสนองต่อสถานการณ์อย่างไร จุดอ่อนที่ควรระวัง และคำแนะนำเสริมดวงที่เหมาะกับนิสัยของคุณจริงๆ"
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
        "description": "แพลตฟอร์มดูดวงออนไลน์ด้วย AI ผสานโหราศาสตร์ไทย Bazi และ MBTI",
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

      {/* Collapsed SEO Contentcrawlable but hidden from users */}
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
            เกี่ยวกับสายมูดูดวงออนไลน์ด้วย AI ผสาน Bazi × MBTI
          </summary>

          <div className="mt-6 space-y-8 text-ashGray/40 text-xs leading-relaxed font-oracle">
            {/* About */}
            <div>
              <h2 className="text-sm text-ashGray/50 font-heading mb-2">
                ดูดวงออนไลน์ฟรี ด้วย AIผสานโหราศาสตร์ไทย × Bazi (ซื่อจู๋) × MBTI
              </h2>
              <p>
                สายมู คือแพลตฟอร์มดูดวงออนไลน์ที่ใช้ปัญญาประดิษฐ์ (AI)
                วิเคราะห์ชะตาชีวิตของคุณด้วยโหราศาสตร์ไทย Bazi (ซื่อจู๋ - 四柱命理)
                และ MBTI (บุคลิกภาพ 16 แบบ) ผสาน 3 ศาสตร์เข้าด้วยกัน
                เพื่อคำทำนายที่ไม่เพียงแม่นยำตามดวงดาว แต่ยังเข้าถึงตัวตนของคุณอย่างลึกซึ้ง
              </p>
              <p className="mt-2">
                ระบบของเราผสานภูมิปัญญาไทยดั้งเดิม เช่น ดูดวงตามวันเกิด นพเคราะห์ และจักรนพคุณ
                เข้ากับ Bazi ที่วิเคราะห์จากเสาสี่เกิด (ปี เดือน วัน เวลา) และธาตุทั้งห้า
                (ไม้ ไฟ ดิน โลหะ น้ำ) แล้วเสริมด้วย MBTI ที่ช่วยให้ AI เข้าใจว่า
                บุคลิกภาพของคุณมักตอบสนองต่อสถานการณ์อย่างไร จุดอ่อนที่ควรระวัง
                และปรับคำแนะนำเสริมดวงให้เหมาะกับนิสัยของคุณจริงๆ
              </p>
            </div>

            {/* How it works */}
            <div>
              <h2 className="text-sm text-ashGray/50 font-heading mb-2">วิธีการทำงาน</h2>
              <ol className="list-decimal list-inside space-y-1">
                <li>กรอกข้อมูลเกิดระบุวันเดือนปีเกิดและเวลาเกิด ระบบจะแปลงเป็นข้อมูล Bazi และคำนวณดวงชะตาไทยโดยอัตโนมัติ</li>
                <li>เลือก MBTI (ไม่บังคับ)ถ้ารู้ MBTI ของคุณ เช่น INTP, ENFJ ระบบจะนำบุคลิกภาพไปผสานกับดวงชะตา ให้คำทำนายเข้าถึงตัวตนมากขึ้น ถ้าไม่รู้สามารถข้ามได้</li>
                <li>AI วิเคราะห์ชะตาผสานเสาสี่เกิด ธาตุทั้งห้า นพเคราะห์ วงจรชีวิต 10 ปี (大運) และ MBTI เข้าด้วยกันอย่างกลมกลืน</li>
                <li>รับคำทำนายเฉพาะบุคคลครอบคลุมทุกด้าน: บุคลิกภาพ ความรัก การเงิน อาชีพ สุขภาพ พร้อมคำเตือนตามจุดอ่อนของบุคลิกภาพ</li>
              </ol>
            </div>

            {/* Services */}
            <div>
              <h2 className="text-sm text-ashGray/50 font-heading mb-2">บริการดูดวงครบวงจร</h2>
              <ul className="space-y-1">
                <li>ดูดวงความรักวิเคราะห์ชะตารัก ความเข้ากันได้กับคู่ครอง จังหวะเวลาความรัก ผสาน MBTI เพื่อเข้าใจว่าบุคลิกภาพของคุณตอบสนองต่อความรักอย่างไร</li>
                <li>ดูดวงการงานอาชีพที่เหมาะสม จุดแข็ง-จุดอ่อน โอกาสในการทำงาน พร้อมคำเตือนตามจุดอ่อนของ MBTI เช่น INTP ระวังเรื่องการตัดสินใจช้า</li>
                <li>ดูดวงการเงินโชคลาภ ช่วงเวลาลงทุน คำเตือนเรื่องการเงินตามนิสัยของบุคลิกภาพ</li>
                <li>ดูดวงคู่วิเคราะห์ความเข้ากันของ MBTI ร่วมกับธาตุทั้งห้า เช่น INTP กับ ENFJ มีพลังเสริมกันอย่างไร</li>
                <li>ดูดวงประจำปีคำทำนายรายปี จังหวะเวลาดี-ร้าย สีและเลขมงคล</li>
                <li>ดูดวงธาตุสมดุลห้าธาตุ คำแนะนำเสริมดวงด้วยสี อัญมณี ทิศทาง</li>
              </ul>
            </div>

            {/* Five elements */}
            <div>
              <h2 className="text-sm text-ashGray/50 font-heading mb-2">ห้าธาตุใน Bazi</h2>
              <ul className="space-y-1">
                <li>ธาตุไม้ (Wood)การเติบโต ความคิดสร้างสรรค์ ความยืดหยุ่น</li>
                <li>ธาตุไฟ (Fire)พลังงาน ความกระตือรือร้น ความหลงใหล</li>
                <li>ธาตุดิน (Earth)ความมั่นคง ความน่าเชื่อถือ การบำรุงเลี้ยง</li>
                <li>ธาตุโลหะ (Metal)ความมีระเบียบ ความยุติธรรม ความแข็งแกร่ง</li>
                <li>ธาตุน้ำ (Water)ปัญญา ความลึกลับ การปรับตัว</li>
              </ul>
            </div>

            {/* Thai vs Bazi vs MBTI */}
            <div>
              <h2 className="text-sm text-ashGray/50 font-heading mb-2">ทำไมต้องผสาน 3 ศาสตร์? โหราศาสตร์ไทย × Bazi × MBTI</h2>
              <p>
                โหราศาสตร์ไทยเน้นวิเคราะห์จากวันเกิด นพเคราะห์ จักรนพคุณ ใช้ดูความสัมพันธ์ โชคลาภ จังหวะเวลา
                Bazi (ซื่อจู๋) วิเคราะห์จากเสาสี่เกิดและธาตุทั้ง 60 องค์ ให้มุมมองลึกเรื่องพรสวรรค์ วงจรชีวิต 10 ปี
                เหมาะสำหรับวางแผนชีวิตระยะยาว
              </p>
              <p className="mt-2">
                MBTI (Myers-Briggs Type Indicator) คือเครื่องมือจิตวิทยาที่จำแนกบุคลิกภาพ 16 แบบ
                ตามความถนัดในการรับรู้และตัดสินใจ แบ่งเป็น 4 กลุ่มหลัก:
                นักวิเคราะห์ (INTJ, INTP, ENTJ, ENTP) นักการทูต (INFJ, INFP, ENFJ, ENFP)
                ผู้พิทักษ์ (ISTJ, ISFJ, ESTJ, ESFJ) และนักสำรวจ (ISTP, ISFP, ESTP, ESFP)
              </p>
              <p className="mt-2">
                เมื่อผสาน MBTI เข้ากับดวงชะตา คำทำนายจะแม่นยำและเป็นส่วนตัวมากขึ้น
                เช่น คนธาตุน้ำที่เป็น INTP จะมีพลังวิเคราะห์ที่ลึกซึ้งเป็นพิเศษ
                แต่ต้องระวังเรื่องการตัดสินใจช้าเพราะทั้งธาตุและบุคลิกภาพดึงไปทางเดียวกัน
                AI จะเตือนตามจุดอ่อนของบุคลิกภาพ เช่น ENFP ดวงการเงินดีแต่นิสัยชอบใช้เงินแบบไม่วางแผน
                ก็จะได้รับคำเตือนเรื่องนี้โดยเฉพาะ ทำให้คำแนะนำเสริมดวงเข้ากับตัวตนจริงๆ
              </p>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-sm text-ashGray/50 font-heading mb-2">คำถามที่พบบ่อย</h2>
              <dl className="space-y-2">
                <div><dt className="text-ashGray/50">สายมู คืออะไร?</dt><dd>แพลตฟอร์มดูดวงออนไลน์ด้วย AI ผสานโหราศาสตร์ไทย Bazi และ MBTI</dd></div>
                <div><dt className="text-ashGray/50">ดูดวงฟรีได้จริงหรือไม่?</dt><dd>ใช่ ให้บริการฟรี 100% รับคำทำนายเบื้องต้นและดูดวงประจำวันได้ไม่เสียค่าใช้จ่าย</dd></div>
                <div><dt className="text-ashGray/50">ต้องใช้ข้อมูลอะไร?</dt><dd>วันเดือนปีเกิด เวลาเกิด และ MBTI (ไม่บังคับ) ระบบคำนวณ Bazi ดวงชะตาไทย และผสมผสาน MBTI อัตโนมัติ</dd></div>
                <div><dt className="text-ashGray/50">ไม่รู้ MBTI ของตัวเอง ดูดวงได้ไหม?</dt><dd>ได้ MBTI เป็นตัวเลือกเสริม ถ้าไม่รู้สามารถข้ามได้ หรือทำแบบทดสอบฟรีที่ 16personalities.com/th</dd></div>
                <div><dt className="text-ashGray/50">MBTI ช่วยให้ดูดวงแม่นขึ้นอย่างไร?</dt><dd>MBTI ช่วยให้ AI เข้าใจว่าบุคลิกภาพของคุณมักตอบสนองต่อสถานการณ์อย่างไร เตือนจุดอ่อน และปรับคำแนะนำให้เหมาะกับนิสัยจริง เช่น INTP จะได้รับคำเตือนเรื่องการตัดสินใจช้า ESFP จะได้รับคำเตือนเรื่องการวางแผน</dd></div>
                <div><dt className="text-ashGray/50">AI ดูดวงแม่นจริงหรือ?</dt><dd>ผสาน 3 ศาสตร์: หลักโหราศาสตร์ดั้งเดิม Bazi และจิตวิทยา MBTI ให้คำทำนายที่สอดคล้องกับทั้งดวงดาวและตัวตนของคุณ</dd></div>
                <div><dt className="text-ashGray/50">ข้อมูลส่วนตัวปลอดภัยไหม?</dt><dd>เข้ารหัสข้อมูลทั้งหมด ไม่แชร์กับบุคคลที่สาม ลบข้อมูลได้ตลอดเวลา</dd></div>
              </dl>
            </div>

            {/* Glossary */}
            <div>
              <h2 className="text-sm text-ashGray/50 font-heading mb-2">อภิธานศัพท์โหราศาสตร์</h2>
              <dl className="space-y-1">
                <div><dt className="text-ashGray/50 inline">Bazi (ซื่อจู๋):</dt> <dd className="inline">ศาสตร์โหราจีนวิเคราะห์จากเสาสี่เกิด</dd></div>
                <div><dt className="text-ashGray/50 inline">เสาสี่เกิด:</dt> <dd className="inline">สี่เสาหลักในดวงชะตา Baziเสาปี เสาเดือน เสาวัน เสาชั่วโมง</dd></div>
                <div><dt className="text-ashGray/50 inline">ห้าธาตุ:</dt> <dd className="inline">ไม้ ไฟ ดิน โลหะ น้ำองค์ประกอบพื้นฐานใน Bazi</dd></div>
                <div><dt className="text-ashGray/50 inline">นพเคราะห์:</dt> <dd className="inline">เทพเจ้าทั้งเก้าในโหราศาสตร์ไทย</dd></div>
                <div><dt className="text-ashGray/50 inline">จักรนพคุณ:</dt> <dd className="inline">วงจรโชคชะตาหมุนเวียนทุก 9 ปี</dd></div>
                <div><dt className="text-ashGray/50 inline">วงจร 10 ปี (大運):</dt> <dd className="inline">วงจรชะตาชีวิตใน Bazi เปลี่ยนทุก 10 ปี</dd></div>
                <div><dt className="text-ashGray/50 inline">MBTI:</dt> <dd className="inline">Myers-Briggs Type Indicatorระบบจำแนกบุคลิกภาพ 16 แบบ ใช้เสริมความแม่นยำของคำทำนาย</dd></div>
                <div><dt className="text-ashGray/50 inline">บุคลิกภาพ 16 แบบ:</dt> <dd className="inline">แบ่งเป็น 4 กลุ่มนักวิเคราะห์ (NT) นักการทูต (NF) ผู้พิทักษ์ (SJ) นักสำรวจ (SP)</dd></div>
                <div><dt className="text-ashGray/50 inline">Cognitive Functions:</dt> <dd className="inline">ฟังก์ชันทางจิตใน MBTI เช่น Ti (ตรรกะภายใน) Ne (สัญชาตญาณสร้างสรรค์) ใช้วิเคราะห์จุดแข็ง-จุดอ่อน</dd></div>
                <div><dt className="text-ashGray/50 inline">ดูดวงคู่:</dt> <dd className="inline">วิเคราะห์ความเข้ากันได้ระหว่างสองคนด้วยธาตุทั้งห้าและ MBTI</dd></div>
              </dl>
            </div>
          </div>
        </details>
      </section>
    </>
  );
}
