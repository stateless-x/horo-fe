import { describe, expect, test } from 'bun:test';
import { classifyCompatibilityFailure } from './analytics';

describe('classifyCompatibilityFailure', () => {
  test.each([
    [{ status: 429 }, 'rate_limited'],
    [{ code: 'TIMEOUT' }, 'timeout'],
    [{ status: 400 }, 'validation'],
    [{ status: 401 }, 'authentication'],
    [{ status: 404 }, 'profile_missing'],
    [{ status: 503 }, 'server'],
  ] as const)('maps a bounded API failure %#', (error, expected) => {
    expect(classifyCompatibilityFailure(error)).toBe(expected);
  });

  test('maps fetch TypeError to network without exposing its message', () => {
    expect(classifyCompatibilityFailure(new TypeError('partner details leaked here'))).toBe('network');
  });

  test('maps unrecognized values to unknown', () => {
    expect(classifyCompatibilityFailure(new Error('unexpected'))).toBe('unknown');
  });
});
