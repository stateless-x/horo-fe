import { describe, expect, test } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Regression guard for the donation UI after the auto-opening modal was
 * removed on purpose (monetization T1, 2026-09-27).
 *
 * This file used to guard the opposite: the auto modal had been silently
 * dropped from the result pages twice by unrelated refactors that rewrote an
 * import block (2389d49, f2eee65), and an unmounted export is invisible to
 * both `tsc --noEmit` and eslint. The same blind spot works in reverse, so
 * these assertions still read source text directly:
 *   - no page may bring the auto-opening modal back;
 *   - the footer's voluntary "สนับสนุน" button and the modal it opens must
 *     survive an unrelated footer rewrite;
 *   - the modal itself must not open anything on open or close.
 *
 * The retired export's name is assembled below rather than written out, so a
 * search of src for that name comes back empty, including this file.
 */
const RETIRED_AUTO_MODAL = ['Auto', 'DonationModal'].join('');

const repoRoot = join(import.meta.dir, '..', '..', '..');
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8');

function sourceFilesUnder(dir: string): string[] {
  return readdirSync(join(repoRoot, dir), { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && /\.(ts|tsx)$/.test(entry.name))
    .map((entry) => relative(repoRoot, join(entry.parentPath, entry.name)));
}

describe('donation UI: voluntary only', () => {
  test('no page under src/app mounts the auto-opening donation modal', () => {
    const pages = sourceFilesUnder('src/app');
    expect(pages).toContain('src/app/dashboard/today/page.tsx');
    expect(pages.filter((file) => read(file).includes(RETIRED_AUTO_MODAL))).toEqual([]);
  });

  test('the auto-opening export no longer exists', () => {
    expect(read('src/components/ads/donation-modal.tsx')).not.toContain(RETIRED_AUTO_MODAL);
  });

  test('the donation modal opens no tab on open or close', () => {
    expect(read('src/components/ads/donation-modal.tsx')).not.toContain('shopee-affiliate');
  });

  test('the footer still renders the donation button and the modal it opens', () => {
    const footer = read('src/components/layout/footer.tsx');
    expect(footer).toContain("import { DonationButton } from \"@/components/ads/donation-button\"");
    expect(footer).toContain("import { DonationModal } from \"@/components/ads/donation-modal\"");
    expect(footer).toMatch(/<DonationButton[\s\S]*?onClick=\{\(\) => setShowDonationModal\(true\)\}/);
    expect(footer).toMatch(/<DonationModal\s+isOpen=\{showDonationModal\}/);
  });
});
