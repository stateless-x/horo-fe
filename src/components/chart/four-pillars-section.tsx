"use client";

import { useState, useEffect } from "react";
import { Users, Briefcase, Heart, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  EnrichedPillar,
  PillarInterpretation,
  PillarInteraction,
} from "@/lib-packages/shared/types/astrology";
import { ELEMENT_COLORS } from "@/lib-packages/shared/constants/design";

interface FourPillarsSectionProps {
  pillars: {
    year: EnrichedPillar;
    month: EnrichedPillar;
    day: EnrichedPillar;
    hour?: EnrichedPillar;
  };
  pillarInterpretations: PillarInterpretation[];
  pillarInteractions: PillarInteraction[];
}

const PILLAR_ICONS = {
  year: Users,
  month: Briefcase,
  day: Heart,
  hour: Sparkles,
};

const PILLAR_LABELS: Record<string, string> = {
  year: "เสาปี",
  month: "เสาเดือน",
  day: "เสาวัน",
  hour: "เสาชั่วโมง",
};

export function FourPillarsSection({
  pillars,
  pillarInterpretations,
  pillarInteractions,
}: FourPillarsSectionProps) {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);

  // Hide hint after first interaction
  useEffect(() => {
    if (expandedPillar !== null && showHint) {
      setShowHint(false);
    }
  }, [expandedPillar, showHint]);

  const togglePillar = (pillarKey: string) => {
    setExpandedPillar(expandedPillar === pillarKey ? null : pillarKey);
  };

  const renderPillar = (
    pillarKey: "year" | "month" | "day" | "hour",
    pillar: EnrichedPillar,
  ) => {
    const Icon = PILLAR_ICONS[pillarKey];
    const isDay = pillarKey === "day";
    const isExpanded = expandedPillar === pillarKey;
    const elementColor = ELEMENT_COLORS[pillar.stemElement];

    const interpretation = pillarInterpretations.find(
      (p) => p.pillarKey === pillarKey,
    );

    return (
      <div
        key={pillarKey}
        className={isDay ? "md:col-span-1 order-1 md:order-none" : ""}
      >
        {/* Pillar card */}
        <button
          onClick={() => togglePillar(pillarKey)}
          className={`
            w-full bg-deepNight rounded-xl p-5 transition-all duration-200 cursor-pointer
            hover:bg-darkPurple/20
            ${
              isDay
                ? "border-amethyst/50 bg-darkPurple/20 shadow-lg shadow-amethyst/10 transform md:-translate-y-2"
                : "border-darkPurple/50"
            }
            ${isExpanded ? "border-royalPurple/50 bg-darkPurple/20" : ""}
            border hover:border-royalPurple/50
          `}
          style={{
            minHeight: isDay ? "200px" : "180px",
          }}
        >
          <div className="flex flex-col items-center text-center h-full">
            {/* Icon */}
            <Icon
              className={`w-6 h-6 mb-3 ${isDay ? "text-amethyst" : "text-lavenderGlow"}`}
            />

            {/* Pillar label */}
            <h3 className="font-heading font-medium text-base text-amethyst mb-2">
              {PILLAR_LABELS[pillarKey]}
            </h3>

            {/* Stem and Branch in pinyin */}
            <p className="font-english text-xs text-ashGray italic mb-3">
              {pillar.stemPinyin} {pillar.branchPinyin}
            </p>

            {/* Life area */}
            <p className="font-thai text-sm text-ghostWhite mb-2">
              {pillar.lifeArea}
            </p>

            {/* Element indicator dot */}
            <div
              className="w-2 h-2 rounded-full mt-auto"
              style={{
                backgroundColor: elementColor.primary,
                boxShadow: `0 0 6px ${elementColor.glow}`,
              }}
            />
          </div>
        </button>

        {/* Expanded detail panel */}
        <AnimatePresence>
          {isExpanded && interpretation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mt-4"
            >
              <div className="bg-darkPurple/20 border border-darkPurple/50 rounded-lg p-6">
                <h4 className="font-heading text-lg font-medium text-lavenderGlow mb-4">
                  {PILLAR_LABELS[pillarKey]} — {pillar.stemChinese}
                  {pillar.branchChinese}
                </h4>

                {/* Stem and Branch details */}
                <div className="space-y-2 mb-4 text-sm">
                  <p className="text-ghostWhite font-oracle">
                    <span className="text-lavenderGlow font-heading font-medium">
                      天干 Heavenly Stem:
                    </span>{" "}
                    {pillar.stemChinese} ({pillar.stemPinyin}) — ธาตุ
                    {pillar.stemElement}{" "}
                    {pillar.stemYinYang === "yang" ? "Yang" : "Yin"}
                  </p>
                  <p className="text-ghostWhite font-oracle">
                    <span className="text-lavenderGlow font-heading font-medium">
                      地支 Earthly Branch:
                    </span>{" "}
                    {pillar.branchChinese} ({pillar.branchPinyin}) —{" "}
                    {pillar.branchAnimal}
                  </p>
                </div>

                {/* Interpretation */}
                <div className="mb-4">
                  <h5 className="text-lavenderGlow font-heading font-medium text-sm mb-2">
                    ความหมาย:
                  </h5>
                  <p className="text-ghostWhite font-oracle font-light leading-relaxed text-sm">
                    {interpretation.interpretation}
                  </p>
                </div>

                {/* Pillar relationships */}
                {interpretation.pillarRelationships && (
                  <div>
                    <h5 className="text-lavenderGlow font-heading font-medium text-sm mb-2">
                      ความสัมพันธ์กับเสาอื่น:
                    </h5>
                    <p className="text-ghostWhite font-oracle font-light leading-relaxed text-sm">
                      {interpretation.pillarRelationships}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const pillarArray = [
    { key: "year" as const, pillar: pillars.year },
    { key: "month" as const, pillar: pillars.month },
    { key: "day" as const, pillar: pillars.day },
    ...(pillars.hour ? [{ key: "hour" as const, pillar: pillars.hour }] : []),
  ];

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-heading text-2xl font-medium text-ghostWhite mb-2">
          เสาชะตาทั้งสี่ของเจ้า
        </h2>
        <p className="font-thai text-ashGray text-sm">
          แต่ละเสาเผยถึงอิทธิพลที่หล่อหลอมชีวิตของเจ้า
        </p>
      </div>

      {/* Pillars grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {pillarArray.map(({ key, pillar }) => renderPillar(key, pillar))}
      </div>

      {/* Hint text */}
      <AnimatePresence>
        {showHint && (
          <motion.p
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-ashGray font-thai text-sm"
          >
            แตะที่เสาเพื่อดูรายละเอียด
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
