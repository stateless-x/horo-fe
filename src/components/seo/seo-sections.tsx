import Script from 'next/script';

/**
 * SEO Content Sections
 *
 * Server-side rendered component for SEO optimization
 * Contains structured data, FAQ, glossary, and long-tail content
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

      {/* SEO Hero Content */}
      <section className="max-w-3xl mx-auto px-6 py-8 md:py-12">
        <div className="prose prose-invert prose-lg max-w-none">
          <h1 className="text-3xl md:text-4xl font-heading text-ghostWhite mb-4 leading-tight">
            ดูดวงออนไลน์ฟรี ด้วย AI - ผสานโหราศาสตร์ไทย × Bazi (ซื่อจู๋)
          </h1>
          <p className="text-ghostWhite/80 font-oracle text-base md:text-lg leading-relaxed mb-4">
            <strong className="text-amethyst">สายมู</strong> คือแพลตฟอร์มดูดวงออนไลน์ที่ใช้ปัญญาประดิษฐ์ (AI)
            วิเคราะห์ชะตาชีวิตของคุณด้วยโหราศาสตร์ไทยและ Bazi (ซื่อจู๋ - 四柱命理)
            ศาสตร์โหราจีนโบราณที่มีความแม่นยำสูง รับคำทำนายเฉพาะบุคคลเกี่ยวกับ
            <strong> ดวงความรัก การเงิน อาชีพการงาน</strong> และ<strong>เส้นทางชีวิต</strong>
            โดยไม่เสียค่าใช้จ่าย
          </p>
          <p className="text-ashGray font-oracle text-sm md:text-base leading-relaxed">
            ระบบของเราผสานภูมิปัญญาไทยดั้งเดิม เช่น ดูดวงตามวันเกิด นพเคราะห์ และจักรนพคุณ
            เข้ากับ Bazi ที่วิเคราะห์จากเสาสี่เกิด (ปี เดือน วัน เวลา) และธาตุทั้งห้า
            (ไม้ ไฟ ดิน โลหะ น้ำ) เพื่อให้คำแนะนำที่ครอบคลุมและลึกซึ้ง
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-3xl mx-auto px-6 py-8 md:py-12">
        <h2 className="text-2xl md:text-3xl font-heading text-ghostWhite mb-6">
          วิธีการทำงานของระบบดูดวง AI
        </h2>
        <div className="space-y-6">
          <div className="rounded-lg border border-darkPurple/30 p-5 md:p-6 bg-deepNight/40">
            <h3 className="text-xl font-heading text-amethyst mb-3 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-royalPurple/20 flex items-center justify-center text-sm">1</span>
              กรอกข้อมูลเกิด
            </h3>
            <p className="text-ghostWhite/80 font-oracle text-sm md:text-base leading-relaxed">
              ระบุวันเดือนปีเกิด (ตามปฏิทินสากล) และเวลาเกิด (ถ้ารู้จะยิ่งแม่นยำ)
              ระบบจะแปลงเป็นข้อมูล Bazi และคำนวณดวงชะตาไทยโดยอัตโนมัติ
            </p>
          </div>
          <div className="rounded-lg border border-darkPurple/30 p-5 md:p-6 bg-deepNight/40">
            <h3 className="text-xl font-heading text-amethyst mb-3 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-royalPurple/20 flex items-center justify-center text-sm">2</span>
              AI วิเคราะห์ชะตา
            </h3>
            <p className="text-ghostWhite/80 font-oracle text-sm md:text-base leading-relaxed">
              ปัญญาประดิษฐ์ของเราวิเคราะห์เสาสี่เกิด (ปี เดือน วัน ชั่วโมง) ธาตุทั้งห้า
              และนพเคราะห์ในดวงชะตาไทย รวมถึงวงจรชีวิต 10 ปี (大運) และดวงประจำปี
            </p>
          </div>
          <div className="rounded-lg border border-darkPurple/30 p-5 md:p-6 bg-deepNight/40">
            <h3 className="text-xl font-heading text-amethyst mb-3 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-royalPurple/20 flex items-center justify-center text-sm">3</span>
              รับคำทำนายเฉพาะบุคคล
            </h3>
            <p className="text-ghostWhite/80 font-oracle text-sm md:text-base leading-relaxed">
              ได้รับคำทำนายที่ปรับแต่งเฉพาะคุณ ครอบคลุมทุกด้านของชีวิต: บุคลิกภาพ ความรัก การเงิน
              อาชีพ สุขภาพ และคำแนะนำเพื่อพัฒนาตนเอง
            </p>
          </div>
        </div>
      </section>

      {/* Features / Services */}
      <section className="max-w-3xl mx-auto px-6 py-8 md:py-12">
        <h2 className="text-2xl md:text-3xl font-heading text-ghostWhite mb-6">
          บริการดูดวงครบวงจร
        </h2>
        <div className="space-y-5">
          <div className="rounded-lg border border-darkPurple/30 p-5 md:p-6 bg-deepNight/40">
            <h3 className="text-lg md:text-xl font-heading text-amethyst mb-2">
              💕 ดูดวงความรัก - วิเคราะห์ชะตารัก
            </h3>
            <p className="text-ghostWhite/80 font-oracle text-sm md:text-base leading-relaxed">
              ตรวจสอบดวงความรักและความสัมพันธ์ วิเคราะห์ความเข้ากันได้กับคู่ครอง (ดูดวงคู่)
              ดูจังหวะเวลาที่ดีสำหรับความรัก และคำแนะนำในการรักษาความสัมพันธ์ให้ยั่งยืน
              ด้วยหลักโหราศาสตร์ไทยและ Bazi ที่วิเคราะห์ธาตุและนพเคราะห์ในดวงความรัก
            </p>
          </div>
          <div className="rounded-lg border border-darkPurple/30 p-5 md:p-6 bg-deepNight/40">
            <h3 className="text-lg md:text-xl font-heading text-amethyst mb-2">
              💼 ดูดวงการงาน - เส้นทางอาชีพ
            </h3>
            <p className="text-ghostWhite/80 font-oracle text-sm md:text-base leading-relaxed">
              ค้นหาอาชีพที่เหมาะสมกับชะตาของคุณ วิเคราะห์จุดแข็ง จุดอ่อน และโอกาสในการทำงาน
              ดูช่วงเวลาที่เหมาะสำหรับการเปลี่ยนงาน เริ่มธุรกิจ หรือขอเลื่อนตำแหน่ง
              พร้อมคำแนะนำการพัฒนาทักษะตามธาตุในชาติ
            </p>
          </div>
          <div className="rounded-lg border border-darkPurple/30 p-5 md:p-6 bg-deepNight/40">
            <h3 className="text-lg md:text-xl font-heading text-amethyst mb-2">
              💰 ดูดวงการเงิน - โชคลาภทรัพย์สิน
            </h3>
            <p className="text-ghostWhite/80 font-oracle text-sm md:text-base leading-relaxed">
              วิเคราะห์ดวงการเงินและโชคลาภ ดูโอกาสรับทรัพย์ ช่วงเวลาที่เหมาะสำหรับการลงทุน
              และคำเตือนเรื่องการเงินที่ควรระวัง ตามหลัก Bazi และดวงชะตาไทยที่มองธาตุเงินทอง
              พร้อมคำแนะนำในการเสริมดวงการเงิน
            </p>
          </div>
          <div className="rounded-lg border border-darkPurple/30 p-5 md:p-6 bg-deepNight/40">
            <h3 className="text-lg md:text-xl font-heading text-amethyst mb-2">
              📅 ดูดวงประจำปี - วิเคราะห์ดวงรายปี
            </h3>
            <p className="text-ghostWhite/80 font-oracle text-sm md:text-base leading-relaxed">
              รับคำทำนายดวงประจำปีที่ครอบคลุมทุกด้าน วิเคราะห์โชคชะตาในแต่ละเดือน
              ดูจังหวะเวลาที่ดีและช่วงที่ควรระวัง พร้อมคำแนะนำการเสริมดวงด้วยสี เลขมงคล
              และวิธีการต่างๆ ตามหลัก Bazi และโหราศาสตร์ไทย
            </p>
          </div>
          <div className="rounded-lg border border-darkPurple/30 p-5 md:p-6 bg-deepNight/40">
            <h3 className="text-lg md:text-xl font-heading text-amethyst mb-2">
              ⚖️ ดูดวงธาตุ - สมดุลห้าธาตุ
            </h3>
            <p className="text-ghostWhite/80 font-oracle text-sm md:text-base leading-relaxed">
              ตรวจสอบความสมดุลของธาตุทั้งห้า (ไม้ ไฟ ดิน โลหะ น้ำ) ในชาติของคุณ
              ดูธาตุที่ขาดหรือเกิน และรับคำแนะนำการปรับสมดุลธาตุด้วยสี อัญมณี ทิศทาง
              และกิจกรรมต่างๆ เพื่อเสริมดวงและปรับปรุงคุณภาพชีวิต ตามหลัก Bazi
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 py-8 md:py-12">
        <h2 className="text-2xl md:text-3xl font-heading text-ghostWhite mb-6">
          คำถามที่พบบ่อย (FAQ)
        </h2>
        <div className="space-y-3">
          {[
            {
              q: "สายมู คืออะไร?",
              a: "สายมู เป็นแพลตฟอร์มดูดวงออนไลน์ที่ใช้ปัญญาประดิษฐ์ (AI) วิเคราะห์ชะตาชีวิตด้วยโหราศาสตร์ไทยและ Bazi (ซื่อจู๋) เพื่อให้คำทำนายที่แม่นยำและเฉพาะบุคคล"
            },
            {
              q: "Bazi (ซื่อจู๋) คืออะไร?",
              a: "Bazi หรือ ซื่อจู๋ (四柱命理) คือศาสตร์โหราจีนโบราณที่วิเคราะห์ชะตาจากเสาสี่เกิด (ปี เดือน วัน ชั่วโมง) และธาตุทั้งห้า (ไม้ ไฟ ดิน โลหะ น้ำ) เพื่อทำนายบุคลิก โชคลาภ และเส้นทางชีวิต"
            },
            {
              q: "ดูดวงฟรีได้จริงหรือไม่?",
              a: "ใช่ สายมู ให้บริการดูดวงออนไลน์ฟรี 100% คุณสามารถรับคำทำนายเบื้องต้นและดูดวงประจำวันได้โดยไม่เสียค่าใช้จ่าย"
            },
            {
              q: "ต้องใช้ข้อมูลอะไรบ้างในการดูดวง?",
              a: "ต้องใช้วันเดือนปีเกิด (วันที่เกิดตามปฏิทินสากล) และเวลาเกิด (ถ้ารู้จะแม่นยำกว่า) ระบบจะคำนวณ Bazi และดวงชะตาไทยให้โดยอัตโนมัติ"
            },
            {
              q: "AI ดูดวงแม่นจริงหรือ?",
              a: "AI ของเราได้รับการฝึกฝนด้วยหลักการโหราศาสตร์ไทยและ Bazi แบบดั้งเดิม ผสมผสานกับการวิเคราะห์ข้อมูลจำนวนมาก ให้คำทำนายที่สอดคล้องกับหลักโหราศาสตร์และปรับแต่งให้เข้ากับบริบทสมัยใหม่"
            },
            {
              q: "ข้อมูลส่วนตัวปลอดภัยไหม?",
              a: "เราใช้มาตรฐานความปลอดภัยระดับสูง เข้ารหัสข้อมูลทั้งหมด และไม่แชร์ข้อมูลส่วนตัวกับบุคคลที่สาม คุณสามารถลบข้อมูลได้ตลอดเวลา"
            }
          ].map((faq, index) => (
            <details
              key={index}
              className="group rounded-lg border border-darkPurple/30 bg-deepNight/40 overflow-hidden"
            >
              <summary className="cursor-pointer p-4 md:p-5 font-heading text-ghostWhite hover:text-amethyst transition-colors list-none flex items-center justify-between">
                <span className="text-base md:text-lg">{faq.q}</span>
                <svg
                  className="w-5 h-5 text-amethyst transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-4 md:px-5 pb-4 md:pb-5 text-ghostWhite/80 font-oracle text-sm md:text-base leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Long-tail SEO Content */}
      <section className="max-w-3xl mx-auto px-6 py-8 md:py-12">
        <h2 className="text-2xl md:text-3xl font-heading text-ghostWhite mb-6">
          ทำไมต้องดูดวงด้วย AI?
        </h2>
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-ghostWhite/80 font-oracle text-sm md:text-base leading-relaxed mb-4">
            การดูดวงด้วยปัญญาประดิษฐ์ (AI) นำเสนอมุมมองใหม่ในการทำนายชะตาชีวิต
            ด้วยการผสมผสานระหว่างภูมิปัญญาโบราณกับเทคโนโลยีสมัยใหม่
            AI สามารถวิเคราะห์ข้อมูลจำนวนมหาศาลและหารูปแบบที่ซับซ้อนได้อย่างรวดเร็ว
            ทำให้สามารถให้คำทำนายที่ละเอียด ครอบคลุม และปรับแต่งเฉพาะบุคคลได้ดีกว่าการดูดวงแบบทั่วไป
          </p>
          <h3 className="text-xl md:text-2xl font-heading text-amethyst mb-3 mt-6">
            ความแตกต่างระหว่างโหราศาสตร์ไทยกับ Bazi
          </h3>
          <p className="text-ghostWhite/80 font-oracle text-sm md:text-base leading-relaxed mb-4">
            <strong>โหราศาสตร์ไทย</strong> เน้นการวิเคราะห์จากวันเกิด นพเคราะห์ และจักรนพคุณ
            มักใช้ในการดูความสัมพันธ์ โชคลาภ และจังหวะเวลา มีความเชื่อมโยงกับวัฒนธรรมและความเชื่อไทย
            เหมาะสำหรับการดูดวงรายวัน เลือกฤกษ์ยาม และตรวจสอบความเข้ากันได้
          </p>
          <p className="text-ghostWhite/80 font-oracle text-sm md:text-base leading-relaxed mb-4">
            <strong>Bazi (ซื่อจู๋)</strong> หรือ เสาสี่เกิด วิเคราะห์จากปี เดือน วัน และชั่วโมงเกิด
            โดยแปลงเป็นธาตุและดาวทั้ง 60 องค์ ให้มุมมองที่ลึกซึ้งเกี่ยวกับบุคลิกภาพ พรสวรรค์ จุดแข็ง จุดอ่อน
            และวงจรชีวิต 10 ปี (大運) เหมาะสำหรับการวางแผนชีวิตระยะยาว การเลือกอาชีพ
            และการพัฒนาตนเอง
          </p>
          <h3 className="text-xl md:text-2xl font-heading text-amethyst mb-3 mt-6">
            ห้าธาตุใน Bazi มีความหมายอย่างไร?
          </h3>
          <ul className="space-y-3 text-ghostWhite/80 font-oracle text-sm md:text-base leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-amethyst flex-shrink-0">🌳</span>
              <span><strong>ธาตุไม้ (Wood):</strong> แทนการเติบโต ความคิดสร้างสรรค์ และความยืดหยุ่น คนที่มีธาตุไม้เด่นมักมีความคิดริเริ่ม มีจิตใจเมตตา</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amethyst flex-shrink-0">🔥</span>
              <span><strong>ธาตุไฟ (Fire):</strong> แทนพลังงาน ความกระตือรือร้น และความหลงใหล คนที่มีธาตุไฟเด่นมักมีบุคลิกโดดเด่น กล้าแสดงออก</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amethyst flex-shrink-0">⛰️</span>
              <span><strong>ธาตุดิน (Earth):</strong> แทนความมั่นคง ความน่าเชื่อถือ และการบำรุงเลี้ยง คนที่มีธาตุดินเด่นมักเป็นคนอดทน รักความสงบ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amethyst flex-shrink-0">⚙️</span>
              <span><strong>ธาตุโลหะ (Metal):</strong> แทนความมีระเบียบ ความยุติธรรม และความแข็งแกร่ง คนที่มีธาตุโลหะเด่นมักมีหลักการ ชอบความเป็นระเบียบ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amethyst flex-shrink-0">💧</span>
              <span><strong>ธาตุน้ำ (Water):</strong> แทนปัญญา ความลึกลับ และการปรับตัว คนที่มีธาตุน้ำเด่นมักมีสติปัญญาดี ชอบค้นคว้าหาความรู้</span>
            </li>
          </ul>
          <p className="text-ghostWhite/80 font-oracle text-sm md:text-base leading-relaxed mt-4">
            ความสมดุลของธาตุทั้งห้านี้ส่งผลต่อบุคลิกภาพ โชคชะตา และเส้นทางชีวิตของคุณ
            การเสริมธาตุที่ขาดหรือปรับธาตุที่เกินจะช่วยให้ชีวิตมีความสมดุลมากขึ้น
          </p>
        </div>
      </section>

      {/* Glossary */}
      <section className="max-w-3xl mx-auto px-6 py-8 md:py-12 mb-12">
        <h2 className="text-2xl md:text-3xl font-heading text-ghostWhite mb-6">
          อภิธานศัพท์โหราศาสตร์
        </h2>
        <div className="grid gap-4">
          {[
            { term: "Bazi (ซื่อจู๋)", def: "ศาสตร์โหราจีนที่วิเคราะห์จากเสาสี่เกิด (ปี เดือน วัน ชั่วโมง)" },
            { term: "เสาสี่เกิด", def: "สี่เสาหลักในดวงชะตา Bazi ประกอบด้วย เสาปี เสาเดือน เสาวัน และเสาชั่วโมง" },
            { term: "ห้าธาตุ", def: "ไม้ ไฟ ดิน โลหะ น้ำ - องค์ประกอบพื้นฐานใน Bazi ที่สื่อถึงพลังงานและบุคลิก" },
            { term: "นพเคราะห์", def: "เทพเจ้าทั้งเก้าในโหราศาสตร์ไทย ได้แก่ อาทิตย์ จันทร์ อังคาร พุธ พฤหัส ศุกร์ เสาร์ ราหู เกตุ" },
            { term: "จักรนพคุณ", def: "วงจรโชคชะตาในโหราศาสตร์ไทย หมุนเวียนทุก 9 ปี" },
            { term: "วงจร 10 ปี (大運)", def: "วงจรชะตาชีวิตใน Bazi ที่เปลี่ยนทุก 10 ปี บ่งบอกช่วงเวลาโชคดีและโชคร้าย" },
            { term: "ดวงชะตา", def: "แผนภูมิโหราศาสตร์ที่แสดงตำแหน่งดาวและธาตุ ณ เวลาเกิด" },
            { term: "ดูดวงคู่", def: "การวิเคราะห์ความเข้ากันได้ระหว่างสองคนด้วยการเปรียบเทียบดวงชะตา" }
          ].map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-darkPurple/30 p-4 md:p-5 bg-deepNight/40"
            >
              <h3 className="text-base md:text-lg font-heading text-amethyst mb-2">
                {item.term}
              </h3>
              <p className="text-ghostWhite/80 font-oracle text-sm md:text-base leading-relaxed">
                {item.def}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
