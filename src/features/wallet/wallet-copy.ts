import type { LedgerEntry, LedgerKind, ProductId } from '@/lib-packages/shared/types/wallet';

/**
 * Wallet copy: transactional and pronoun-free. ละอองดาว is pegged 1 = ฿1 and
 * every amount is shown with its baht beside it.
 */

export const UNIT = 'ละอองดาว';

const number = (value: number) => value.toLocaleString('th-TH');

/** "49 ละอองดาว (฿49)" */
export function stardustWithBaht(amount: number): string {
  return `${number(amount)} ${UNIT} (฿${number(amount)})`;
}

export function baht(amount: number): string {
  return `฿${number(amount)}`;
}

export function signed(delta: number): string {
  return delta > 0 ? `+${number(delta)}` : `−${number(-delta)}`;
}

const PRODUCT_LABELS: Record<ProductId, string> = {
  compat_unlock: 'ปลดล็อกดวงคู่',
  month_pass: 'ดวงเดือนหน้า',
  year_reading: 'ดวงทั้งปี',
  wallpaper: 'วอลเปเปอร์เสริมดวง',
};

const KIND_LABELS: Record<LedgerKind, string> = {
  purchase: 'เติมละอองดาว',
  bonus: 'โบนัสจากแพ็ก',
  welcome: 'ของขวัญต้อนรับ',
  spend: 'ใช้ละอองดาว',
  refund: 'คืนละอองดาว',
  admin_adjust: 'ปรับยอดโดยทีมงาน',
  expire: 'โบนัสหมดอายุ',
};

/** What a ledger row was for, in one short line. */
export function entryLabel(entry: LedgerEntry): string {
  if (entry.productId && entry.kind === 'spend') return PRODUCT_LABELS[entry.productId];
  if (entry.productId && entry.kind === 'refund') return `คืน · ${PRODUCT_LABELS[entry.productId]}`;
  return KIND_LABELS[entry.kind];
}
