'use client';

import { useEffect, useRef, useState } from 'react';
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

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function PillarDetailModal({
  isOpen,
  onClose,
  pillar,
  pillarKey,
  interpretation,
}: PillarDetailModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);
  const [showFullDetail, setShowFullDetail] = useState(false);

  // Focus the close button on open, and return focus to whatever opened the
  // modal (the pillar card) on close. Captured on the isOpen transition, not
  // after the exit animation, so focus never lands nowhere for 300ms. The
  // close button is display:none below md (a separate full-width close
  // button handles mobile instead), so fall back to the panel itself, which
  // carries tabIndex={-1} for exactly this case.
  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement;
      const target = closeButtonRef.current?.offsetParent !== null
        ? closeButtonRef.current
        : panelRef.current;
      target?.focus();
    } else if (previouslyFocused.current instanceof HTMLElement) {
      previouslyFocused.current.focus();
    }
  }, [isOpen]);

  // Reset the disclosure each time a different pillar opens.
  useEffect(() => {
    if (isOpen) setShowFullDetail(false);
  }, [isOpen, pillarKey]);

  // Escape closes; Tab cycles within the panel so it reads as a real trap,
  // which is what aria-modal="true" asserts to assistive tech.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
            role="dialog"
            aria-modal="true"
            aria-labelledby="pillar-modal-title"
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-0 md:right-0 md:left-auto md:w-[400px] md:h-full z-50 overflow-hidden"
          >
            <div
              ref={panelRef}
              tabIndex={-1}
              className="bg-surface2/95 backdrop-blur-xl border-t md:border-t-0 md:border-l border-surface2/50 rounded-t-3xl md:rounded-none h-[70vh] md:h-full overflow-y-auto focus:outline-none"
            >
              {/* Drag handle (mobile only) */}
              <div className="md:hidden flex justify-center py-2">
                <div className="w-10 h-1 bg-inkMuted/50 rounded-full" />
              </div>

              {/* Header */}
              <div className="sticky top-0 bg-surface2/95 backdrop-blur-xl border-b border-surface2/50 p-6 flex items-center justify-between">
                <div>
                  <h3 id="pillar-modal-title" className="font-heading text-xl font-medium text-accentBright mb-1">
                    {PILLAR_LABELS[pillarKey]}
                  </h3>
                  <p className="font-oracle text-base text-accentSoft">
                    {pillar.stemChinese}
                    {pillar.branchChinese}
                  </p>
                </div>
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className="text-inkMuted hover:text-ink transition-colors md:block hidden"
                  aria-label="ปิด"
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

                {/* Summary: the one-line takeaway, shown first */}
                {interpretation.summary && (
                  <p className="text-ink font-oracle text-base leading-relaxed">
                    {interpretation.summary}
                  </p>
                )}

                {/* Tips: short, concrete actions */}
                {interpretation.tips && interpretation.tips.length > 0 && (
                  <div>
                    <h4 className="text-accentSoft font-heading font-medium text-sm mb-2">
                      สิ่งที่ควรทำ
                    </h4>
                    <ul className="space-y-1.5">
                      {interpretation.tips.map((tip, i) => (
                        <li key={i} className="text-ink font-thai text-sm leading-relaxed flex gap-2">
                          <span className="text-accentBright" aria-hidden="true">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warning: a restrained callout, a heads-up rather than an alert */}
                {interpretation.warning && (
                  <div className="rounded-xl border border-edge bg-accentBright/5 p-4">
                    <p className="text-ink font-thai text-sm leading-relaxed">
                      {interpretation.warning}
                    </p>
                  </div>
                )}

                {/* Heavenly Stem */}
                <div>
                  <h4 className="text-accentSoft font-heading font-medium text-sm mb-2">
                    天干 Heavenly Stem
                    <InfoTooltip text="เทียนกาน (天干) หรือ Heavenly Stem มี 10 ตัว แทนพลังงานจากสวรรค์ บอกถึงลักษณะภายนอก บุคลิก และการแสดงออก" />
                  </h4>
                  <p className="text-ink font-oracle text-base">
                    {pillar.stemChinese} ({pillar.stemPinyin}), ธาตุ
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
                    {pillar.branchChinese} ({pillar.branchPinyin}) ,{' '}
                    {pillar.branchAnimal}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-surface2/50" />

                {/* Full interpretation and pillarRelationships, behind a disclosure */}
                {showFullDetail ? (
                  <>
                    <div>
                      <h4 className="text-accentSoft font-heading font-medium text-base mb-3">
                        ความหมาย
                      </h4>
                      <p className="text-ink font-oracle font-light text-base leading-relaxed">
                        {interpretation.interpretation}
                      </p>
                    </div>

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
                  </>
                ) : (
                  <button
                    onClick={() => setShowFullDetail(true)}
                    className="font-heading text-sm text-accentBright hover:text-accentSoft transition-colors"
                  >
                    อ่านเพิ่ม
                  </button>
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
