import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '../..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('onboarding refresh recovery', () => {
  test('reuses a completed teaser instead of regenerating after refresh', () => {
    const source = read('components/onboarding/step-teaser.tsx');

    expect(source).toContain('const storedResult = completedTeaser(teaserResult)');
    expect(source).toContain('if (storedResult) return;');
    expect(source).toContain('{ timeout: 60_000 }');
  });

  test('invalidates the saved teaser whenever its profile input changes', () => {
    const source = read('stores/onboarding.ts');

    expect(source).toMatch(/updateProfile:[\s\S]*teaserResult: \{\}/);
  });
});
