'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ELEMENT_COLORS } from '@/lib-packages/shared/constants/design';
import { ElementClayImage } from '@/components/ui/element-clay-image';

const elements = [
  { key: 'wood', name: 'ธาตุไม้', trait: 'เติบโต', colors: ELEMENT_COLORS.wood },
  { key: 'fire', name: 'ธาตุไฟ', trait: 'หลงใหล', colors: ELEMENT_COLORS.fire },
  { key: 'earth', name: 'ธาตุดิน', trait: 'มั่นคง', colors: ELEMENT_COLORS.earth },
  { key: 'metal', name: 'ธาตุทอง', trait: 'ระเบียบ', colors: ELEMENT_COLORS.metal },
  { key: 'water', name: 'ธาตุน้ำ', trait: 'ปัญญา', colors: ELEMENT_COLORS.water },
] as const;

export function ElementShowcase() {
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
            ธาตุทั้งห้าเผยชะตา
          </h2>
          <p className="text-inkMuted font-oracle">
            แค่วันเกิดของคุณ ก็บอกธาตุประจำตัวได้
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1 },
            },
          }}
          className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-4 scrollbar-hide md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:pb-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {elements.map((el, i) => (
            <ElementOrb key={el.key} element={el} index={i} shouldReduceMotion={shouldReduceMotion} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ElementOrb({
  element,
  index,
  shouldReduceMotion,
}: {
  element: (typeof elements)[number];
  index: number;
  shouldReduceMotion: boolean | null;
}) {
  const floatDuration = 2.5 + index * 0.25;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5 }}
      className="h-full w-28 flex-shrink-0 snap-center md:w-auto"
    >
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : { y: [-3, 3, -3] }
        }
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
        className="glass-card relative overflow-hidden text-center cursor-default flex flex-col h-full"
        style={{ boxShadow: `0 8px 24px ${element.colors.glow}` }}
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl bg-surface2/40 p-2">
          <div
            className="absolute inset-1/4 rounded-full blur-2xl opacity-25"
            style={{ backgroundColor: element.colors.primary }}
            aria-hidden="true"
          />
          <ElementClayImage
            element={element.key}
            alt={`โมเดลดินปั้น ${element.name}`}
            sizes="(min-width: 768px) 176px, 112px"
            className="relative h-full w-full drop-shadow-[0_12px_20px_rgba(107,33,168,0.12)]"
          />
        </div>

        <div className="flex flex-col items-center px-4 py-4">
          <p
            className="font-heading text-sm mb-1"
            style={{ color: `var(--el-${element.key}, ${element.colors.primary})` }}
          >
            {element.name}
          </p>
          <p className="text-inkMuted text-xs font-oracle">
            {element.trait}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
