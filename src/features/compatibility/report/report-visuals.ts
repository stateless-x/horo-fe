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
  overview: {
    dimensions: string;
    story: string;
    attraction: string;
  };
  people: {
    partner: string;
    reader: string;
  };
  conversation: {
    open: string;
    tension: string;
  };
  practices: {
    space: string;
    voice: string;
    focus: string;
  };
  next: {
    future: { art?: string; tone: ActionTone };
    calendar: { art: string };
    plan: { art?: string };
  };
}

/** Cues that describe a reading or a gentle practice, not a relationship role. */
const shared = {
  overview: {
    dimensions: '/assets/clay/compatibility-sections/four-dimensions.webp',
    story: '/assets/clay/categories/life-overview.webp',
  },
  people: {
    partner: '/assets/clay/relationships/listening.webp',
    reader: '/assets/clay/compatibility-sections/two-mirrors.webp',
  },
  conversation: {
    open: '/assets/clay/relationships/talking.webp',
    tension: '/assets/clay/relationships/reconnect.webp',
  },
  practices: {
    space: '/assets/clay/relationships/comfortable-space.webp',
    voice: '/assets/clay/relationships/next-check-in.webp',
    focus: '/assets/clay/relationships/next-gentle-step.webp',
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
  overview: { ...shared.overview, attraction: '/assets/clay/categories/love.webp' },
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
  overview: { ...shared.overview, attraction: '/assets/clay/relationships/friend.webp' },
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
  overview: { ...shared.overview, attraction: '/assets/clay/relationships/coworker.webp' },
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
  overview: { ...shared.overview, attraction: '/assets/clay/categories/family.webp' },
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
