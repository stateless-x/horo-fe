import type { FortuneCategoryKey } from '@/lib-packages/shared';
import {
  Activity,
  Briefcase,
  Coins,
  Heart,
  Home,
  Orbit,
  type LucideIcon,
} from 'lucide-react';

/**
 * Single source of truth for fortune category presentation across the app
 * (daily categories, chart six-area readings, onboarding teaser).
 *
 * Clay assets are the meaning-carrying visual (DESIGN.md Clay Cast Rule);
 * the lucide icon is a functional fallback for tiny or text-only contexts.
 */
export interface FortuneCategoryConfig {
  /** Short label used on compact surfaces (daily cards). */
  label: string;
  /** Full label used on the chart's six-area readings. */
  fullLabel: string;
  /** Clay render, 480×480 transparent WebP. */
  clayAsset: string;
  /** Functional fallback icon (chrome-scale contexts only). */
  icon: LucideIcon;
  /** Stable, theme-safe data color used by score bars across daily and chart readings. */
  chartFillClass: string;
  /** Text treatment paired with the score bar; colors never carry the score alone. */
  chartValueClass: string;
}

export const FORTUNE_CATEGORY_CONFIG = {
  life_overview: {
    label: 'ภาพรวมชีวิต',
    fullLabel: 'ภาพรวมชีวิต',
    clayAsset: '/assets/clay/categories/life-overview.webp',
    icon: Orbit,
    chartFillClass: 'bg-accentBright',
    chartValueClass: 'text-accentBright',
  },
  love: {
    label: 'ความรัก',
    fullLabel: 'ความรัก',
    clayAsset: '/assets/clay/categories/love.webp',
    icon: Heart,
    chartFillClass: 'bg-romance',
    chartValueClass: 'text-romanceText',
  },
  career: {
    label: 'การงาน',
    fullLabel: 'การงาน',
    clayAsset: '/assets/clay/categories/career.webp',
    icon: Briefcase,
    chartFillClass: 'bg-[var(--el-fire)]',
    chartValueClass: 'text-[var(--el-fire)]',
  },
  finance: {
    label: 'การเงิน',
    fullLabel: 'การเงิน',
    clayAsset: '/assets/clay/categories/finance.webp',
    icon: Coins,
    chartFillClass: 'bg-[var(--el-earth)]',
    chartValueClass: 'text-[var(--el-earth)]',
  },
  health: {
    label: 'สุขภาพ',
    fullLabel: 'สุขภาพ',
    clayAsset: '/assets/clay/categories/health.webp',
    icon: Activity,
    chartFillClass: 'bg-success',
    chartValueClass: 'text-success',
  },
  family: {
    label: 'ครอบครัว',
    fullLabel: 'ครอบครัว',
    clayAsset: '/assets/clay/categories/family.webp',
    icon: Home,
    chartFillClass: 'bg-[var(--el-water)]',
    chartValueClass: 'text-[var(--el-water)]',
  },
// Keyed by the shared FortuneCategoryKey rather than `string`, so a key added
// to lib/shared but missing here is a compile error instead of an `undefined`
// lookup at every FORTUNE_CATEGORY_CONFIG[key] call site.
} as const satisfies Record<FortuneCategoryKey, FortuneCategoryConfig>;

// Re-exported so the many components importing it from here keep working; the
// list itself is owned by lib/shared (the backend's analytics vocabulary).
export type { FortuneCategoryKey };

/** The four categories the daily reading covers, in display order. */
export const DAILY_CATEGORY_KEYS = ['career', 'love', 'finance', 'health'] as const satisfies readonly FortuneCategoryKey[];
