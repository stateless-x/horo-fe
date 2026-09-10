import type { Metadata } from 'next';
import Link from 'next/link';
import { Megaphone, Wrench, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ร่วมงานกับเรา · ลงโฆษณากับสายมู',
  description:
    'สนใจลงโฆษณาบนสายมู หรืออยากจ้างทำเว็บไซต์และวางระบบ ติดต่อได้ที่ askpurin@pm.me ดูผลงานที่ผ่านมาได้ที่ pooh.fyi',
  alternates: {
    canonical: '/contact',
  },
};

const EMAIL = 'askpurin@pm.me';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-ground">
      <header className="border-b border-edge">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <Link
            href="/"
            className="text-sm text-inkMuted hover:text-ink font-oracle transition-colors"
          >
            &larr; กลับหน้าหลัก
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* The entity sentence: one extractable paragraph that answers
            "สายมูคืออะไร และติดต่อใคร" for both readers and LLMs. */}
        <h1 className="font-heading text-3xl font-semibold text-ink">
          ร่วมงานกับเรา
        </h1>
        <p className="font-thai text-base text-inkMuted mt-4 leading-relaxed">
          สายมูเป็นเว็บดูดวงออนไลน์ภาษาไทย ดูแลโดย Purin (@Pooh.fyi)
          ถ้าคุณสนใจลงโฆษณากับเรา หรืออยากให้ช่วยทำเว็บไซต์และวางระบบให้
          ส่งอีเมลมาคุยกันได้เลยที่{' '}
          <a
            href={`mailto:${EMAIL}`}
            className="text-accentBright hover:text-accentSoft underline underline-offset-2 transition-colors"
          >
            {EMAIL}
          </a>
        </p>

        <div className="mt-10 space-y-4">
          <section className="bg-surface border border-surface2/50 rounded-2xl p-6">
            <h2 className="font-heading text-lg font-semibold text-ink flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-accentBright" aria-hidden="true" />
              สนใจติดต่อโฆษณา
            </h2>
            <p className="font-thai text-sm text-inkMuted mt-3 leading-relaxed">
              สายมูมีคนไทยเข้ามาเปิดดวงทุกวัน
              ถ้าแบรนด์ของคุณอยากเจอคนกลุ่มนี้ เรารับลงแบนเนอร์และทำคอนเทนต์ร่วมกัน
              บอกมาคร่าว ๆ ว่าอยากได้อะไร งบประมาณเท่าไหร่ แล้วเราจะส่งรายละเอียดกลับไป
            </p>
          </section>

          <section className="bg-surface border border-surface2/50 rounded-2xl p-6">
            <h2 className="font-heading text-lg font-semibold text-ink flex items-center gap-2">
              <Wrench className="w-5 h-5 text-accentBright" aria-hidden="true" />
              จ้างทำเว็บและวางระบบ
            </h2>
            <p className="font-thai text-sm text-inkMuted mt-3 leading-relaxed">
              นอกจากสายมู เรารับทำเว็บไซต์ วางระบบหลังบ้าน และงานพัฒนาซอฟต์แวร์ทั่วไป
              เว็บที่คุณกำลังอ่านอยู่นี้ก็ทำเองทั้งหมด ตั้งแต่หน้าบ้านยันฐานข้อมูล
              ดูผลงานที่ผ่านมาได้ที่{' '}
              <a
                href="https://pooh.fyi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accentBright hover:text-accentSoft underline underline-offset-2 transition-colors"
              >
                pooh.fyi
              </a>
            </p>
          </section>
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 font-heading text-sm font-medium rounded-xl bg-gradient-to-r from-accent to-accentBright text-accentInk shadow-md shadow-accent/20 hover:shadow-lg transition-all duration-200"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            ส่งอีเมลหาเรา
          </a>
        </div>
      </main>
    </div>
  );
}
