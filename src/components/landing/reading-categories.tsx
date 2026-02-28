'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Orbit, Heart, Briefcase, Coins, Activity, Home } from 'lucide-react';

const iconMap = { Orbit, Heart, Briefcase, Coins, Activity, Home } as const;

const categories = [
  { icon: 'Orbit' as const, label: 'ภาพรวมชีวิต', desc: 'ทิศทางและเส้นทางชะตา' },
  { icon: 'Heart' as const, label: 'ความรัก & เนื้อคู่', desc: 'ดวงรักและความสัมพันธ์' },
  { icon: 'Briefcase' as const, label: 'การงาน & อาชีพ', desc: 'เส้นทางอาชีพและโอกาส' },
  { icon: 'Coins' as const, label: 'การเงิน & โชคลาภ', desc: 'โชคทรัพย์และการลงทุน' },
  { icon: 'Activity' as const, label: 'สุขภาพ & พลังงาน', desc: 'สมดุลกายและจิต' },
  { icon: 'Home' as const, label: 'ครอบครัว & ความสัมพันธ์', desc: 'สายสัมพันธ์คนรอบข้าง' },
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
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon];
            return (
              <motion.div
                key={cat.label}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5 }}
                className="group relative"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-15 bg-amethyst/30 -z-10 transition-opacity duration-300" />

                <div
                  className="rounded-xl p-4 md:p-5 text-center border border-white/10 transition-all duration-300 h-full md:hover:border-amethyst/30"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 10, 26, 0.6), rgba(10, 10, 15, 0.8))',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-lavenderGlow mx-auto mb-3" />
                  <p className="font-heading text-ghostWhite text-sm md:text-base mb-1">
                    {cat.label}
                  </p>
                  <p className="text-ashGray text-xs font-oracle">
                    {cat.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
