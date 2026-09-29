'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, CalendarDays, History, ListChecks, Loader2, Sparkles, type LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/lib-packages/ui';
import { api, type ApiError } from '@/lib/api';
import { INSUFFICIENT_BALANCE, type CheckoutResponse } from '@/lib-packages/shared/types/wallet';
import type { RelationshipType } from '@/lib-packages/shared';
import { PackSheet } from '@/features/wallet/pack-sheet';
import { WALLET_QUERY_KEY, enabledWallet, useWallet } from '@/features/wallet/use-wallet';
import { baht, shortfallLine, smallestPackCovering, units } from '@/features/wallet/wallet-copy';
import { spaceLatinName } from '@/lib-packages/shared/types/names';
import { BOUND_FRAME, MiniSeal, REPORT_CARD } from './report-kit';
import { lockedOfferCopy } from './report-copy';
import { relationshipReportVisuals } from './report-visuals';

export interface ReportContentsEntry {
  /** Element id the entry jumps to. */
  id: string;
  title: string;
  /** Short label for the phone chip bar. */
  short: string;
  /** Chapters show a dot; the other entries show an icon. */
  icon?: 'overview' | 'calendar' | 'plan';
}

const ENTRY_ICON: Record<NonNullable<ReportContentsEntry['icon']>, LucideIcon> = {
  overview: Sparkles,
  calendar: CalendarDays,
  plan: ListChecks,
};

const UNLOCK_ORACLE_ART = '/assets/clay/little-oracle-mark-v1.webp';

export function EntryMark({ entry }: { entry: ReportContentsEntry }) {
  if (!entry.icon) return <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />;
  const Icon = ENTRY_ICON[entry.icon];
  return <Icon className="size-[15px]" aria-hidden="true" />;
}

interface ReportDoorProps {
  partnerName: string;
  relationshipType?: RelationshipType;
  readingMinutes: number;
  contents: ReportContentsEntry[];
  /** Full report: the contents become links and the foot offers "open everything". */
  full: boolean;
  /** The stored reading's id: a one-flow purchase unlocks this row once paid. */
  unlockRef?: string;
  onJump: (id: string) => void;
  allOpen: boolean;
  onToggleAll: () => void;
  /**
   * Teaser only: unlocks the report. A rejection with HTTP 402
   * `insufficient_balance` (the ApiError itself, rethrown) turns the button
   * into "เติมมู"; any other
   * rejection's message is shown in the door.
   */
  onUnlock?: () => void | Promise<void>;
}

/**
 * ReportDoor: the locked panel that becomes the report's front page. Locked,
 * it summarizes four benefits with the unlock button; open, it becomes the
 * detailed table of contents, framed as the bound ฉบับเต็ม.
 */
