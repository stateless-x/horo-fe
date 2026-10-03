import { describe, expect, test } from 'bun:test';
import { shopProductCopy } from './shop-copy';

describe('shop product copy', () => {
  test('turns the launch ticket description into a benefit and clear terms', () => {
    expect(shopProductCopy({ id: 'heart_ticket', description: 'ตั๋วสำหรับเปิดคำอ่านดวงคู่ ใช้ 1 ใบต่อ 1 คน ตั๋วที่ซื้อไม่มีวันหมดอายุ' })).toEqual({
      lead: 'เปิดดวงคู่ฉบับเต็มของคุณกับคนที่อยากเข้าใจให้มากขึ้น',
      terms: 'ใช้ 1 ใบต่อ 1 คน · ตั๋วที่ซื้อไม่มีวันหมดอายุ',
    });
  });

  test('respects an admin-edited description and future products', () => {
    const description = 'คำอธิบายใหม่จากแค็ตตาล็อก';
    expect(shopProductCopy({ id: 'heart_ticket', description })).toEqual({ lead: description, terms: null });
    expect(shopProductCopy({ id: 'another_item', description })).toEqual({ lead: description, terms: null });
  });
});
