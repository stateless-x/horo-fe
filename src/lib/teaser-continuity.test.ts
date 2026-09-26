import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { consumeContinueFocus, setContinueFocus } from './teaser-continuity';

const originalLocalStorage = globalThis.localStorage;

function freshLocalStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: () => null,
    get length() {
      return store.size;
    },
  } as Storage;
}

beforeEach(() => {
  globalThis.localStorage = freshLocalStorage();
});

afterEach(() => {
  globalThis.localStorage = originalLocalStorage;
});

describe('teaser continuity pointer', () => {
  test('round-trips a freshly set focus area', () => {
    setContinueFocus('love');
    expect(consumeContinueFocus()).toBe('love');
  });

  test('consuming deletes the key so it only fires once', () => {
    setContinueFocus('career');
    expect(consumeContinueFocus()).toBe('career');
    expect(consumeContinueFocus()).toBeNull();
  });

  test('returns null when nothing was ever set', () => {
    expect(consumeContinueFocus()).toBeNull();
  });

  test('rejects a focus area outside the four daily categories', () => {
    setContinueFocus('life_overview' as never);
    expect(consumeContinueFocus()).toBeNull();
  });

  test('a stale pointer older than 24h is discarded', () => {
    const stale = { area: 'health', setAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() };
    localStorage.setItem('horo-continue-focus', JSON.stringify(stale));
    expect(consumeContinueFocus()).toBeNull();
  });

  test('a malformed stored value is discarded without throwing', () => {
    localStorage.setItem('horo-continue-focus', 'not json');
    expect(() => consumeContinueFocus()).not.toThrow();
    expect(consumeContinueFocus()).toBeNull();
  });
});
