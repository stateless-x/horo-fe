import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = join(import.meta.dir, '..', '..');
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8');

describe('authentication navigation wiring', () => {
  test('an existing session and both OAuth callbacks enter through dashboard today', () => {
    const loginPage = read('src/app/login/page.tsx');

    expect(loginPage).toContain("router.replace('/dashboard/today')");
    expect(loginPage).toContain('if (isPending || session)');
    expect(loginPage.match(/getCallbackUrl\('\/dashboard\/today'\)/g)).toHaveLength(2);
  });

  test('every logout control uses the shared server-first flow', () => {
    const header = read('src/components/layout/app-header.tsx');
    const settings = read('src/app/dashboard/settings/page.tsx');
    const logoutHook = read('src/hooks/use-app-logout.ts');

    expect(header).toContain('useAppLogout()');
    expect(settings).toContain('useAppLogout()');
    expect(logoutHook).toContain('signOut({ fetchOptions: { throw: true } })');
    expect(logoutHook).toContain("router.replace('/login')");
  });
});
