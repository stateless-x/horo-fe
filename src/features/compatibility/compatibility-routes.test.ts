import { describe, expect, test } from 'bun:test';
import {
  COMPATIBILITY_DASHBOARD_PATH,
  compatibilityHistoryPath,
  compatibilityResultFailureKind,
  compatibilityResultPath,
  parseHistoryPage,
  parseHistoryType,
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

  test('keeps the full history at a bare path for page 1 and no filter', () => {
    expect(compatibilityHistoryPath()).toBe('/dashboard/compatibility/history');
    expect(compatibilityHistoryPath({ page: 1 })).toBe('/dashboard/compatibility/history');
    expect(compatibilityHistoryPath({ page: 3, type: 'boss' })).toBe(
      '/dashboard/compatibility/history?type=boss&page=3',
    );
  });

  test('reads ?page= and ?type= defensively', () => {
    expect(parseHistoryPage('2')).toBe(2);
    expect(parseHistoryPage(undefined)).toBe(1);
    expect(parseHistoryPage('0')).toBe(1);
    expect(parseHistoryPage('-4')).toBe(1);
    expect(parseHistoryPage('1.5')).toBe(1);
    expect(parseHistoryPage('abc')).toBe(1);
    expect(parseHistoryType('family')).toBe('family');
    expect(parseHistoryType('enemy')).toBeUndefined();
    expect(parseHistoryType(undefined)).toBeUndefined();
  });
});
