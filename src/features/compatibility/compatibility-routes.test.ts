import { describe, expect, test } from 'bun:test';
import {
  COMPATIBILITY_DASHBOARD_PATH,
  compatibilityResultFailureKind,
  compatibilityResultPath,
} from './compatibility-routes';

describe('compatibility routes', () => {
  test('keeps the signed-in form at a stable dashboard path', () => {
    expect(COMPATIBILITY_DASHBOARD_PATH).toBe('/dashboard/compatibility');
  });

  test('builds a canonical, encoded result path', () => {
    expect(compatibilityResultPath('report/id')).toBe('/dashboard/compatibility/report%2Fid');
  });

  test('preserves a selected report section', () => {
    expect(compatibilityResultPath('abc-123', 'next steps')).toBe(
      '/dashboard/compatibility/abc-123?section=next+steps',
    );
  });

  test('keeps missing and private reports distinct from retryable failures', () => {
    expect(compatibilityResultFailureKind({ status: 403 })).toBe('unavailable');
    expect(compatibilityResultFailureKind({ status: 404 })).toBe('unavailable');
    expect(compatibilityResultFailureKind({ status: 500 })).toBe('transient');
    expect(compatibilityResultFailureKind(new TypeError('offline'))).toBe('transient');
  });
});
