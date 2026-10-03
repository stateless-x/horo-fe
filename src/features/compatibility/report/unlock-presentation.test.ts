import { describe, expect, test } from 'bun:test';
import { RELATIONSHIP_TYPES } from '@/lib-packages/shared/types/compatibility';
import { unlockPresentation } from './unlock-presentation';

describe('unlockPresentation', () => {
  test('keeps every relationship-specific promise useful and routes each payment state', () => {
    for (const type of RELATIONSHIP_TYPES) {
      const balance = unlockPresentation(type, 'conversation', 'balance');
      expect(balance.headline.length).toBeGreaterThan(12);
      expect(balance.outcomes).toHaveLength(3);
      expect(balance.ctaKind).toBe('spend');
      expect(balance.artSection).toBe('conversation');
      expect(unlockPresentation(type, 'next', 'short').ctaKind).toBe('topUp');
      expect(unlockPresentation(type, 'people', 'generating')).toMatchObject({ ctaKind: 'waiting', status: 'กำลังเตรียมคำตอบให้คุณ' });
    }
  });

  test('does not default work, friendship, or family readers to romantic language', () => {
    for (const type of ['friend', 'boss', 'coworker', 'family'] as const) {
      const presentation = unlockPresentation(type, undefined, 'balance');
      expect(`${presentation.headline} ${presentation.support} ${presentation.outcomes.join(' ')}`).not.toContain('ความรัก');
      expect(`${presentation.headline} ${presentation.support} ${presentation.outcomes.join(' ')}`).not.toContain('ดูใจ');
    }
  });
});
