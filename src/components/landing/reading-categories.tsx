'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MediaPlaceholder } from '@/components/ui/media-placeholder';

const categories = [
  { label: 'ภาพรวมชีวิต', desc: 'ทิศทางและเส้นทางชะตา' },
  { label: 'ความรัก & เนื้อคู่', desc: 'ดวงรักและความสัมพันธ์' },
  { label: 'การงาน & อาชีพ', desc: 'เส้นทางอาชีพและโอกาส' },
  { label: 'การเงิน & โชคลาภ', desc: 'โชคทรัพย์และการลงทุน' },
  { label: 'สุขภาพ & พลังงาน', desc: 'สมดุลกายและจิต' },
  { label: 'ครอบครัว & ความสัมพันธ์', desc: 'สายสัมพันธ์คนรอบข้าง' },
];

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
          <h2 className="text-3xl md:text-4xl font-heading text-ghostWhite mb-4">
            ครอบคลุมทุกมิติชีวิต
          </h2>
          <p className="text-ashGray font-oracle">
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
              <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-15 bg-amethyst/30 -z-10 transition-opacity duration-300" />

              <div className="glass-card glass-card-lift flex flex-col items-center text-center p-4 md:p-5 h-full md:hover:border-amethyst/30">
                <MediaPlaceholder
                  aspect="1/1"
                  spec="240×240 · PNG"
                  label={`ไอคอน 3D clay ${cat.label} — สไตล์ดินปั้นนุ่ม โทนม่วง พื้นหลังโปร่งใส`}
                  iconOnly
                  flush
                  className="w-14 h-14 md:w-[72px] md:h-[72px] rounded-xl border border-white/10 mb-3"
                />
                <p className="font-heading text-ghostWhite text-sm md:text-base mb-1">
                  {cat.label}
                </p>
                <p className="text-ashGray text-xs font-oracle">
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
