import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DEFAULT_AUTHENTICATED_PATH,
  sanitizeReturnTo,
  withReturnTo,
} from './auth-navigation';

const repoRoot = join(import.meta.dir, '..', '..');
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8');

describe('authentication navigation wiring', () => {
  test('validates resumable internal destinations without allowing open redirects', () => {
    expect(sanitizeReturnTo('/dashboard/compatibility?from=share')).toBe(
      '/dashboard/compatibility?from=share',
    );
    expect(sanitizeReturnTo('/invite/abc-123')).toBe('/invite/abc-123');
    expect(sanitizeReturnTo('https://evil.example/steal')).toBe(DEFAULT_AUTHENTICATED_PATH);
    expect(sanitizeReturnTo('//evil.example/steal')).toBe(DEFAULT_AUTHENTICATED_PATH);
    expect(sanitizeReturnTo('/login')).toBe(DEFAULT_AUTHENTICATED_PATH);
  });

  test('adds a safe encoded destination to an auth or setup path', () => {
    expect(withReturnTo('/login', '/dashboard/fortune?tab=work')).toBe(
      '/login?returnTo=%2Fdashboard%2Ffortune%3Ftab%3Dwork',
    );
    expect(withReturnTo('/fortune?setup=true', '/dashboard/settings')).toBe(
      '/fortune?setup=true&returnTo=%2Fdashboard%2Fsettings',
    );
  });

  test('an existing session and both OAuth callbacks use the intended destination', () => {
    const loginPage = read('src/app/login/page.tsx');

    expect(loginPage).toContain('router.replace(returnTo)');
    expect(loginPage).toContain('if (isPending || session)');
    expect(loginPage.match(/getCallbackUrl\(returnTo\)/g)).toHaveLength(2);
  });

  test('missing-profile setup preserves the intended destination through onboarding', () => {
    const dashboardGate = read('src/components/dashboard/dashboard-profile-gate.tsx');
    const fortunePage = read('src/app/fortune/page.tsx');
    const onboardingFlow = read('src/components/onboarding/onboarding-flow.tsx');
    const authStep = read('src/components/onboarding/step-auth.tsx');

    expect(dashboardGate).toContain("withReturnTo('/fortune?setup=true', returnTo)");
    expect(fortunePage).toContain('<OnboardingFlow returnTo={returnTo} />');
    expect(onboardingFlow).toContain('router.replace(destination)');
    expect(authStep.match(/getCallbackUrl\(destination\)/g)).toHaveLength(2);
  });

  test('a consumed invite lands on the live compatibility route', () => {
    const invitePage = read('src/app/invite/[token]/page.tsx');
    expect(invitePage).toContain("router.replace('/dashboard/compatibility')");
    expect(invitePage).not.toContain('/dashboard?compatibility=true');
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
