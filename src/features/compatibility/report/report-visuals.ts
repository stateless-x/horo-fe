import type { RelationshipType } from '@/lib-packages/shared';
import type { ReportSectionId } from './report-copy';

type ActionTone = 'accent' | 'romance';

/**
 * Clay cues are a small semantic layer, deliberately separate from report copy.
 * A report can change its words without accidentally inheriting couple-coded art
 * in a family or work context. The three next-move cards receive distinct cues
 * so equal choices have equal visual weight without reusing the section hero.
 */
export interface RelationshipReportVisuals {
  sections: Record<ReportSectionId, string>;
  conversation: {
    open: string;
    tension: string;
  };
  next: {
    future: { art?: string; tone: ActionTone };
    calendar: { art: string };
    plan: { art?: string };
  };
}

const shared: Pick<RelationshipReportVisuals, 'conversation'> = {
  conversation: {
    open: '/assets/clay/relationships/talking.webp',
    tension: '/assets/clay/relationships/reconnect.webp',
  },
};

const romantic: RelationshipReportVisuals = {
  ...shared,
  sections: {
    overview: '/assets/clay/chart-scroll-oracle.webp',
    people: '/assets/clay/compatibility-sections/two-mirrors.webp',
    conversation: '/assets/clay/relationships/listening.webp',
    next: '/assets/clay/categories/life-overview.webp',
  },
  next: {
    future: { art: '/assets/clay/relationships/next-signal.webp', tone: 'romance' },
    calendar: { art: '/assets/clay/relationships/next-timing.webp' },
    plan: { art: '/assets/clay/relationships/next-step.webp' },
  },
};

const friend: RelationshipReportVisuals = {
  ...shared,
  sections: {
    overview: '/assets/clay/chart-scroll-oracle.webp',
    people: '/assets/clay/relationships/friend.webp',
    conversation: '/assets/clay/relationships/listening.webp',
    next: '/assets/clay/relationships/friend.webp',
  },
  conversation: {
    open: '/assets/clay/relationships/talking.webp',
    tension: '/assets/clay/relationships/friend.webp',
  },
  next: {
    future: { art: '/assets/clay/relationships/next-check-in.webp', tone: 'accent' },
    calendar: { art: '/assets/clay/relationships/next-timing.webp' },
    plan: { art: '/assets/clay/relationships/next-gentle-step.webp' },
  },
};

const work: RelationshipReportVisuals = {
  ...shared,
  sections: {
    overview: '/assets/clay/categories/career.webp',
    people: '/assets/clay/relationships/coworker.webp',
    conversation: '/assets/clay/relationships/listening.webp',
    next: '/assets/clay/categories/career.webp',
  },
  conversation: {
    open: '/assets/clay/relationships/coworker.webp',
    tension: '/assets/clay/relationships/talking.webp',
  },
  next: {
    future: { art: '/assets/clay/relationships/next-check-in.webp', tone: 'accent' },
    calendar: { art: '/assets/clay/relationships/next-timing.webp' },
    plan: { art: '/assets/clay/relationships/next-gentle-step.webp' },
  },
};

const family: RelationshipReportVisuals = {
  ...shared,
  sections: {
    overview: '/assets/clay/chart-scroll-oracle.webp',
    people: '/assets/clay/categories/family.webp',
    conversation: '/assets/clay/relationships/listening.webp',
    next: '/assets/clay/categories/family.webp',
  },
  conversation: {
    open: '/assets/clay/categories/family.webp',
    tension: '/assets/clay/relationships/talking.webp',
  },
  next: {
    future: { art: '/assets/clay/relationships/next-check-in.webp', tone: 'accent' },
    calendar: { art: '/assets/clay/relationships/next-timing.webp' },
    plan: { art: '/assets/clay/relationships/next-gentle-step.webp' },
  },
};

const VISUALS: Record<RelationshipType, RelationshipReportVisuals> = {
  romantic,
  talking: romantic,
  friend,
  boss: work,
  coworker: work,
  family,
};

export function relationshipReportVisuals(type?: RelationshipType): RelationshipReportVisuals {
  return VISUALS[type ?? 'romantic'];
}
