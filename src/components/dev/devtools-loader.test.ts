import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The devtools call DeepSeek through dev-only backend routes and must never
 * ship in a production bundle. Two things keep them out, and both are source
 * shapes a refactor could break without any type error:
 *   - the loader's import() sits in the constant-false branch of a literal
 *     NODE_ENV test, so webpack drops it from production builds;
 *   - Providers renders the loader only when it is non-null.
 * The build itself is checked by grepping .next/static for "horo devtools".
 */
const read = (path: string) => readFileSync(join(import.meta.dir, '..', '..', '..', path), 'utf8');

describe('devtools mount', () => {
  test('the only import of the panel is behind the literal production check', () => {
    const loader = read('src/components/dev/devtools-loader.tsx');
    expect(loader).toMatch(
      /process\.env\.NODE_ENV !== 'production'\s*\?\s*dynamic\(\(\) => import\('\.\/horo-devtools'\)/,
    );
    expect(loader.match(/import\('\.\/horo-devtools'\)/g)).toHaveLength(1);
    expect(loader).toMatch(/:\s*null;/);
  });

  test('nothing else imports the panel directly', () => {
    for (const path of ['src/app/providers.tsx', 'src/app/layout.tsx']) {
      expect(read(path)).not.toContain('horo-devtools');
    }
  });

  test('Providers renders the loader only when it exists', () => {
    expect(read('src/app/providers.tsx')).toContain('{HoroDevtoolsLoader && <HoroDevtoolsLoader />}');
  });

  test('the loader evaluates to a component outside production', async () => {
    const { HoroDevtoolsLoader } = await import('./devtools-loader');
    expect(process.env.NODE_ENV).not.toBe('production');
    expect(HoroDevtoolsLoader).not.toBeNull();
  });
});

describe('devtools shortcut', () => {
  const key = (overrides: Partial<Pick<KeyboardEvent, 'altKey' | 'shiftKey' | 'ctrlKey' | 'metaKey' | 'code'>>) => ({
    altKey: false,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    code: 'KeyD',
    ...overrides,
  });

  test('Alt+Shift+D toggles; the combos browsers own do not', async () => {
    const { isDevtoolsShortcut } = await import('./horo-devtools');
    expect(isDevtoolsShortcut(key({ altKey: true, shiftKey: true }))).toBe(true);
    expect(isDevtoolsShortcut(key({ ctrlKey: true, shiftKey: true }))).toBe(false);
    expect(isDevtoolsShortcut(key({ metaKey: true, shiftKey: true }))).toBe(false);
    expect(isDevtoolsShortcut(key({ altKey: true, shiftKey: true, code: 'KeyF' }))).toBe(false);
  });
});
