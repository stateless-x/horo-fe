import type { LedgerEntry, LedgerKind, ProductId } from '@/lib-packages/shared/types/wallet';

/**
 * Wallet copy: transactional and pronoun-free. The unit มู is pegged
 * 1 มู = ฿1, and every amount is shown with its baht beside it. มู stands as a
 * unit after a number ("49 มู") or in "เติมมู"; elsewhere say ยอด, so it never
 * reads as the verb.
 */

export const UNIT = 'มู';

const number = (value: number) => value.toLocaleString('th-TH');

/** "49 มู" */
export function units(amount: number): string {
  return `${number(amount)} ${UNIT}`;
}

/** "49 มู (฿49)" */
export function unitsWithBaht(amount: number): string {
  return `${units(amount)} (฿${number(amount)})`;
}

export function baht(amount: number): string {
  return `฿${number(amount)}`;
}

export function signed(delta: number): string {
  return delta > 0 ? `+${number(delta)}` : `−${number(-delta)}`;
}

/** "ยอดไม่พอ มี 0 มู ต้องใช้ 49 มู (฿49)" */
export function shortfallLine(balance: number, price: number): string {
  return `ยอดไม่พอ มี ${units(balance)} ต้องใช้ ${unitsWithBaht(price)}`;
}

const PRODUCT_LABELS: Record<ProductId, string> = {
  compat_unlock: 'ปลดล็อกดวงคู่',
  month_pass: 'ดวงเดือนหน้า',
  year_reading: 'ดวงทั้งปี',
  wallpaper: 'วอลเปเปอร์เสริมดวง',
};

const KIND_LABELS: Record<LedgerKind, string> = {
  purchase: `เติม${UNIT}`,
  bonus: 'โบนัสจากแพ็ก',
  welcome: 'ของขวัญต้อนรับ',
  spend: 'ใช้จ่าย',
  refund: 'คืนยอด',
  admin_adjust: 'ปรับยอดโดยทีมงาน',
  expire: 'โบนัสหมดอายุ',
};

/** What a ledger row was for, in one short line. */
export function entryLabel(entry: LedgerEntry): string {
  if (entry.productId && entry.kind === 'spend') return PRODUCT_LABELS[entry.productId];
  if (entry.productId && entry.kind === 'refund') return `คืนยอด · ${PRODUCT_LABELS[entry.productId]}`;
  return KIND_LABELS[entry.kind];
}