export function ReportDoor({ partnerName, relationshipType, readingMinutes, contents, full, unlockRef, onJump, allOpen, onToggleAll, onUnlock }: ReportDoorProps) {
  const reduce = useReducedMotion();
  const queryClient = useQueryClient();
  const wallet = enabledWallet(useWallet().data);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insufficient, setInsufficient] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);

  const price = wallet?.prices.compat_unlock;
  const balance = wallet?.balance;
  const offer = lockedOfferCopy(relationshipType);
  const visuals = relationshipReportVisuals(relationshipType);
  const lockedValues = offer.values.map((value, index) => ({
    ...value,
    art: [visuals.sections.people, visuals.sections.conversation, visuals.next.calendar.art, visuals.next.plan.art][index],
  }));
  // Short of the price: the primary button buys and unlocks in one flow instead of spending.
  const short = insufficient || (price !== undefined && balance !== undefined && balance < price);
  const pack = wallet && price !== undefined && balance !== undefined ? smallestPackCovering(wallet.packs, price - balance) : undefined;

  /** One-flow purchase: an order for the smallest pack that covers this unlock, which unlocks this row once paid. */
  const buy = async () => {
    if (!pack || busy) return;
    setBusy(true);
    setError(null);
    try {
      setCheckout(await api.post<CheckoutResponse>('/api/wallet/checkout', { packId: pack.id, unlockRef }));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setBusy(false);
    }
  };

  const unlock = async () => {
    if (!onUnlock || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onUnlock();
    } catch (failure) {
      const refused = failure as ApiError;
      if (refused.status === 402 && refused.body?.error === INSUFFICIENT_BALANCE) {
        // The balance changed since it was read: offer the purchase, which unlocks after paying.
        setInsufficient(true);
      } else {
        // The caller turns a failed request into a message for the reader.
        setError(failure instanceof Error ? failure.message : String(failure));
      }
    } finally {
      setBusy(false);
      // A spend (or a refused one) changes what the balance chip and this button show.
      await queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
    }
  };

  const unlockLabel = price !== undefined ? `เปิดคำตอบทั้งหมด · ${balance !== undefined && balance >= price ? units(price) : baht(price)}` : 'เปิดคำตอบทั้งหมด';

  return (
    <section
      aria-labelledby="report-door"
      className={
        full
          ? `${REPORT_CARD} px-5 pb-5 pt-[22px] sm:px-7 sm:pb-6 sm:pt-[26px] ${BOUND_FRAME}`
          : 'rounded-2xl border border-romance/25 bg-[linear-gradient(145deg,var(--surface),color-mix(in_srgb,var(--color-romance)_8%,var(--surface2)))] px-5 pb-5 pt-[22px] shadow-[0_18px_44px_-30px_rgba(107,33,168,0.35)] sm:px-7 sm:pb-6 sm:pt-[26px]'
      }
    >
      <div className={full ? 'flex items-center gap-3' : undefined}>
        {full && (
          <span className="grid size-10 shrink-0 place-items-center text-ink">
            <MiniSeal />
          </span>
        )}
        <h2 id="report-door" tabIndex={-1} className="text-balance font-heading text-2xl font-semibold leading-snug text-ink focus:outline-none">
          {full ? spaceLatinName(`คำตอบของคุณกับ${partnerName}`, partnerName) : offer.title}
        </h2>
      </div>
      <p className="mt-2.5 text-base leading-relaxed text-inkMuted">
        {full ? (
          <>อ่านราว <b className="font-semibold text-ink">{readingMinutes} นาที</b> · 4 ส่วน · ปฏิทิน 3 เดือน · 3 ก้าวเล็ก ๆ ใน 7 วัน</>
        ) : (
          <>{offer.description}</>
        )}
      </p>

      {full ? (
        <details className="group mt-4 min-[1120px]:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg border-y border-edge py-2.5 font-heading font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright [&::-webkit-details-marker]:hidden">
            ดูสารบัญ {contents.length} หัวข้อ
            <ArrowRight className="size-4 text-inkMuted transition-transform group-open:rotate-90 motion-reduce:transition-none" aria-hidden="true" />
          </summary>
          <ol className="border-b border-edge">
            {contents.map((entry) => (
              <li key={entry.id} className="border-b border-edge last:border-b-0">
                <a
                  href={`#${entry.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onJump(entry.id);
                  }}
                  className="grid min-h-[50px] grid-cols-[28px_minmax(0,1fr)_18px] items-center gap-3 rounded-lg px-1.5 transition-colors hover:bg-edgeSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
                >
                  <span className="grid size-7 place-items-center rounded-full border border-edge bg-surface text-inkMuted">
                    <EntryMark entry={entry} />
                  </span>
                  <span className="font-heading font-medium leading-snug text-ink">{entry.title}</span>
                  <ArrowRight className="size-4 text-inkMuted" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ol>
        </details>
      ) : (
        <ul className="mt-5 divide-y divide-edge border-y border-edge">
          {lockedValues.map(({ art, title, detail }) => (
            <li key={title} className="flex min-h-[76px] items-center gap-3 py-3 first:pt-3.5 last:pb-3.5">
              <span className="grid size-[54px] shrink-0 place-items-center rounded-2xl bg-surface2/80 ring-1 ring-edge">
                {art && <Image alt="" src={art} width={96} height={96} sizes="54px" className="size-[52px] object-contain" />}
              </span>
              <span className="min-w-0 text-sm leading-relaxed text-inkMuted">
                <b className="block font-heading text-[0.9375rem] font-semibold leading-snug text-ink">{title}</b>
                {detail}
              </span>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence initial={false} mode="wait">
        {full ? (
          <motion.div
            key="foot"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-3 pt-4"
          >
            <p className="flex flex-[1_1_220px] items-start gap-2 text-sm leading-relaxed text-inkMuted">
              <History className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              เก็บไว้ในประวัติดวงคู่แล้ว อ่านซ้ำได้ตลอด
            </p>
            <Button type="button" variant="soft" onClick={onToggleAll} aria-pressed={allOpen} className="h-11 gap-1.5 px-3 font-heading">
              <BookOpen className="size-4" aria-hidden="true" />
              {allOpen ? 'ย่อทั้งหมด' : 'เปิดอ่านทั้งหมด'}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="cta"
            exit={reduce ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 pt-5">
              {onUnlock && short && pack && (
                <>
                  <Button
                    type="button"
                    size="lg"
                    onClick={buy}
                    aria-busy={busy}
                    disabled={busy || checkout !== null}
                    className="h-auto min-h-14 w-full gap-2.5 whitespace-normal px-5 py-3 font-heading"
                  >
                    {busy ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Image alt="" src={UNLOCK_ORACLE_ART} width={48} height={48} sizes="24px" className="size-6 object-contain" />}
                    {checkout?.payment === 'unavailable' ? 'PromptPay เร็ว ๆ นี้' : `เปิดคำตอบทั้งหมด · ${baht(pack.priceBaht)}`}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setSheetOpen(true)}
                    className="mx-auto min-h-11 rounded-lg px-3 text-sm text-ink underline decoration-edge underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
                  >
                    ดูแพ็กมูทั้งหมด
                  </button>
                  {checkout && (
                    <p role="status" className="text-sm leading-relaxed text-inkMuted">
                      {checkout.message}
                    </p>
                  )}
                </>
              )}
              {onUnlock && !(short && pack) && (
                <Button type="button" size="lg" onClick={unlock} aria-busy={busy} disabled={busy} className="h-auto min-h-14 w-full gap-2.5 whitespace-normal px-5 py-3 font-heading">
                  {busy ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Image alt="" src={UNLOCK_ORACLE_ART} width={48} height={48} sizes="24px" className="size-6 object-contain" />}
                  {busy ? 'กำลังเขียนคำตอบเฉพาะคู่นี้ (ราว 20 วินาที)' : unlockLabel}
                </Button>
              )}
              <p aria-live="polite" className="empty:hidden text-sm leading-relaxed text-inkMuted">
                {busy ? 'เสร็จแล้วคำตอบจะเปิดตรงนี้เลย ไม่ต้องกดซ้ำ' : ''}
              </p>
              {error && (
                <p role="alert" className="text-sm leading-relaxed text-danger">
                  {error}
                </p>
              )}
              {short && price !== undefined && balance !== undefined && (
                <p className="text-sm leading-relaxed text-inkMuted">
                  {shortfallLine(balance, price)}
                </p>
              )}
              {!short && price !== undefined && balance !== undefined && (
                <p className="text-center text-sm leading-relaxed text-inkMuted">ยอดคงเหลือ {units(balance)}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {wallet && (
        <PackSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          packs={wallet.packs}
          shortfall={short && price !== undefined && balance !== undefined ? { balance, price } : undefined}
        />
      )}
    </section>
  );
}
