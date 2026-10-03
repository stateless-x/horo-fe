'use client';

import { motion } from 'framer-motion';
import { Share2, Lock } from 'lucide-react';
import { Button, OracleText } from '@/lib-packages/ui';
import { ElementClayImage, type ClayElement } from '@/components/ui/element-clay-image';
import { CategoryClayImage } from '@/components/ui/category-clay-image';
import { FORTUNE_CATEGORY_CONFIG, DAILY_CATEGORY_KEYS, type FortuneCategoryKey } from '@/lib/fortune-category-config';
import type { TeaserResult, TeaserScores, TeaserTraitChip } from '@/lib/teaser-result';

export const ELEMENT_NAMES_THAI: Record<ClayElement, string> = {
  wood: 'ธาตุไม้',
  fire: 'ธาตุไฟ',
  earth: 'ธาตุดิน',
  metal: 'ธาตุทอง',
  water: 'ธาตุน้ำ',
};

export function isClayElement(value: string | undefined): value is ClayElement {
  return value !== undefined && value in ELEMENT_NAMES_THAI;
}

/** The backend always sets focusArea to one of the four daily categories
 * (see horo-be's DailyCategory / selectFocusArea) — this narrows the wider
 * FortuneCategoryKey type down so `scores[focusArea]` type-checks. */
function isDailyCategory(key: FortuneCategoryKey): key is keyof TeaserScores & FortuneCategoryKey {
  return (DAILY_CATEGORY_KEYS as readonly FortuneCategoryKey[]).includes(key);
}

function clampScore(score: number): number {
  return Math.round(Math.min(Math.max(score, 0), 100));
}

/** Short UI band word for a score, mirroring horo-be's focusBandTh thresholds
 * (≥75 / ≥60 / ≥45 / else) with labels sized for this compact row rather than
 * the backend's longer prose. */
function bandWordTh(score: number): string {
  if (score >= 75) return 'ดีมาก';
  if (score >= 60) return 'ดี';
  if (score >= 45) return 'กลางๆ';
  return 'ต้องใส่ใจ';
}

/** One quiet identity line built from trait chip labels only — never the
 * trait phrases themselves, which stay locked until signup. Omits a part
 * when its chip is missing. */
function identityLineFromChips(elementLabel: string | null, chips: TeaserTraitChip[]): string {
  const parts: string[] = [];
  if (elementLabel) parts.push(elementLabel);
  const thai = chips.find((chip) => chip.system === 'thai');
  if (thai) parts.push(thai.label);
  const mbti = chips.find((chip) => chip.system === 'mbti');
  if (mbti) parts.push(mbti.label);
  return parts.join(' · ');
}

interface TeaserResultCardProps {
  result: TeaserResult | null;
  onBack: () => void;
  onShare: () => void;
  onPrimaryCta: () => void;
  onCompatCta: () => void;
}

/**
 * The onboarding teaser result as the visitor sees it: element hero, identity
 * line, threeWay headline, oracle reading, today's focus score with the rest
 * locked, and the two CTAs. Presentational only: StepTeaser owns loading,
 * retries, tracking and the share sheet, and the dev generator tool renders
 * this same card from a dev response.
 */
export function TeaserResultCard({ result, onBack, onShare, onPrimaryCta, onCompatCta }: TeaserResultCardProps) {
  const elementLabel = result && isClayElement(result.elementType) ? ELEMENT_NAMES_THAI[result.elementType] : null;
  const identityLine = result ? identityLineFromChips(elementLabel, result.traitChips) : '';
  const focusConfig = result ? FORTUNE_CATEGORY_CONFIG[result.focusArea] : null;
  const focusScore = result && isDailyCategory(result.focusArea) ? clampScore(result.scores[result.focusArea]) : 0;
  const isFocusLove = result?.focusArea === 'love';
  const lockedCategories = result ? DAILY_CATEGORY_KEYS.filter((key) => key !== result.focusArea) : [];

  return (
    <div className="w-full max-w-md">
      {/* Top bar: back only — the share affordance lives inline on the identity line below,
          out of the way of onboarding-flow's fixed top-right audio toggle */}
      <div className="mb-2 flex items-center">
        <Button variant="ghost" size="sm" onClick={onBack}>
          กลับ
        </Button>
      </div>

      <div className="flex flex-col items-center gap-5 pt-2 text-center sm:gap-6">
        {/* Hero: the user's element, with a soft glow behind it */}
        {elementLabel && isClayElement(result?.elementType) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="relative flex items-center justify-center"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 m-auto size-28 rounded-full blur-2xl sm:size-32"
              style={{ backgroundColor: `color-mix(in srgb, var(--el-${result?.elementType}) 35%, transparent)` }}
            />
            <ElementClayImage
              element={result!.elementType as ClayElement}
              alt=""
              sizes="128px"
              className="size-28 sm:size-32"
              priority
            />
          </motion.div>
        )}

        {/* Identity line: labels only, never the trait phrases — share sits inline at
            its end so the button never collides with the fixed audio toggle */}
        {identityLine && (
          <div className="flex items-center gap-0.5">
            <p className="text-sm text-inkMuted">{identityLine}</p>
            <Button
              variant="ghost"
              size="sm"
              className="size-11 shrink-0 p-0"
              onClick={onShare}
              aria-label="แชร์ตัวตนของฉัน"
            >
              <Share2 className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        )}

        {/* Headline: the one trait all systems agree on */}
        <h1 className="text-balance font-heading text-2xl font-semibold leading-snug text-ink sm:text-3xl">
          {result?.threeWay}
        </h1>

        {/* Oracle reading */}
        <OracleText
          text={result?.reading || ''}
          speed={Math.max(4, Math.round(1200 / Math.max(1, (result?.reading || '').length)))}
          className="max-w-[34ch] text-[15px] leading-relaxed sm:text-base"
        />

        {/* One focus-area score, plus the rest locked */}
        {result && focusConfig && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full space-y-3"
          >
            <div className="flex w-full items-center gap-3 rounded-2xl bg-surface px-4 py-3">
              <CategoryClayImage category={result.focusArea} className="size-10 shrink-0" />
              <span className="flex-1 text-left text-sm text-ink">{focusConfig.label}วันนี้</span>
              <span
                className={`text-sm font-heading tabular-nums ${
                  isFocusLove ? 'text-pink-600 dark:text-pink-400' : 'text-accentBright'
                }`}
              >
                {bandWordTh(focusScore)} {focusScore}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {lockedCategories.map((key) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs text-inkMuted"
                >
                  <Lock className="size-3" aria-hidden="true" />
                  {FORTUNE_CATEGORY_CONFIG[key].label}
                </span>
              ))}
            </div>
            <p className="text-xs text-inkMuted">สมัครเพื่อเปิดดูอีก 3 ด้าน</p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full space-y-3 pt-1"
        >
          <Button onClick={onPrimaryCta} size="lg" className="w-full">
            อ่านดวงเต็มของฉัน
          </Button>
          <Button
            variant="ghost"
            onClick={onCompatCta}
            className="w-full text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
          >
            หรือเช็คดวงกับคนคุย
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
