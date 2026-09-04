'use client';

import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import type { EnrichedPillar, PillarInterpretation } from '@/lib-packages/shared/types/astrology';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface PillarDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pillar: EnrichedPillar | null;
  pillarKey: string | null;
  interpretation: PillarInterpretation | null;
}

const PILLAR_LABELS: Record<string, string> = {
  year: 'เสาปี',
  month: 'เสาเดือน',
  day: 'เสาวัน',
  hour: 'เสาชั่วโมง',
};

export function PillarDetailModal({
  isOpen,
  onClose,
  pillar,
  pillarKey,
  interpretation,
}: PillarDetailModalProps) {
  if (!pillar || !pillarKey || !interpretation) return null;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Close on drag down past threshold (mobile)
    if (info.offset.y > 100) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-ground/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal - Bottom sheet on mobile, Side panel on desktop */}
          <motion.div
            initial={{ opacity: 0, y: '100%', x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: '100%', x: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-0 md:right-0 md:left-auto md:w-[400px] md:h-full z-50 overflow-hidden"
          >
            <div className="bg-surface2/95 backdrop-blur-xl border-t md:border-t-0 md:border-l border-surface2/50 rounded-t-3xl md:rounded-none h-[70vh] md:h-full overflow-y-auto">
              {/* Drag handle (mobile only) */}
              <div className="md:hidden flex justify-center py-2">
                <div className="w-10 h-1 bg-inkMuted/50 rounded-full" />
              </div>

              {/* Header */}
              <div className="sticky top-0 bg-surface2/95 backdrop-blur-xl border-b border-surface2/50 p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-xl font-medium text-accentBright mb-1">
                    {PILLAR_LABELS[pillarKey]}
                  </h3>
                  <p className="font-oracle text-base text-accentSoft">
                    {pillar.stemChinese}
                    {pillar.branchChinese}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-inkMuted hover:text-ink transition-colors md:block hidden"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Life area */}
                <div>
                  <p className="font-thai text-base text-ink">
                    {pillar.lifeArea}
                  </p>
                </div>

                {/* Heavenly Stem */}
                <div>
                  <h4 className="text-accentSoft font-heading font-medium text-sm mb-2">
                    天干 Heavenly Stem
                    <InfoTooltip text="เทียนกาน (天干) หรือ Heavenly Stem มี 10 ตัว แทนพลังงานจากสวรรค์ บอกถึงลักษณะภายนอก บุคลิก และการแสดงออก" />
                  </h4>
                  <p className="text-ink font-oracle text-base">
                    {pillar.stemChinese} ({pillar.stemPinyin}) — ธาตุ
                    {pillar.stemElement}{' '}
                    {pillar.stemYinYang === 'yang' ? 'Yang' : 'Yin'}
                  </p>
                </div>

                {/* Earthly Branch */}
                <div>
                  <h4 className="text-accentSoft font-heading font-medium text-sm mb-2">
                    地支 Earthly Branch
                    <InfoTooltip text="ตี้จือ (地支) หรือ Earthly Branch มี 12 ตัว (นักษัตร) แทนพลังงานจากโลก บอกถึงลักษณะภายใน อารมณ์ และพฤติกรรมที่ซ่อนอยู่" />
                  </h4>
                  <p className="text-ink font-oracle text-base">
                    {pillar.branchChinese} ({pillar.branchPinyin}) —{' '}
                    {pillar.branchAnimal}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-surface2/50" />

                {/* Interpretation */}
                <div>
                  <h4 className="text-accentSoft font-heading font-medium text-base mb-3">
                    ความหมาย
                  </h4>
                  <p className="text-ink font-oracle font-light text-base leading-relaxed">
                    {interpretation.interpretation}
                  </p>
                </div>

                {/* Pillar relationships */}
                {interpretation.pillarRelationships && (
                  <div>
                    <h4 className="text-accentSoft font-heading font-medium text-base mb-3">
                      ความสัมพันธ์กับเสาอื่น
                    </h4>
                    <p className="text-ink font-oracle font-light text-base leading-relaxed">
                      {interpretation.pillarRelationships}
                    </p>
                  </div>
                )}

                {/* Close button (mobile) */}
                <button
                  onClick={onClose}
                  className="w-full md:hidden bg-transparent border border-accentBright/30 text-accentBright rounded-xl py-3 transition-colors duration-200 hover:bg-accentBright/10"
                >
                  ปิด
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
