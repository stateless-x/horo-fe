import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Regression guard for the auto-opening donation modal.
 *
 * `AutoDonationModal` has been silently dropped from these pages twice by
 * unrelated UI refactors that rewrote the import block (2389d49, f2eee65) —
 * an unmounted export is invisible to both `tsc --noEmit` and eslint, so
 * nothing else catches it. These assertions read the page source directly:
 * a rewrite that loses the import or the JSX tag fails here.
 *
 * If a mount is removed ON PURPOSE, delete its entry from PAGES in the same
 * commit so the intent is recorded rather than the test silenced.
 */
const PAGES = [
  'src/app/dashboard/fortune/page.tsx',
  'src/app/dashboard/today/page.tsx',
  'src/app/dashboard/compatibility/page.tsx',
] as const;

const repoRoot = join(import.meta.dir, '..', '..', '..');
const read = (page: string) => readFileSync(join(repoRoot, page), 'utf8');

describe('AutoDonationModal stays mounted on result surfaces', () => {
  for (const page of PAGES) {
    test(`${page} imports AutoDonationModal`, () => {
      expect(read(page)).toContain(
        "import { AutoDonationModal } from '@/components/ads/donation-modal'",
      );
    });

    test(`${page} renders AutoDonationModal`, () => {
      expect(read(page)).toMatch(/<AutoDonationModal(?:\s+[^>]*)?\s*\/>/);
    });
  }

  test('only today and fortune opt into the close-triggered Shopee offer', () => {
    expect(read('src/app/dashboard/today/page.tsx')).toContain(
      '<AutoDonationModal affiliateSurface="today" />',
    );
    expect(read('src/app/dashboard/fortune/page.tsx')).toContain(
      '<AutoDonationModal affiliateSurface="fortune" />',
    );
    expect(read('src/app/dashboard/compatibility/page.tsx')).toContain('<AutoDonationModal />');
  });

  test('the fortune compatibility CTA opens a separately tracked Shopee offer', () => {
    const readNext = read('src/features/fortune/chart/read-next.tsx');
    expect(readNext).toContain("item.ctaId === 'fortune_compatibility'");
    expect(readNext).toContain("'fortune_compatibility_cta'");
  });

  test('the component the pages import still exists and is exported', () => {
    const modal = read('src/components/ads/donation-modal.tsx');
    expect(modal).toMatch(/export function AutoDonationModal\(/);
  });
});
