import { describe, expect, test } from 'bun:test';
import { getDailyHookLine, HOOK_LINE_MAX_CHARS, type StructuredDailyContent } from './daily-content';

const base: StructuredDailyContent = {
  overallReading: '',
  categories: {
    career: { reading: '', score: 3, tip: '' },
    love: { reading: '', score: 3, tip: '' },
    finance: { reading: '', score: 3, tip: '' },
    health: { reading: '', score: 3, tip: '' },
  },
  dos: [],
  donts: [],
  luckyMoment: '',
};

describe('getDailyHookLine', () => {
  test('returns null for missing content', () => {
    expect(getDailyHookLine(null)).toBeNull();
    expect(getDailyHookLine(undefined)).toBeNull();
    expect(getDailyHookLine({ ...base, overallReading: '   ' })).toBeNull();
  });

  test('prefers the v2 hookLine verbatim', () => {
    const structured = { ...base, hookLine: ' วันนี้ดวงเด่นเรื่องการงาน ', overallReading: 'อย่างอื่น' };
    expect(getDailyHookLine(structured)).toBe('วันนี้ดวงเด่นเรื่องการงาน');
  });

  test('derives a clause-boundary hook from legacy spaced Thai prose', () => {
    const structured = {
      ...base,
      overallReading:
        'วันนี้พลังธาตุไฟของเจ้าครอบงำธาตุทองของวัน ทำให้เป็นวันที่เหมาะแก่การตัดสินใจและการแข่งขัน ดวงเสาร์ส่งเสริมความมีวินัย',
    };
    const hook = getDailyHookLine(structured);
    expect(hook).not.toBeNull();
    expect(hook!.length).toBeGreaterThanOrEqual(40);
    expect(hook!.length).toBeLessThanOrEqual(HOOK_LINE_MAX_CHARS);
    expect(hook!.startsWith('วันนี้พลังธาตุไฟ')).toBe(true);
  });

  test('caps unbroken no-space Thai at the max length with an ellipsis', () => {
    const structured = { ...base, overallReading: 'ดวง'.repeat(200) };
    const hook = getDailyHookLine(structured);
    expect(hook).not.toBeNull();
    expect(hook!.length).toBeLessThanOrEqual(HOOK_LINE_MAX_CHARS);
    expect(hook!.endsWith('…')).toBe(true);
  });

  test('keeps a short legacy reading whole', () => {
    const structured = { ...base, overallReading: 'วันนี้ดวงดี' };
    expect(getDailyHookLine(structured)).toBe('วันนี้ดวงดี');
  });
});
