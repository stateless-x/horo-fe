'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Check, X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import type { Recommendations } from "@/lib-packages/shared/types/astrology";

interface RecommendationsSectionProps {
  recommendations: Recommendations;
}

export function RecommendationsSection({
  recommendations,
}: RecommendationsSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-select and center current month on mount
  useEffect(() => {
    if (recommendations.monthlyHighlights.length > 0) {
      const currentMonthIndex = new Date().getMonth(); // 0-11
      const highlightIndex = recommendations.monthlyHighlights.findIndex(
        (h) => {
          // Try to match Thai month name to current month
          const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
          return h.month.includes(monthNames[currentMonthIndex]);
        }
      );

      if (highlightIndex !== -1) {
        setSelectedMonth(highlightIndex);
        // Center the selected month pill
        setTimeout(() => {
          const container = scrollContainerRef.current;
          if (container) {
            const pill = container.children[highlightIndex] as HTMLElement;
            if (pill) {
              const scrollLeft = pill.offsetLeft - (container.clientWidth / 2) + (pill.clientWidth / 2);
              container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
          }
        }, 100);
      } else {
        setSelectedMonth(0);
      }
    }
  }, [recommendations.monthlyHighlights]);
  const renderDotRating = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className={`w-2 h-2 rounded-full ${
              dot <= rating ? "bg-amethyst" : "bg-darkPurple/50"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-6">
        <Sparkles className="text-lavenderGlow w-6 h-6" />
        <h2 className="font-heading text-xl font-medium text-ghostWhite">
          คำแนะนำ & ฤกษ์มงคล
        </h2>
      </div>

      {/* Lucky attributes grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-charcoal border border-darkPurple/50 rounded-lg p-4">
          <p className="text-lavenderGlow font-thai text-sm mb-2">
            สีมงคลปีนี้
          </p>
          <p className="text-ghostWhite font-heading font-medium text-base">
            {recommendations.luckyColors.join(", ")}
          </p>
        </div>

        <div className="bg-charcoal border border-darkPurple/50 rounded-lg p-4">
          <p className="text-lavenderGlow font-thai text-sm mb-2">เลขมงคล</p>
          <p className="text-ghostWhite font-heading font-medium text-base">
            {recommendations.luckyNumbers.join(", ")}
          </p>
        </div>

        <div className="bg-charcoal border border-darkPurple/50 rounded-lg p-4">
          <p className="text-lavenderGlow font-thai text-sm mb-2">ทิศมงคล</p>
          <p className="text-ghostWhite font-heading font-medium text-base">
            {recommendations.luckyDirection}
          </p>
        </div>

        <div className="bg-charcoal border border-darkPurple/50 rounded-lg p-4">
          <p className="text-lavenderGlow font-thai text-sm mb-2">วันมงคล</p>
          <p className="text-ghostWhite font-heading font-medium text-base">
            {recommendations.luckyDay}
          </p>
        </div>
      </div>

      {/* Monthly highlights - Swipeable Timeline */}
      {recommendations.monthlyHighlights.length > 0 && (
        <div className="bg-deepNight border border-darkPurple/50 rounded-xl p-6 mb-6">
          <h3 className="text-lavenderGlow font-heading font-medium text-base mb-4">
            เดือนเด่นของเจ้า
          </h3>

          {/* Month pills - horizontal scroll */}
          <div
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {recommendations.monthlyHighlights.map((highlight, index) => {
              const isHighRating = highlight.rating >= 4;
              const isSelected = selectedMonth === index;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedMonth(index)}
                  className={`
                    flex-shrink-0 px-4 py-2 rounded-full font-heading text-sm snap-center
                    transition-all duration-200
                    ${
                      isSelected
                        ? 'bg-amethyst text-voidBlack font-medium'
                        : isHighRating
                        ? 'bg-amethyst/20 border border-amethyst/50 text-amethyst hover:bg-amethyst/30'
                        : 'bg-charcoal border border-darkPurple/50 text-ghostWhite hover:border-royalPurple/50'
                    }
                    ${isHighRating && !isSelected ? 'shadow-[0_0_12px_rgba(161,106,203,0.3)]' : ''}
                  `}
                >
                  {highlight.month}
                </button>
              );
            })}
          </div>

          {/* Detail card for selected month */}
          <AnimatePresence mode="wait">
            {selectedMonth !== null && (
              <motion.div
                key={selectedMonth}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-charcoal border border-darkPurple/50 rounded-lg p-5 space-y-4"
              >
                {/* Header with month and rating */}
                <div className="flex items-center justify-between">
                  <h4 className="text-ghostWhite font-heading font-medium text-lg">
                    {recommendations.monthlyHighlights[selectedMonth].month}
                  </h4>
                  {renderDotRating(recommendations.monthlyHighlights[selectedMonth].rating)}
                </div>

                {/* Summary note */}
                <p className="text-amethyst font-thai text-base font-medium">
                  {recommendations.monthlyHighlights[selectedMonth].note}
                </p>

                {/* Detailed description */}
                <p className="text-ashGray font-thai text-base leading-relaxed">
                  {recommendations.monthlyHighlights[selectedMonth].description}
                </p>

                {/* Highlights badges */}
                {recommendations.monthlyHighlights[selectedMonth].highlights &&
                 recommendations.monthlyHighlights[selectedMonth].highlights!.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recommendations.monthlyHighlights[selectedMonth].highlights!.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-amethyst/10 border border-amethyst/30 rounded-full text-lavenderGlow font-thai text-sm"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}

                {/* Advice */}
                {recommendations.monthlyHighlights[selectedMonth].advice && (
                  <div className="bg-royalPurple/10 border border-royalPurple/30 rounded-lg p-3">
                    <p className="text-lavenderGlow font-thai text-sm font-medium mb-1">
                      คำแนะนำ:
                    </p>
                    <p className="text-ghostWhite font-thai text-sm leading-relaxed">
                      {recommendations.monthlyHighlights[selectedMonth].advice}
                    </p>
                  </div>
                )}

                {/* Warning */}
                {recommendations.monthlyHighlights[selectedMonth].warning && (
                  <div className="bg-red-900/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 font-thai text-sm font-medium mb-1">
                      ข้อควรระวัง:
                    </p>
                    <p className="text-red-200 font-thai text-sm leading-relaxed">
                      {recommendations.monthlyHighlights[selectedMonth].warning}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      )}

      {/* Do's and Don'ts */}
      <div className="bg-deepNight border border-darkPurple/50 rounded-xl p-6">
        <h3 className="text-lavenderGlow font-heading font-medium text-base mb-4">
          สิ่งที่ควรทำ & หลีกเลี่ยงปีนี้
        </h3>

        <div className="space-y-4">
          {/* Do's */}
          {recommendations.dos.length > 0 && (
            <div>
              <ul className="space-y-2">
                {recommendations.dos.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="text-emerald-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-ghostWhite font-thai text-base">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Don'ts */}
          {recommendations.donts.length > 0 && (
            <div className="pt-4 border-t border-darkPurple/50">
              <ul className="space-y-2">
                {recommendations.donts.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="text-red-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-ghostWhite font-thai text-base">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
