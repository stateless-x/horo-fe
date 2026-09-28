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
  test('tags only the highest score with its natural Thai cue, text and icon, not the others', () => {
    const html = renderToStaticMarkup(<DimensionBars dimensions={dims([82, 64, 71, 43])} hideLockNote />);
    expect(html).toContain('เคมีมา');
    // The tag gives the meaning. A tinted, outlined row made the best score
    // look like an alert and competed with the rest of the reading.
    expect(html).not.toContain('bg-romance/[0.06]');
    expect(html).not.toContain('ring-inset');
    // Four fixed meanings use four fixed hues: chemistry, communication,
    // trust and life rhythm remain distinguishable beyond their score values.
    for (const tone of ['bg-romance', 'bg-accentBright', 'bg-success', 'bg-warn']) expect(html).toContain(tone);
    // Only one tag: the highest (เคมี 82), not the three lower scores.
    expect((html.match(/เคมีมา/g) || []).length).toBe(1);
    expect(html).not.toContain('คุยกันติด');
    expect(html).not.toContain('ไว้ใจกันได้');
    expect(html).not.toContain('จังหวะตรงกัน');
    // The tag sits with เคมี's row, not another dimension's.
    const chemistryIndex = html.indexOf('เคมี');
    const tagIndex = html.indexOf('เคมีมา');
    const nextLabelIndex = html.indexOf('การสื่อสาร');
    expect(tagIndex).toBeGreaterThan(chemistryIndex);
    expect(tagIndex).toBeLessThan(nextLabelIndex);
    // The leading dimension earns a visible score reward, not only a colored tag.
    expect(html).toMatch(/text-2xl font-bold leading-none tracking-\[-0\.04em\][^>]*>82</);
  });

  test('a tie tags every top dimension in its own words, not one arbitrarily', () => {
    const html = renderToStaticMarkup(<DimensionBars dimensions={dims([80, 80, 50, 30])} hideLockNote />);
    expect(html).toContain('เคมีมา');
    expect(html).toContain('คุยกันติด');
  });

  test('the natural tag shows on the locked teaser too: it only needs the free score numbers', () => {
    const html = renderToStaticMarkup(<DimensionBars dimensions={dims([50, 78, 58, 51])} />);
    expect(html).toContain('คุยกันติด');
    expect(html).not.toContain('undefined');
  });

  test('every score still renders when nothing is tied for the highest', () => {
    const html = renderToStaticMarkup(<DimensionBars dimensions={dims([10, 20, 30, 40])} hideLockNote />);
    for (const score of [10, 20, 30, 40]) expect(html).toContain(`>${score}<`);
    expect(html).toContain('จังหวะตรงกัน');
  });
});
