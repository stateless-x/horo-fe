'use client';

import { useRef, type KeyboardEvent } from 'react';
import { CurrencyImage } from '@/components/ui/currency-image';
import type { PackId, WalletPackOffer } from '@/lib-packages/shared/types/wallet';
import { BEST_VALUE, UNIT, baht, topupCopy } from './wallet-copy';

interface PackListProps {
  packs: WalletPackOffer[];
  selected: PackId;
  onSelect: (id: PackId) => void;
}

const NEXT_KEYS = ['ArrowDown', 'ArrowRight'];
const PREV_KEYS = ['ArrowUp', 'ArrowLeft'];

/**
 * The มู packs as one radio group: amount, bonus chip, คุ้มสุด on p1000, baht
 * price and a radio mark. Arrow keys move the selection (roving tabindex).
 * No purple text: the mark and the selected edge are fills and borders.
 */
export function PackList({ packs, selected, onSelect }: PackListProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const step = NEXT_KEYS.includes(event.key) ? 1 : PREV_KEYS.includes(event.key) ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + packs.length) % packs.length;
    onSelect(packs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={`แพ็ก${UNIT}`} className="grid gap-2">
      {packs.map((pack, index) => {
        const checked = pack.id === selected;
        return (
          <button
            key={pack.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={topupCopy.packName(pack)}
            tabIndex={checked ? 0 : -1}
            onClick={() => onSelect(pack.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`grid min-h-14 w-full grid-cols-[24px_minmax(0,1fr)_auto_auto] items-center gap-x-2.5 rounded-xl border px-3 py-2.5 text-left transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright ${
              checked ? 'border-accent bg-accent/10 shadow-md shadow-accent/15 dark:shadow-accent/25' : 'border-edge bg-surface hover:border-accent/40 hover:bg-edgeSoft'
            }`}
          >
            <CurrencyImage size={24} />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-heading text-lg font-semibold leading-snug text-ink">
                  <span className="font-mono tabular-nums">{(pack.base + pack.bonus).toLocaleString('th-TH')}</span> {UNIT}
                </span>
                {pack.bonusPercent > 0 && (
                  <span className="rounded-full border border-edge bg-surface2 px-2 py-0.5 font-mono text-xs tabular-nums text-ink">
                    +{pack.bonusPercent}%
                  </span>
                )}
                {pack.id === BEST_VALUE && (
                  <span className="rounded-full bg-accent px-2 py-0.5 font-heading text-xs font-semibold text-accentInk">{topupCopy.bestValue}</span>
                )}
              </span>
            </span>
            <span className="font-heading text-lg font-semibold tabular-nums text-ink">{baht(pack.priceBaht)}</span>
            <span
              aria-hidden="true"
              className={`grid size-5 place-items-center rounded-full border-2 transition-colors ${checked ? 'border-accent' : 'border-edge'}`}
            >
              {checked && <span className="size-2.5 rounded-full bg-accent" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
