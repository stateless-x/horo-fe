import { describe, expect, test } from 'bun:test';
import { localizeColorName, localizeDayName } from './thai-localize';

describe('localizeDayName', () => {
  test('maps English day names to Thai', () => {
    expect(localizeDayName('saturday')).toBe('วันเสาร์');
    expect(localizeDayName('Monday')).toBe('วันจันทร์');
  });

  test('maps the split Wednesday shared-schema values', () => {
    expect(localizeDayName('wednesday_day')).toBe('วันพุธกลางวัน');
    expect(localizeDayName('wednesday_night')).toBe('วันพุธกลางคืน');
  });

  test('passes already-Thai values through untouched', () => {
    expect(localizeDayName('วันเสาร์')).toBe('วันเสาร์');
  });
});

describe('localizeColorName', () => {
  test('strips English parentheticals', () => {
    expect(localizeColorName('ม่วง (Purple)')).toBe('ม่วง');
  });

  test('maps pure English color words', () => {
    expect(localizeColorName('Purple')).toBe('ม่วง');
    expect(localizeColorName('gold')).toBe('ทอง');
  });

  test('localizes comma-separated lists per part', () => {
    expect(localizeColorName('Purple, Gold')).toBe('ม่วง, ทอง');
  });

  test('localizes และ-separated lists per part', () => {
    expect(localizeColorName('ม่วง (Purple) และ ทอง (Gold)')).toBe('ม่วง และ ทอง');
  });

  test('passes already-Thai values through untouched', () => {
    expect(localizeColorName('ม่วง')).toBe('ม่วง');
    expect(localizeColorName('ม่วง, ดำ, แดง')).toBe('ม่วง, ดำ, แดง');
  });
});
