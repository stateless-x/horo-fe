import { Button } from '@/lib-packages/ui';
import type { WalletPack } from '@/lib-packages/shared/types/wallet';
import { UNIT, baht } from './wallet-copy';

/**
 * The three ละอองดาว packs with their baht price and bonus. Payment is not
 * wired yet (monetization T5), so each pack's button is disabled and one line
 * says why. No purple text: ink, ink-muted and the disabled button only.
 */
export function PackList({ packs }: { packs: WalletPack[] }) {
  return (
    <div>
      <ul className="grid gap-2.5">
        {packs.map((pack) => (
          <li
            key={pack.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-xl border border-edge bg-surface px-4 py-3"
          >
            <p className="font-heading text-lg font-semibold leading-snug text-ink">
              <span className="font-mono tabular-nums">{pack.base + pack.bonus}</span> {UNIT}
            </p>
            <p className="text-right font-heading text-lg font-semibold leading-snug text-ink">{baht(pack.priceBaht)}</p>
            <p className="text-[0.8125rem] leading-relaxed text-inkMuted">
              {pack.bonus > 0 ? `${pack.base} + โบนัส ${pack.bonus} (โบนัสใช้ได้ 180 วัน)` : 'ไม่มีวันหมดอายุ'}
            </p>
            <Button type="button" variant="soft" size="sm" disabled className="h-9 px-3 text-xs">
              PromptPay เร็ว ๆ นี้
            </Button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-inkMuted">
        ยังเติมละอองดาวไม่ได้ตอนนี้ การจ่ายด้วย PromptPay กำลังจะเปิด
      </p>
    </div>
  );
}
