import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

/**
 * Guards the share instrument.
 *
 * Share tracking was a `console.log` stub for long enough that production
 * recorded 0 `reading_shared` events across three surfaces while the buttons
 * looked like they worked. Nothing failed — the data was simply never written,
 * which is invisible until someone asks "where do people share?" and finds an
 * empty table.
 *
 * These are source-level assertions on purpose: the failure mode is a call site
 * quietly losing its tracking, and that is a property of the file, not of any
 * rendered output.
 */

const SHEET = 'src/components/share/share-sheet.tsx';

/** Every surface that mounts a ShareSheet must name itself for the event. */
const CALL_SITES: Array<{ file: string; surface: string }> = [
  { file: 'src/app/dashboard/today/page.tsx', surface: 'today' },
  { file: 'src/app/dashboard/fortune/page.tsx', surface: 'fortune' },
  { file: 'src/features/compatibility/compatibility-result.tsx', surface: 'compatibility' },
];

const read = (path: string) => readFileSync(path, 'utf8');

describe('share tracking is real, not a stub', () => {
  const sheet = read(SHEET);

  test('the share sheet reports through the analytics hook', () => {
    expect(sheet).toContain("import { useTrackEvent } from '@/lib/analytics'");
    expect(sheet).toContain('const track = useTrackEvent()');
  });

  test('the console.log stub is gone for good', () => {
    expect(sheet).not.toContain('trackShareEvent');
    expect(read('src/lib/share-utils.ts')).not.toContain('trackShareEvent');
  });

  test('every platform branch records a reading_shared event', () => {
    // copy, LINE-on-mobile deep link, and the shared window.open branch.
    const calls = sheet.match(/track\(\{ event: 'reading_shared'/g) ?? [];
    expect(calls.length).toBe(3);
  });

  test('each event carries the surface, so the admin can group by it', () => {
    for (const call of sheet.match(/track\(\{ event: 'reading_shared'[^}]*\}\)/g) ?? []) {
      expect(call).toContain('surface');
      expect(call).toContain('platform');
    }
  });
});

describe('every ShareSheet call site declares its surface', () => {
  for (const { file, surface } of CALL_SITES) {
    test(`${file} passes surface="${surface}"`, () => {
      const source = read(file);
      expect(source).toContain('<ShareSheet');
      expect(source).toContain(`surface="${surface}"`);
    });
  }
});
