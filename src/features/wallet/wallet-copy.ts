import type { LedgerEntry, LedgerKind, PackId, ProductId, WalletPack, WalletPackOffer } from '@/lib-packages/shared/types/wallet';

/**
 * Wallet copy: transactional and pronoun-free. The unit มู is pegged
 * 1 มู = ฿1, and every amount is shown with its baht beside it. มู stands as a
 * unit after a number ("49 มู") or in "เติมมู"; elsewhere say ยอด, so it never
 * reads as the verb.
 */

export const UNIT = 'มู';

/** Where a payment problem goes: the one contact address the app already shows (/contact). */
export const SUPPORT_EMAIL = 'askpurin@pm.me';

const number = (value: number) => value.toLocaleString('th-TH');

/** "49 มู" */
export function units(amount: number): string {
  return `${number(amount)} ${UNIT}`;
}

export function baht(amount: number): string {
  return `฿${number(amount)}`;
}

export function signed(delta: number): string {
  return delta > 0 ? `+${number(delta)}` : `−${number(-delta)}`;
}

/** "ยอดไม่พอ มี 0 มู ต้องใช้ 49 มู" */
export function shortfallLine(balance: number, price: number): string {
  return `ยอดไม่พอ มี ${units(balance)} ต้องใช้ ${units(price)}`;
}

/** The pack the store sheet (chip, wallet page) preselects. */
export const STORE_PRESELECT: PackId = 'p99';
/** The pack the door never offers: too big for one unlock. */
const DOOR_HIDDEN: PackId = 'p399';
/** The pack that carries the คุ้มสุด tag. */
export const BEST_VALUE: PackId = 'p199';

/**
 * The door's two packs: the cheapest that covers `needed`, plus one step up
 * (never p399). The first is the one to preselect.
 */
export function doorPacks<P extends WalletPack>(packs: P[], needed: number): P[] {
  const byPrice = packs.filter((pack) => pack.id !== DOOR_HIDDEN).sort((a, b) => a.priceBaht - b.priceBaht);
  const covering = byPrice.findIndex((pack) => pack.base + pack.bonus >= needed);
  const start = covering === -1 ? Math.max(byPrice.length - 1, 0) : covering;
  return byPrice.slice(start, start + 2);
}

/** The next pack up from `packId`, for the quiet line after a store purchase; undefined after the biggest. */
export function nextPackUp<P extends WalletPack>(packs: P[], packId: PackId): P | undefined {
  const byPrice = [...packs].sort((a, b) => a.priceBaht - b.priceBaht);
  return byPrice[byPrice.findIndex((pack) => pack.id === packId) + 1];
}

export const topupCopy = {
  balance: (balance: number) => `ยอดคงเหลือ ${units(balance)} · 1 ${UNIT} = ฿1`,
  purpose: 'ใช้ได้กับทุกอย่างใน Horo: ดวงคู่ วอลเปเปอร์ ถามแม่หมอ',
  pay: (priceBaht: number) => `จ่าย ${baht(priceBaht)} ด้วย PromptPay`,
  /** Two lines under the pay button. */
  trust: ['จ่ายครั้งเดียว ไม่ตัดเงินอัตโนมัติ', `${UNIT}ที่เติมไม่หมดอายุ · โบนัสใช้ได้ 180 วัน`],
  bestValue: 'คุ้มสุด',
  /** A pack radio's accessible name: "109 มู +10% ฿99". */
  packName: (pack: WalletPackOffer) =>
    [units(pack.base + pack.bonus), pack.bonusPercent > 0 && `+${pack.bonusPercent}%`, pack.id === BEST_VALUE && 'คุ้มสุด', baht(pack.priceBaht)]
      .filter(Boolean)
      .join(' '),
  /** "฿99 · 109 มู" */
  amount: (priceBaht: number, total: number) => `${baht(priceBaht)} · ${units(total)}`,
  save: 'บันทึก QR',
  saveHint: 'บันทึก → เปิดแอปธนาคาร → สแกนจากรูป',
  saveFailed: 'บันทึกไม่สำเร็จ กดค้างที่รูป QR เพื่อบันทึกแทน',
  countdown: (seconds: number) => `QR ใช้ได้อีก ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
  expired: 'QR หมดอายุ',
  newQr: 'ขอ QR ใหม่',
  checking: 'กำลังตรวจสอบการชำระ',
  waiting: 'รอยืนยันการชำระ ยอดจะเข้าเองเมื่อจ่ายแล้ว',
  missing: 'ไม่เห็นยอด?',
  verifyFailed: 'ตรวจสอบไม่สำเร็จ ลองอีกครั้ง',
  missingHelp: 'ยังไม่พบการชำระ ถ้าจ่ายแล้ว แจ้งหมายเลขนี้ได้ที่',
  orderRef: (orderId: string) => `คำสั่งซื้อ ${orderId.slice(0, 8)}`,
  credited: (amount: number) => `+${number(amount)} ${UNIT}`,
  newBalance: (balance: number) => `ยอดคงเหลือ ${units(balance)}`,
  upsell: (pack: WalletPack) => `ครั้งหน้าเติม ${baht(pack.priceBaht)} ได้ ${units(pack.base + pack.bonus)}`,
  /** Door, after payment, until the unlock settles: one state, "+49 มู · กำลังเปิดคำตอบ…". */
  opening: (amount: number) => `+${number(amount)} ${UNIT} · กำลังเปิดคำตอบ…`,
  openingHint: 'กำลังเขียนคำตอบเฉพาะคู่นี้ (ราว 20 วินาที)',
  failed: 'การชำระไม่สำเร็จ',
  retry: 'ลองอีกครั้ง',
  close: 'ปิด',
  unavailable: 'PromptPay เร็ว ๆ นี้',
  emailRequired: `ต้องมีอีเมลในบัญชีก่อนเติม${UNIT}`,
  emailLink: 'ไปที่ตั้งค่า',
  cap: (cap: number) => `ยอดสูงสุดต่อบัญชีคือ ${units(cap)} ตอนนี้เติมเพิ่มไม่ได้`,
  startFailed: 'เริ่มการชำระไม่สำเร็จ ลองอีกครั้ง',
};

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
  admin_adjust: 'ปรับยอด',
  expire: 'โบนัสหมดอายุ',
};

/** What a ledger row was for, in one short line. */
export function entryLabel(entry: LedgerEntry): string {
  const named = (label: string) => (entry.refName ? `${label} · ${entry.refName}` : label);
  if (entry.productId && entry.kind === 'spend') return named(PRODUCT_LABELS[entry.productId]);
  if (entry.productId && entry.kind === 'refund') return named(`คืนยอด · ${PRODUCT_LABELS[entry.productId]}`);
  if (entry.kind === 'purchase' && entry.amountBaht !== null) return `${KIND_LABELS.purchase} ${baht(entry.amountBaht)} → ${signed(entry.delta)} ${UNIT}`;
  if (entry.kind === 'admin_adjust' && entry.by === 'team') return 'ปรับยอดโดยทีมงาน';
  return KIND_LABELS[entry.kind];
}
