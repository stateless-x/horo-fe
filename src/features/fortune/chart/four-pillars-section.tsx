"use client";

import { useState } from "react";
import { Users, Briefcase, Heart, Sparkles, ChevronRight } from "lucide-react";
import type {
  EnrichedPillar,
  PillarInterpretation,
  PillarInteraction,
} from "@/lib-packages/shared/types/astrology";
import { ELEMENT_COLORS } from "@/lib-packages/shared/constants/design";
import { PillarDetailModal } from "./pillar-detail-modal";
import { InfoTooltip } from "@/components/ui/info-tooltip";

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
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  const openPillarModal = (pillarKey: string) => {
    setSelectedPillar(pillarKey);
  };

  const renderPillar = (
    pillarKey: "year" | "month" | "day" | "hour",
    pillar: EnrichedPillar,
  ) => {
    const Icon = PILLAR_ICONS[pillarKey];
    const isDay = pillarKey === "day";
    const elementColor = ELEMENT_COLORS[pillar.stemElement];

    return (
      <div
        key={pillarKey}
        className={isDay ? "md:col-span-1 order-1 md:order-none" : ""}
      >
        {/* Pillar card */}
        <button
          onClick={() => openPillarModal(pillarKey)}
          aria-haspopup="dialog"
          className={`
            w-full bg-surface rounded-xl p-5 transition-all duration-200 cursor-pointer
            hover:bg-surface2/20 hover:border-accent/50 active:scale-[0.98] motion-reduce:active:scale-100
            ${
              isDay
                ? "border-accentBright/50 bg-surface2/20 shadow-lg shadow-accentBright/10 transform md:-translate-y-2"
                : "border-surface2/50"
            }
            border
          `}
          style={{
            minHeight: isDay ? "200px" : "180px",
          }}
        >
          <div className="flex h-full flex-col items-center text-center">
            {/* Icon */}
            <Icon
              className={`w-6 h-6 mb-3 ${isDay ? "text-accentBright" : "text-accentSoft"}`}
            />

            {/* Pillar label */}
            <h3 className="font-heading font-medium text-base text-accentBright mb-2">
              {PILLAR_LABELS[pillarKey]}
            </h3>

            {/* Stem and Branch in pinyin */}
            <p className="font-english text-xs text-inkMuted italic mb-3">
              {pillar.stemPinyin} {pillar.branchPinyin}
            </p>

            {/* Life area */}
            <p className="font-thai text-base text-ink mb-2">
              {pillar.lifeArea}
            </p>

            {/* Element indicator dot */}
            <div
              className="w-2 h-2 rounded-full mt-auto mb-3"
              style={{
                backgroundColor: elementColor.primary,
                boxShadow: `0 0 6px ${elementColor.glow}`,
              }}
            />

            {/* In-card tap affordance: the caption below the grid was easy to
                miss, so the hint now lives on every card it applies to. */}
            <span className="flex items-center gap-0.5 font-heading text-xs text-accentBright">
              ดูรายละเอียด
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </span>
          </div>
        </button>
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
        <h2 className="font-heading text-2xl font-medium text-ink mb-2">
          เสาชะตาทั้งสี่ของเจ้า
          <InfoTooltip text="เสาสี่ต้น (四柱) คือหัวใจของ Bazi คำนวณจากปี เดือน วัน และเวลาเกิด แต่ละเสาบอกถึงด้านต่างๆ ของชีวิต" />
        </h2>
        <p className="font-thai text-inkMuted text-sm">
          แต่ละเสาเผยถึงอิทธิพลที่หล่อหลอมชีวิตของเจ้า
        </p>
      </div>

      {/* Pillars grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pillarArray.map(({ key, pillar }) => renderPillar(key, pillar))}
      </div>

      {/* Pillar Detail Modal */}
      <PillarDetailModal
        isOpen={selectedPillar !== null}
        onClose={() => setSelectedPillar(null)}
        pillar={
          selectedPillar
            ? (pillars[selectedPillar as keyof typeof pillars] ?? null)
            : null
        }
        pillarKey={selectedPillar}
        interpretation={
          pillarInterpretations.find((p) => p.pillarKey === selectedPillar) ||
          null
        }
      />
    </div>
  );
}
