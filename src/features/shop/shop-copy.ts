import type { ShopProduct } from '@/lib-packages/shared/types/shop';

const SEED_HEART_DESCRIPTION = 'ตั๋วสำหรับเปิดคำอ่านดวงคู่ ใช้ 1 ใบต่อ 1 คน ตั๋วที่ซื้อไม่มีวันหมดอายุ';

/** Keep an admin-edited description intact; reframe only the launch seed copy. */
export function shopProductCopy(product: Pick<ShopProduct, 'id' | 'description'>) {
  if (product.id === 'heart_ticket' && product.description === SEED_HEART_DESCRIPTION) {
    return {
      lead: 'เปิดดวงคู่ฉบับเต็มของคุณกับคนที่อยากเข้าใจให้มากขึ้น',
      terms: 'ใช้ 1 ใบต่อ 1 คน · ตั๋วที่ซื้อไม่มีวันหมดอายุ',
    };
  }
  return { lead: product.description, terms: null };
}
