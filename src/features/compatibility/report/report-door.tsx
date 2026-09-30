'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, CalendarDays, ChevronDown, History, ListChecks, Loader2, Sparkles, type LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/lib-packages/ui';
import { FailureNotice, failureReference } from '@/components/ui/failure-notice';
import { CurrencyImage } from '@/components/ui/currency-image';
import type { ApiError } from '@/lib/api';
import { INSUFFICIENT_BALANCE } from '@/lib-packages/shared/types/wallet';
import type { RelationshipType } from '@/lib-packages/shared';
import { PackSheet } from '@/features/wallet/pack-sheet';
import { SpendConfirmSheet } from '@/features/wallet/spend-confirm-sheet';
import { WALLET_QUERY_KEY, enabledWallet, useWallet } from '@/features/wallet/use-wallet';
import { baht, doorPacks, units } from '@/features/wallet/wallet-copy';
import { spaceLatinName } from '@/lib-packages/shared/types/names';
import { BOUND_FRAME, MiniSeal, REPORT_CARD } from './report-kit';
import { lockedPreviewCopy, relationshipReportCopy, type ReportSectionId } from './report-copy';
import { relationshipReportVisuals } from './report-visuals';
import { unlockPresentation } from './unlock-presentation';

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

/** Owner copy (2026-09-29), pronoun-free. The server answered with a failure: a failed generation charges nothing. */
export const UNLOCK_FAILED = 'เปิดคำอ่านไม่สำเร็จ มูของคุณยังอยู่ครบ ลองใหม่ได้เลย';
/** The client gave up waiting (api TIMEOUT): the server may still finish and charge, so no charge claim. A reload re-reads the result. */
export const UNLOCK_TIMED_OUT = 'ใช้เวลานานกว่าปกติ คำตอบอาจกำลังเสร็จ ลองรีเฟรชหน้านี้';

type UnlockFailure = 'error' | 'timeout';
const FAILURE_COPY: Record<UnlockFailure, string> = { error: UNLOCK_FAILED, timeout: UNLOCK_TIMED_OUT };
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
  selectedQuestion?: string;
  selectedIntent?: ReportSectionId;
  /**
   * Teaser only: unlocks the report, after SpendConfirmSheet when it spends มู from balance. A rejection with HTTP 402
   * `insufficient_balance` (the ApiError itself, rethrown) turns the button
   * into "เติมมู"; a TIMEOUT shows the timeout copy; any other rejection
   * shows UNLOCK_FAILED with the body's `reference` (else `unlockRef`).
   */
  onUnlock?: () => void | Promise<void>;
}

/**
 * ReportDoor: the locked panel that becomes the report's front page. Locked,
 * it reflects the reader's chosen question, relationship-specific value, and
 * clear unlock state; open, it becomes the detailed table of contents.
 */
