'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

const categories = [
  { label: 'ภาพรวมชีวิต', desc: 'ทิศทางและเส้นทางชะตา', image: 'life-overview' },
  { label: 'ความรัก & เนื้อคู่', desc: 'ดวงรักและความสัมพันธ์', image: 'love' },
  { label: 'การงาน & อาชีพ', desc: 'เส้นทางอาชีพและโอกาส', image: 'career' },
  { label: 'การเงิน & โชคลาภ', desc: 'โชคทรัพย์และการลงทุน', image: 'finance' },
  { label: 'สุขภาพ & พลังงาน', desc: 'สมดุลกายและจิต', image: 'health' },
  { label: 'ครอบครัว & ความสัมพันธ์', desc: 'สายสัมพันธ์คนรอบข้าง', image: 'family' },
] as const;

export function ReadingCategories() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-heading text-ink mb-4">
            ครอบคลุมทุกมิติชีวิต
          </h2>
          <p className="text-inkMuted font-oracle">
            รับคำทำนายเฉพาะบุคคลใน 6 ด้าน
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: shouldReduceMotion ? 0 : 0.08 },
            },
          }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.label}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
              className="group relative h-full"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-15 bg-accentBright/30 -z-10 transition-opacity duration-300" />

              <div className="glass-card glass-card-lift flex flex-col items-center text-center p-4 md:p-5 h-full md:hover:border-accentBright/30">
                <Image
                  src={`/assets/clay/categories/${cat.image}.webp`}
                  alt={`โมเดลดินปั้น ${cat.label}`}
                  width={480}
                  height={480}
                  sizes="(min-width: 768px) 72px, 56px"
                  className="mb-3 size-14 object-contain drop-shadow-[0_8px_14px_rgba(107,33,168,0.12)] md:size-[72px]"
                />
                <p className="font-heading text-ink text-sm md:text-base mb-1">
                  {cat.label}
                </p>
                <p className="text-inkMuted text-xs font-oracle">
                  {cat.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
