import { describe, expect, test } from 'bun:test';
import {
  getBangkokDate,
  getChartReadingPeriod,
  getMsUntilBangkokMonthEnd,
  resolveChartReadingPeriod,
} from './date-utils';

describe('getMsUntilBangkokMonthEnd', () => {
  test('lands on the first of the next month, 00:00 Bangkok time', () => {
    const thaiNow = getBangkokDate();
    const target = new Date(thaiNow.getTime() + getMsUntilBangkokMonthEnd());

    expect(target.getDate()).toBe(1);
    expect(target.getHours()).toBe(0);
    expect(target.getMinutes()).toBe(0);
    // The boundary is always the month after the current one.
    expect(target.getMonth()).toBe((thaiNow.getMonth() + 1) % 12);
  });

  test('never returns less than a minute, so the boundary cannot busy-refetch', () => {
    expect(getMsUntilBangkokMonthEnd()).toBeGreaterThanOrEqual(60 * 1000);
  });

  test('stays within the longest possible month', () => {
    expect(getMsUntilBangkokMonthEnd()).toBeLessThanOrEqual(31 * 24 * 60 * 60 * 1000);
  });
});

describe('getChartReadingPeriod', () => {
  test('derives the BE year as the Bangkok Gregorian year plus 543', () => {
    const period = getChartReadingPeriod();

    expect(period.yearBe).toBe(getBangkokDate().getFullYear() + 543);
  });

  test('formats yearMonth as the zero-padded backend regeneration key', () => {
    expect(getChartReadingPeriod().yearMonth).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe('resolveChartReadingPeriod', () => {
  test('prefers the month the backend stamped on the narrative', () => {
    const fallback = getChartReadingPeriod();
    expect(
      resolveChartReadingPeriod({ yearMonth: fallback.yearMonth, monthTh: fallback.currentMonth, yearBe: fallback.yearBe }),
    ).toEqual({ monthTh: fallback.currentMonth, yearBe: fallback.yearBe, renewsOn: fallback.renewsOn, isCurrentMonth: true });
  });

  test('rolls renewsOn into January when the stamped month is December', () => {
    expect(
      resolveChartReadingPeriod({ yearMonth: '2026-12', monthTh: 'ธันวาคม', yearBe: 2569 }).renewsOn,
    ).toBe('1 มกราคม');
  });

  test('falls back to the Bangkok clock for a chart with no stamped period, and that fallback is always the current month', () => {
    const fallback = getChartReadingPeriod();
    const resolved = resolveChartReadingPeriod(undefined);

    expect(resolved.monthTh).toBe(fallback.currentMonth);
    expect(resolved.yearBe).toBe(fallback.yearBe);
    expect(resolved.renewsOn).toBe(fallback.renewsOn);
    expect(resolved.isCurrentMonth).toBe(true);
  });

  test('isCurrentMonth is false for a stamped period that is not this Bangkok month', () => {
    // 1970-01 can never be "now" on any machine's clock.
    const resolved = resolveChartReadingPeriod({ yearMonth: '1970-01', monthTh: 'มกราคม', yearBe: 2513 });
    expect(resolved.isCurrentMonth).toBe(false);
  });

  test('isCurrentMonth is true when the stamped period matches the real Bangkok clock', () => {
    const fallback = getChartReadingPeriod();
    const resolved = resolveChartReadingPeriod({
      yearMonth: fallback.yearMonth,
      monthTh: fallback.currentMonth,
      yearBe: fallback.yearBe,
    });
    expect(resolved.isCurrentMonth).toBe(true);
  });
});
