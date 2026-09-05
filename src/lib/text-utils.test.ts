import { describe, expect, test } from 'bun:test';
import { firstClauseOrTruncate } from './text-utils';

describe('firstClauseOrTruncate', () => {
  test('prefers an ASCII/Thai sentence terminator when one exists within the cap', () => {
    expect(firstClauseOrTruncate('เจ้าเป็นคนใจดี. เจ้ายังมีความคิดสร้างสรรค์ด้วย', 60)).toBe(
      'เจ้าเป็นคนใจดี.',
    );
  });

  test('derives a clause-boundary preview from real space-separated Thai prose with no periods', () => {
    // A real pillarInterpretations[].interpretation value from a generated
    // chart: Thai LLM prose separates clauses with spaces, not periods, so
    // a naive `.`-split would return the entire multi-sentence string.
    const interpretation =
      'เสาปีของเจ้าคือ ปีกุน ธาตุน้ำ ซึ่งเป็นรากฐานของครอบครัวและสังคมรอบตัวเจ้า ' +
      'ตั้งแต่เด็กเจ้าอาจเติบโตมาในสภาพแวดล้อมที่มีการเปลี่ยนแปลงตลอดเวลา ' +
      'ทำให้เจ้าเรียนรู้ที่จะปรับตัวได้ไว';

    const result = firstClauseOrTruncate(interpretation, 60);

    expect(result.length).toBeLessThanOrEqual(61); // allow the trailing ellipsis
    // Cuts on a clause boundary (a full word/space), never mid-word.
    expect(interpretation.startsWith(result.replace(/…$/, '').trimEnd())).toBe(true);
  });

  test('caps unbroken no-space Thai at the grapheme limit with an ellipsis', () => {
    const noSpaces = 'เจ้าเป็นคนที่มีความสามารถหลากหลายและมีความคิดสร้างสรรค์อยู่เสมอไม่ว่าจะเจอเรื่องอะไรก็ตาม';
    const result = firstClauseOrTruncate(noSpaces, 20);

    expect(result.endsWith('…')).toBe(true);
    expect(Array.from(new Intl.Segmenter('th', { granularity: 'grapheme' }).segment(result)).length).toBe(21);
  });

  test('keeps a short passage whole', () => {
    expect(firstClauseOrTruncate('เจ้าเป็นคนใจดี', 60)).toBe('เจ้าเป็นคนใจดี');
  });

  test('returns an empty string for empty input', () => {
    expect(firstClauseOrTruncate('   ', 60)).toBe('');
  });
});
