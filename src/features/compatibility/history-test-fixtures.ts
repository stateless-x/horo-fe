import type { RelationshipType } from '@/lib-packages/shared';
import type { HistoryItem } from '@/features/compatibility/relationship-config';

/** `count` history rows named `${prefix}-1`, `${prefix}-2`, ... */
export function historyItems(prefix: string, count: number, relationshipType: RelationshipType = 'talking'): HistoryItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-id-${index + 1}`,
    partnerName: `${prefix}-${index + 1}`,
    partnerBirthDate: '1996-01-01',
    relationshipType,
    score: 70,
    userElement: 'Fire',
    partnerElement: 'Water',
    createdAt: '2026-09-01T00:00:00.000Z',
  }));
}
