import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { DimensionBars } from './dimension-bars';
import type { CompatibilityV4Teaser } from '@/lib-packages/shared/types/compatibility';

const dims = (scores: number[]): CompatibilityV4Teaser['dimensions'] => [
  { key: 'chemistry', label: 'เคมี', score: scores[0] },
  { key: 'communication', label: 'การสื่อสาร', score: scores[1] },
  { key: 'trust', label: 'ความไว้ใจ', score: scores[2] },
  { key: 'rhythm', label: 'จังหวะชีวิต', score: scores[3] },
];

describe('DimensionBars', () => {
  test('tags only the highest score with จุดแข็ง, text and icon, not the others', () => {
    const html = renderToStaticMarkup(<DimensionBars dimensions={dims([82, 64, 71, 43])} hideLockNote />);
    expect(html).toContain('จุดแข็ง');
    // The tag gives the meaning. A tinted, outlined row made the best score
    // look like an alert and competed with the rest of the reading.
    expect(html).not.toContain('bg-romance/[0.06]');
    expect(html).not.toContain('ring-inset');
    // Only one tag: the highest (เคมี 82), not the three lower scores.
    expect((html.match(/จุดแข็ง/g) || []).length).toBe(1);
    // The tag sits with เคมี's row, not another dimension's.
    const chemistryIndex = html.indexOf('เคมี');
    const tagIndex = html.indexOf('จุดแข็ง');
    const nextLabelIndex = html.indexOf('การสื่อสาร');
    expect(tagIndex).toBeGreaterThan(chemistryIndex);
    expect(tagIndex).toBeLessThan(nextLabelIndex);
  });

  test('a tie tags every dimension at the max, not one arbitrarily', () => {
    const html = renderToStaticMarkup(<DimensionBars dimensions={dims([80, 80, 50, 30])} hideLockNote />);
    expect((html.match(/จุดแข็ง/g) || []).length).toBe(2);
  });

  test('the tag shows on the locked teaser too: it only needs the free score numbers', () => {
    const html = renderToStaticMarkup(<DimensionBars dimensions={dims([50, 78, 58, 51])} />);
    expect(html).toContain('จุดแข็ง');
    expect(html).not.toContain('undefined');
  });

  test('every score still renders when nothing is tied for the highest', () => {
    const html = renderToStaticMarkup(<DimensionBars dimensions={dims([10, 20, 30, 40])} hideLockNote />);
    for (const score of [10, 20, 30, 40]) expect(html).toContain(`>${score}<`);
    expect((html.match(/จุดแข็ง/g) || []).length).toBe(1);
  });
});
