import type { HistoryKind, LedgerEntry, LedgerKind, PackId, ProductId, WalletPack, WalletPackOffer } from '@/lib-packages/shared/types/wallet';

/**
 * Wallet copy: transactional and pronoun-free. มู stands as a unit after a
 * number ("49 มู") or in "เติมมู"; elsewhere say ยอด, so it never reads as a verb.
 */

/** Short form shown after a number. The defined customer product is แต้มมู. */
export const UNIT = 'มู';
/** The separate, closed-loop points product used for Shop purchases. */
export const WALLET_NAME = 'แต้มมู';

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
export const STORE_PRESELECT: PackId = 'p100';
/** The pack that carries the คุ้มสุด tag. */
export const BEST_VALUE: PackId = 'p1000';

/**
 * The catalog's two packs: the cheapest that covers `needed`, plus one step
 * up. The first is the one to preselect.
 */
export function doorPacks<P extends WalletPack>(packs: P[], needed: number): P[] {
  const byPrice = [...packs].sort((a, b) => a.priceBaht - b.priceBaht);
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
  balance: (balance: number) => `ยอดคงเหลือ ${units(balance)}`,
  purpose: 'ใช้ซื้อสินค้าและบริการใน สายมู.com',
  pay: (priceBaht: number) => `จ่าย ${baht(priceBaht)} ด้วย PromptPay`,
  /** The first line sits below the pay button; the other terms expand on request. */
  trust: ['จ่ายครั้งเดียว ไม่ตัดเงินอัตโนมัติ', `มูใช้ซื้อสินค้าในสายมู.com แลกเป็นเงินสดไม่ได้`, `${UNIT}ที่เติมและโบนัสไม่หมดอายุ`],
  bestValue: 'คุ้มสุด',
  /** A pack radio's accessible name: "330 มู +10% ฿299". */
  packName: (pack: WalletPackOffer) =>
    [units(pack.base + pack.bonus), pack.bonusPercent > 0 && `+${pack.bonusPercent}%`, pack.id === BEST_VALUE && 'คุ้มสุด', baht(pack.priceBaht)]
      .filter(Boolean)
      .join(' '),
  /** "฿99 · 99 มู" */
  amount: (priceBaht: number, total: number) => `${baht(priceBaht)} · ${units(total)}`,
  save: 'บันทึก QR',
  saveHint: 'สแกนจากรูปที่บันทึกไว้ในแอปธนาคาร',
  saveFailed: 'บันทึกไม่สำเร็จ กดค้างที่รูป QR เพื่อบันทึกแทน',
  countdown: (seconds: number) => `QR หมดอายุใน ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
  expired: 'QR หมดอายุ',
  newQr: 'ขอ QR ใหม่',
  checking: 'กำลังตรวจสอบการชำระ',
  waiting: 'รอชำระเงิน · ยอดเข้าอัตโนมัติ',
  missing: 'จ่ายแล้ว แต่ยังไม่เห็นยอด?',
  verifyFailed: 'ตรวจสอบไม่สำเร็จ ลองอีกครั้ง',
  missingHelp: 'ยังไม่พบการชำระ ถ้าจ่ายแล้ว แจ้งหมายเลขนี้ได้ที่',
  orderRef: (orderId: string) => `คำสั่งซื้อ ${orderId.slice(0, 8)}`,
  credited: (amount: number) => `+${number(amount)} ${UNIT}`,
  newBalance: (balance: number) => `ยอดคงเหลือ ${units(balance)}`,
  upsell: (pack: WalletPack) => `ครั้งหน้าเติม ${baht(pack.priceBaht)} ได้ ${units(pack.base + pack.bonus)}`,
  /** After payment, until catalog fulfilment and report opening settle. */
  opening: (amount: number) => `เติมสำเร็จ ได้รับ +${number(amount)} ${UNIT} กำลังเปิดคำอ่าน`,
  openingHint: 'กำลังเตรียมคำตอบให้คุณ',
  failed: 'การชำระไม่สำเร็จ',
  retry: 'ลองอีกครั้ง',
  close: 'ปิด',
  unavailable: 'PromptPay เร็ว ๆ นี้',
  emailRequired: `ต้องมีอีเมลในบัญชีก่อนเติม${UNIT}`,
  emailLink: 'ไปที่ตั้งค่า',
  startFailed: 'เริ่มการชำระไม่สำเร็จ ลองอีกครั้ง',
};

/** /dashboard/wallet history: the kind filter pills (ทั้งหมด = no kind) and the list's paging lines. */
export const HISTORY_FILTERS: { kind: HistoryKind | undefined; label: string }[] = [
  { kind: undefined, label: 'ทั้งหมด' },
  { kind: 'topup', label: `เติม${UNIT}` },
  { kind: 'spend', label: `ใช้${UNIT}` },
  { kind: 'refund', label: 'คืนยอด' },
  { kind: 'adjust', label: 'ปรับยอด' },
];

export const HISTORY_COPY = {
  more: 'ดูเพิ่ม',
  loading: 'กำลังโหลด…',
  end: 'ครบแล้ว',
  failed: 'โหลดรายการไม่สำเร็จ',
  retry: 'ลองอีกครั้ง',
};

const PRODUCT_LABELS: Record<ProductId, string> = {
  compat_unlock: 'ปลดล็อกดวงคู่',
  month_pass: 'ดวงเดือนหน้า',
  year_reading: 'ดวงทั้งปี',
  wallpaper: 'วอลเปเปอร์เสริมดวง',
};

const KIND_LABELS: Record<LedgerKind, string> = {
  purchase: `เติม${UNIT}`,
  bonus: 'โบนัสเติมมู',
  welcome: 'ของขวัญต้อนรับ',
  spend: 'ใช้จ่าย',
  refund: 'คืนยอด',
  admin_adjust: 'ปรับยอด',
  expire: 'โบนัสหมดอายุ',
};

/** What a ledger row was for, in one short line. */
export function entryLabel(entry: LedgerEntry): string {
  const productLabel = entry.productId && entry.productId in PRODUCT_LABELS ? PRODUCT_LABELS[entry.productId as ProductId] : 'รายการในร้าน';
  if (entry.productId && entry.kind === 'spend') return entry.refName ?? productLabel;
  if (entry.productId && entry.kind === 'refund') return `คืนยอด · ${entry.refName ?? productLabel}`;
  if (entry.kind === 'purchase' && entry.amountBaht !== null) return `${KIND_LABELS.purchase} ${baht(entry.amountBaht)}`;
  if (entry.kind === 'admin_adjust' && entry.by === 'team') return 'ปรับยอดโดยทีมงาน';
  return KIND_LABELS[entry.kind];
}
