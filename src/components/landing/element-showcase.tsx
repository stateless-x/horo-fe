'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ELEMENT_COLORS } from '@/lib-packages/shared/constants/design';

const elements = [
  { key: 'wood', name: 'ธาตุไม้', trait: 'เติบโต', colors: ELEMENT_COLORS.wood },
  { key: 'fire', name: 'ธาตุไฟ', trait: 'หลงใหล', colors: ELEMENT_COLORS.fire },
  { key: 'earth', name: 'ธาตุดิน', trait: 'มั่นคง', colors: ELEMENT_COLORS.earth },
  { key: 'metal', name: 'ธาตุโลหะ', trait: 'ระเบียบ', colors: ELEMENT_COLORS.metal },
  { key: 'water', name: 'ธาตุน้ำ', trait: 'ปัญญา', colors: ELEMENT_COLORS.water },
];

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
          <h2 className="text-3xl md:text-4xl font-heading text-ghostWhite mb-4">
            ธาตุทั้งห้าเผยชะตา
          </h2>
          <p className="text-ashGray font-oracle">
            กรอกวันเกิดของเจ้า เพื่อค้นหาธาตุประจำตัว
          </p>
        </motion.div>

        {/* Desktop: grid, Mobile: horizontal scroll */}
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
          className="hidden md:grid grid-cols-5 gap-4"
        >
          {elements.map((el, i) => (
            <ElementOrb key={el.key} element={el} index={i} shouldReduceMotion={shouldReduceMotion} />
          ))}
        </motion.div>

        {/* Mobile: horizontal scroll */}
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
          className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 px-2 -mx-2 pb-4 scrollbar-hide"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {elements.map((el, i) => (
            <ElementOrb key={el.key} element={el} index={i} shouldReduceMotion={shouldReduceMotion} mobile />
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
  mobile,
}: {
  element: (typeof elements)[number];
  index: number;
  shouldReduceMotion: boolean | null;
  mobile?: boolean;
}) {
  const floatDuration = 2.5 + index * 0.25;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5 }}
      className={
        mobile
          ? 'snap-center flex-shrink-0 w-28'
          : ''
      }
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
        className="rounded-xl p-5 text-center border border-white/10 transition-shadow duration-300 cursor-default"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 10, 26, 0.8), rgba(10, 10, 15, 0.9))',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Glowing orb */}
        <div
          className="w-12 h-12 rounded-full mx-auto mb-3 transition-shadow duration-300"
          style={{
            backgroundColor: element.colors.primary,
            boxShadow: `0 0 20px ${element.colors.primary}40, 0 0 40px ${element.colors.glow}`,
          }}
        />

        <p
          className="font-heading text-sm mb-1"
          style={{ color: element.colors.primary }}
        >
          {element.name}
        </p>
        <p className="text-ashGray text-xs font-oracle">
          {element.trait}
        </p>
      </motion.div>
    </motion.div>
  );
}
