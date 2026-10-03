'use client';

import { useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { useHorizontalDragScroll } from './use-horizontal-drag-scroll';

/**
 * Purple owns report structure. Pink is reserved for romantic / talking
 * relationships, where the choice concerns the connection itself. Success and
 * warning stay available to describe outcomes elsewhere in the report, but are
 * deliberately not used as decorative route colors here.
 */
export type ActionTone = 'accent' | 'romance';

export interface SectionAction {
  id: string;
  tag: string;
  title: string;
  detail: string;
  icon: LucideIcon;
  tone: ActionTone;
  /** Optional clay cue. It reinforces the choice without replacing its label. */
  art?: string;
}

interface SectionActionMapProps {
  title: string;
  helper: string;
  actions: SectionAction[];
  onChoose: (id: string) => void;
}

const TONE_CLASSES: Record<ActionTone, { chip: string; icon: string; card: string }> = {
  accent: {
    chip: 'text-accent',
    icon: 'bg-accent/10 text-accent',
    card: 'hover:border-accent/30 hover:bg-surface2/70 hover:shadow-[0_12px_24px_rgba(107,33,168,0.09)]',
  },
  romance: {
    chip: 'text-romanceText',
    icon: 'bg-romance/10 text-romanceText',
    card: 'hover:border-romance/35 hover:bg-romance/[0.045] hover:shadow-[0_12px_24px_rgba(232,93,117,0.1)]',
  },
};

/** A lightweight decision point at the start of each report tab. It always scrolls to real reading content. */
export function SectionActionMap({ title, helper, actions, onChoose }: SectionActionMapProps) {
  const hasThreeActions = actions.length === 3;
  const actionRailRef = useRef<HTMLDivElement>(null);
  const actionRailDrag = useHorizontalDragScroll(actionRailRef);

  return (
    <section aria-labelledby={`action-map-${title}`} className="border-y border-edge py-4 sm:py-5">
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <h3 id={`action-map-${title}`} className="font-heading text-lg font-semibold leading-snug text-ink">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-inkMuted sm:shrink-0 sm:text-xs">{helper}</p>
      </div>
      <div
        ref={hasThreeActions ? actionRailRef : undefined}
        {...(hasThreeActions ? actionRailDrag : {})}
        className={`mt-3 gap-3 sm:gap-4 ${hasThreeActions ? 'flex snap-x snap-mandatory cursor-grab overflow-x-auto overscroll-x-contain pr-5 active:cursor-grabbing [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:cursor-default sm:overflow-visible sm:pr-0 sm:snap-none' : 'grid grid-cols-2'}`}
      >
        {actions.map((action) => {
          const Icon = action.icon;
          const tone = TONE_CLASSES[action.tone];
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onChoose(action.id)}
              className={`group min-h-[140px] rounded-2xl border border-edge bg-surface px-3 py-3.5 text-left transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright active:translate-y-0 sm:min-h-[152px] sm:px-4 ${tone.card} ${hasThreeActions ? 'w-[calc((100vw-78px)/2)] min-w-[144px] shrink-0 snap-start sm:min-w-0 sm:w-auto' : ''}`}
            >
              <span className="flex items-start justify-between gap-3">
                <span className={`grid size-8 shrink-0 place-items-center rounded-xl ${tone.icon}`}>
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {action.art && (
                  <Image
                    alt=""
                    width={96}
                    height={96}
                    src={action.art}
                    sizes="(min-width: 720px) 64px, 56px"
                    className="size-14 shrink-0 object-contain sm:size-16"
                  />
                )}
              </span>
              <span className={`mt-3 block font-heading text-xs font-semibold ${tone.chip}`}>{action.tag}</span>
              <span className="mt-1.5 block text-balance font-heading text-base font-semibold leading-snug text-ink sm:text-lg">
                {action.title}
              </span>
              <span className="mt-1 block max-w-[24ch] text-sm leading-relaxed text-inkMuted">
                {action.detail}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
