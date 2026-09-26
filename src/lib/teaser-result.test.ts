import { describe, expect, test } from 'bun:test';
import { completedTeaser, type TeaserResult } from './teaser-result';

const validV2: TeaserResult = {
  contentVersion: 2,
  elementType: 'wood',
  luckyColor: 'เขียว',
  luckyNumber: 5,
  threeWay: 'ทั้งสามศาสตร์เห็นตรงกันว่าคุณเป็นคนที่ใส่ใจรายละเอียด',
  reading: 'วันนี้เหมาะกับการตัดสินใจเรื่องการเงิน อย่าลืมฟังสัญชาตญาณตัวเอง',
  focusArea: 'finance',
  traitChips: [
    { system: 'thai', label: 'ธาตุไม้', trait: 'ใจดี' },
    { system: 'bazi', label: 'ปาจื้อ', trait: 'มั่นคง' },
  ],
  scores: { date: '2026-09-27', love: 60, career: 70, finance: 80, health: 65 },
};

describe('completedTeaser', () => {
  test('accepts a complete v2 result', () => {
    expect(completedTeaser(validV2)).toEqual(validV2);
  });

  test('rejects a legacy (pre-v2) cached shape instead of rendering it', () => {
    const legacy = {
      elementType: 'wood',
      personality: 'บุคลิกของคุณ...',
      todaySnippet: 'วันนี้ดวงดี...',
      luckyColor: 'เขียว',
      luckyNumber: 5,
    };
    expect(completedTeaser(legacy)).toBeNull();
  });

  test('rejects a value with contentVersion missing or not exactly 2', () => {
    expect(completedTeaser({ ...validV2, contentVersion: undefined })).toBeNull();
    expect(completedTeaser({ ...validV2, contentVersion: 1 })).toBeNull();
  });

  test('rejects a v2-tagged value missing required v2 fields', () => {
    const withoutThreeWay: Partial<TeaserResult> = { ...validV2 };
    delete withoutThreeWay.threeWay;
    expect(completedTeaser(withoutThreeWay)).toBeNull();

    const withoutChips: Partial<TeaserResult> = { ...validV2 };
    delete withoutChips.traitChips;
    expect(completedTeaser(withoutChips)).toBeNull();
    expect(completedTeaser({ ...validV2, traitChips: [] })).toBeNull();

    const withoutScores: Partial<TeaserResult> = { ...validV2 };
    delete withoutScores.scores;
    expect(completedTeaser(withoutScores)).toBeNull();
  });

  test('rejects non-object and empty values', () => {
    expect(completedTeaser(null)).toBeNull();
    expect(completedTeaser(undefined)).toBeNull();
    expect(completedTeaser({})).toBeNull();
    expect(completedTeaser('not an object')).toBeNull();
  });
});