export function ReportDoor({ partnerName, relationshipType, readingMinutes, contents, full, unlockRef, onJump, allOpen, onToggleAll, onUnlock, selectedQuestion, selectedIntent }: ReportDoorProps) {
  const reduce = useReducedMotion();
  const queryClient = useQueryClient();
  const walletQuery = useWallet();
  const wallet = enabledWallet(walletQuery.data);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<UnlockFailure | null>(null);
  /** The server's reference for this failure, else the row id; none when neither exists. */
  const [failedRef, setFailedRef] = useState<string | undefined>();
  /** Bumped per failure so a repeat failure shows the toast again. */
  const [toast, setToast] = useState(0);
  const [insufficient, setInsufficient] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const price = wallet?.prices.compat_unlock;
  const balance = wallet?.balance;
  const preview = lockedPreviewCopy(relationshipType);
  const copy = relationshipReportCopy(relationshipType);
  const visuals = relationshipReportVisuals(relationshipType);
  const romance = !relationshipType || relationshipType === 'romantic' || relationshipType === 'talking';
  const lockedSections = [
    { id: 'overview', title: copy.sections.overview.label, ...preview.sections.overview, art: visuals.overview.dimensions },
    { id: 'people', title: copy.sections.people.label, ...preview.sections.people, art: visuals.sections.people },
    { id: 'conversation', title: copy.sections.conversation.label, ...preview.sections.conversation, art: visuals.sections.conversation },
    { id: 'next', title: copy.sections.next.label, ...preview.sections.next, art: visuals.next.calendar.art },
  ];
  // Short of the price: the primary button buys and unlocks in one flow instead of spending.
  const short = insufficient || (price !== undefined && balance !== undefined && balance < price);
  // The pack the sheet preselects: the smallest that covers the shortfall. Its price is the button's baht.
  const pack = wallet && price !== undefined && balance !== undefined ? doorPacks(wallet.packs, price - balance)[0] : undefined;
  // A spend from balance asks first; with the wallet off (lock off) the unlock is free and opens directly.
  const spends = price !== undefined && balance !== undefined && !short;
  const presentation = unlockPresentation(relationshipType, selectedIntent, busy ? 'generating' : short ? 'short' : 'balance');
  const selectedArt = lockedSections.find((section) => section.id === presentation.artSection)?.art;

  useEffect(() => {
    if (!selectedQuestion || full) return;
    headingRef.current?.focus({ preventScroll: true });
  }, [full, selectedQuestion]);

  /**
   * A one-flow order is paid and credited: run the same unlock as the button
   * while the sheet shows a clear credited-and-opening state; the sheet closes once
   * this settles. The backend's own unlock of this row may be running; the
   * unlock route joins it and charges the row once.
   */
  const unlockAfterPayment = async () => {
    setInsufficient(false);
    await queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
    await unlock();
  };

  const unlock = async () => {
    if (!onUnlock || busy) return;
    setBusy(true);
    setFailed(null);
    try {
      await onUnlock();
    } catch (failure) {
      const refused = failure as ApiError;
      if (refused.status === 402 && refused.body?.error === INSUFFICIENT_BALANCE) {
        // The balance changed since it was read: offer the purchase, which unlocks after paying.
        setInsufficient(true);
      } else {
        // A server failure charges nothing (horo-be docs/wallet.md, "The ดวงคู่ unlock"); a client
        // timeout (lib/api: code TIMEOUT, status 408) says nothing about the server's outcome.
        console.error('Unlock failed:', failure);
        setFailed(refused.code === 'TIMEOUT' || refused.status === 408 ? 'timeout' : 'error');
        setFailedRef(failureReference(failure) ?? unlockRef);
        setToast((count) => count + 1);
      }
    } finally {
      setBusy(false);
      // A spend (or a refused one) changes what the balance chip and this button show.
      await queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
    }
  };

  return (
    <section
      aria-labelledby="report-door"
      id="report-unlock-section"
      className={
        full
          ? `${REPORT_CARD} px-5 pb-5 pt-[22px] sm:px-7 sm:pb-6 sm:pt-[26px] ${BOUND_FRAME}`
          : `scroll-mt-20 rounded-2xl border bg-surface px-5 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-7 ${romance ? 'border-romance/25' : 'border-edge'} ${BOUND_FRAME}`
      }
    >
      <div className={full ? 'flex items-center gap-3' : undefined}>
        {full && (
          <span className="grid size-10 shrink-0 place-items-center text-ink">
            <MiniSeal />
          </span>
        )}
        <h2 ref={headingRef} id="report-door" tabIndex={-1} className="text-balance font-heading text-2xl font-semibold leading-snug text-ink [overflow-wrap:anywhere] focus:outline-none">
          {spaceLatinName(`${full ? 'คำตอบ' : 'ฉบับเต็ม'}ของคุณกับ${partnerName}`, partnerName)}
        </h2>
      </div>
      <p className="mt-2.5 text-base leading-relaxed text-inkMuted">
        {full ? (
          <>อ่านราว <b className="font-semibold text-ink">{readingMinutes} นาที</b> แบ่งเป็น 4 ส่วน พร้อมปฏิทิน 3 เดือนและแนวทางไปต่อ</>
        ) : null}
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
      ) : null}

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
            <div className="pt-5">
              {selectedQuestion && (
                <div className="border-y border-edge py-3.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-inkMuted">อยากเข้าใจเรื่องนี้ต่อ</p>
                  <p className="mt-1.5 font-heading text-base font-semibold leading-snug text-ink">{selectedQuestion}</p>
                </div>
              )}
              <div className="mt-5 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-pretty font-heading text-xl font-semibold leading-snug text-ink">{presentation.headline}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-inkMuted">{presentation.support}</p>
                </div>
                {selectedArt && <Image alt="" src={selectedArt} width={112} height={112} sizes="64px" className="size-16 shrink-0 object-contain" />}
              </div>
              <ul className="mt-4 space-y-2.5" aria-label="สิ่งที่จะได้จากคำตอบฉบับเต็ม">
                {presentation.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-2.5 text-sm leading-relaxed text-inkMuted">
                    <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-romance" aria-hidden="true" />
                    {outcome}
                  </li>
                ))}
              </ul>
              <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-2.5">
              {onUnlock && short && pack && !busy && (
                <Button
                  type="button"
                  size="lg"
                  onClick={() => setSheetOpen(true)}
                  aria-haspopup="dialog"
                  className="h-auto min-h-14 w-full gap-2.5 whitespace-normal px-5 py-3 font-heading"
                >
                  {`เติมมูแล้วเปิดคำอ่านฉบับเต็ม ${baht(pack.priceBaht)}`}
                </Button>
              )}
              {onUnlock && !(short && pack && !busy) && (
                <Button type="button" size="lg" onClick={spends ? () => setConfirmOpen(true) : unlock} aria-haspopup={spends ? 'dialog' : undefined} aria-busy={busy} disabled={busy} className="h-auto min-h-14 w-full gap-2.5 whitespace-normal px-5 py-3 font-heading">
                  {busy ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <CurrencyImage size={24} />}
                  {busy ? 'กำลังเปิดคำอ่าน' : price !== undefined ? `เปิดคำอ่านฉบับเต็มด้วย ${units(price)}` : 'เปิดคำอ่านฉบับเต็ม'}
                </Button>
              )}
              {presentation.status && <p className="px-2 text-center text-sm leading-relaxed text-inkMuted">{presentation.status}</p>}
              {!short && price !== undefined && <p className="px-2 text-center text-sm leading-relaxed text-inkMuted">{units(price)} เท่ากับ {baht(price)}</p>}
              <p className="px-2 text-center text-sm leading-relaxed text-inkMuted">เปิดครั้งเดียว กลับมาอ่านได้ตลอด</p>
              <p aria-live="polite" className="empty:hidden text-sm leading-relaxed text-inkMuted">
                {busy ? 'เสร็จแล้วคำตอบจะเปิดตรงนี้เลย ไม่ต้องกดซ้ำ' : ''}
              </p>
              {failed && (
                <FailureNotice message={FAILURE_COPY[failed]} reference={failedRef} toastKey={toast} onToastDismiss={() => setToast(0)} />
              )}
              </div>
              <details className="group mt-5 border-t border-edge pt-3.5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-heading text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright [&::-webkit-details-marker]:hidden">
                  ดูสิ่งที่จะได้อ่าน
                  <ChevronDown className="size-4 text-inkMuted transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                </summary>
                <ul className="mt-2 divide-y divide-edge border-y border-edge" aria-label="ดูว่าแต่ละส่วนในฉบับเต็มมีอะไร">
                  {lockedSections.map(({ id, art, title, subtitle, detail }) => (
                    <li key={id}>
                      <details className="group/section">
                        <summary className="flex min-h-[72px] cursor-pointer list-none items-center gap-3 rounded-lg py-2 transition-colors hover:bg-edgeSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright [&::-webkit-details-marker]:hidden">
                          {art && <Image alt="" src={art} width={96} height={96} sizes="56px" className="size-14 shrink-0 object-contain" />}
                          <span className="min-w-0 flex-1">
                            <span className="block font-heading text-sm font-semibold leading-snug text-ink">{title}</span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-inkMuted">{subtitle}</span>
                          </span>
                          <ChevronDown className="mr-1 size-4 shrink-0 text-inkMuted transition-transform group-open/section:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                        </summary>
                        <p className="px-1 pb-4 pt-1 text-pretty text-sm leading-7 text-inkMuted">{detail}</p>
                      </details>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {spends && (
        <SpendConfirmSheet
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          price={price}
          balance={balance}
          purpose={spaceLatinName(`เปิดคำอ่านฉบับเต็มของคุณกับ${partnerName} อ่านซ้ำได้ตลอด`, partnerName)}
          onConfirm={unlock}
        />
      )}
      {wallet && price !== undefined && (
        <PackSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          wallet={wallet}
          context={{ kind: 'door', price, unlockRef }}
          onPaid={unlockAfterPayment}
        />
      )}
    </section>
  );
}
