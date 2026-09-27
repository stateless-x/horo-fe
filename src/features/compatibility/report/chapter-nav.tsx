'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { EntryMark, type ReportContentsEntry } from './report-door';
import { MiniSeal } from './report-kit';

const HEADER_PX = 56; // AppHeader, h-14
const CHIP_BAR_PX = 48;

interface NavState {
  /** Past the report's front page: the chip bar / rail is shown. */
  visible: boolean;
  active: string;
  /** 0 to 1 through the report body (overview to the plan). */
  progress: number;
}

/** Scroll spy for the report: which entry is being read and how far through the body. */
export function useReportNav(entries: ReportContentsEntry[], doorRef: RefObject<HTMLElement | null>, enabled: boolean): NavState {
  const [state, setState] = useState<NavState>({ visible: false, active: entries[0]?.id ?? '', progress: 0 });
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const door = doorRef.current;
      const first = document.getElementById(entries[0].id);
      const last = document.getElementById(entries[entries.length - 1].id);
      if (!door || !first || !last) return;
      const visible = door.getBoundingClientRect().bottom < HEADER_PX + 8;
      const top = first.getBoundingClientRect().top + window.scrollY;
      const bottom = last.getBoundingClientRect().bottom + window.scrollY;
      const line = window.scrollY + window.innerHeight * 0.35;
      const progress = Math.min(1, Math.max(0, (line - top) / (bottom - top)));
      const probe = HEADER_PX + CHIP_BAR_PX + 40;
      let active = entries[0].id;
      for (const entry of entries) {
        const el = document.getElementById(entry.id);
        if (el && el.getBoundingClientRect().top <= probe) active = entry.id;
      }
      setState((prev) =>
        prev.visible === visible && prev.active === active && Math.abs(prev.progress - progress) < 0.002 ? prev : { visible, active, progress },
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [entries, doorRef, enabled]);
  return state;
}

interface ChapterNavProps {
  entries: ReportContentsEntry[];
  nav: NavState;
  onJump: (id: string) => void;
}

/**
 * ChapterNav on phones and tablets: a chip bar pinned under the app header,
 * with a reading-progress hairline. Hidden until the reader is past the
 * report's front page; the active chip scrolls itself into view.
 */
export function ChapterChips({ entries, nav, onJump }: ChapterNavProps) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!nav.visible || !bar.current) return;
    const chip = bar.current.querySelector<HTMLElement>(`[data-target="${nav.active}"]`);
    if (!chip) return;
    const want = chip.offsetLeft - bar.current.clientWidth / 2 + chip.offsetWidth / 2;
    if (Math.abs(bar.current.scrollLeft - want) > 4) bar.current.scrollTo({ left: want });
  }, [nav.active, nav.visible]);

  return (
    <nav
      aria-label="บทในฉบับเต็ม"
      aria-hidden={!nav.visible}
      className={`fixed inset-x-0 top-14 z-30 border-b border-edge bg-ground/85 backdrop-blur-md transition-[transform,visibility] duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none min-[1120px]:hidden ${nav.visible ? 'visible translate-y-0' : 'invisible -translate-y-[120%]'}`}
    >
      <div ref={bar} className="flex gap-1.5 overflow-x-auto px-4 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {entries.map((entry) => {
          const current = entry.id === nav.active;
          return (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              data-target={entry.id}
              tabIndex={nav.visible ? 0 : -1}
              aria-current={current ? 'true' : undefined}
              onClick={(event) => {
                event.preventDefault();
                onJump(entry.id);
              }}
              className={`relative inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 font-heading text-sm font-medium after:absolute after:inset-x-0 after:-inset-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright ${current ? 'border-accentBright/45 bg-accentBright/10 text-accentBright dark:text-accentSoft' : 'border-edge bg-surface text-inkMuted'}`}
            >
              {entry.n && <span className="font-mono text-xs">{entry.n}</span>}
              {entry.short}
            </a>
          );
        })}
      </div>
      <div className="absolute inset-x-0 -bottom-px h-0.5" aria-hidden="true">
        <span className="block h-full origin-left bg-romance" style={{ transform: `scaleX(${nav.progress})` }} />
      </div>
    </nav>
  );
}

/** ChapterNav on desktop: a side rail beside the report column, with a progress line. */
export function ChapterRail({ entries, nav, onJump, partnerName, readingMinutes }: ChapterNavProps & { partnerName: string; readingMinutes: number }) {
  return (
    <nav
      aria-label="สารบัญฉบับเต็ม"
      aria-hidden={!nav.visible}
      className={`sticky top-[88px] mt-[120px] hidden w-[220px] justify-self-end self-start transition-[opacity,transform,visibility] duration-300 motion-reduce:transition-none min-[1120px]:block ${nav.visible ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-2 opacity-0'}`}
    >
      <div className="flex items-center gap-2.5 border-b border-edge pb-3.5">
        <MiniSeal className="size-[34px] text-accentBright dark:text-accentSoft" />
        <div>
          <b className="block font-heading text-[0.9375rem] font-semibold leading-snug text-ink">ฉบับเต็ม</b>
          <span className="block text-[0.8125rem] leading-snug text-inkMuted">
            คุณกับ{partnerName} · อ่านราว {readingMinutes} นาที
          </span>
        </div>
      </div>
      <ol className="relative mt-3 pl-4">
        <span className="absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-sm bg-edge" aria-hidden="true" />
        <span
          className="absolute left-0 top-1.5 w-0.5 origin-top rounded-sm bg-romance"
          style={{ height: 'calc(100% - 12px)', transform: `scaleY(${nav.progress})` }}
          aria-hidden="true"
        />
        {entries.map((entry) => {
          const current = entry.id === nav.active;
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                data-target={entry.id}
                tabIndex={nav.visible ? 0 : -1}
                aria-current={current ? 'true' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onJump(entry.id);
                }}
                className={`flex min-h-9 items-center gap-2 rounded-md px-2 text-sm leading-snug transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright ${current ? 'font-semibold text-accentBright dark:text-accentSoft' : 'text-inkMuted'}`}
              >
                <span className="grid w-4 place-items-center">
                  <EntryMark entry={entry} />
                </span>
                {entry.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
