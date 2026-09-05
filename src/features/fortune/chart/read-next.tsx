'use client';

import Link from 'next/link';
import { ArrowRight, Heart, Map, Sparkles, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FortuneTab } from '@/features/fortune/chart/fortune-tab-bar';

interface ReadNextTabItem {
  type: 'tab';
  tab: FortuneTab;
  icon: LucideIcon;
  isLove?: boolean;
  heading: string;
  reason: string;
  cta: string;
}

interface ReadNextLinkItem {
  type: 'link';
  href: string;
  icon: LucideIcon;
  isLove?: boolean;
  heading: string;
  reason: string;
  cta: string;
}

type ReadNextItem = ReadNextTabItem | ReadNextLinkItem;

interface ReadNextProps {
  items: ReadNextItem[];
  onTabChange: (tab: FortuneTab) => void;
}

/**
 * A small, restrained "read next" block at the end of a fortune tab panel.
 * Never more than two items and never a menu — each item ties directly to
 * what was just read, with its own one-line reason in the oracle's เจ้า
 * voice. Tab items call back into the page's own handleTabChange so the
 * scroll-to-top behavior on switch stays in one place; link items are plain
 * Link/anchor, no nested interactive elements.
 */
export function ReadNext({ items, onTabChange }: ReadNextProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="read-next-title" className="border-t border-edge pt-8">
      <h2 id="read-next-title" className="font-heading text-lg font-semibold text-ink">อ่านต่อจากนี้</h2>
      <div className={`mt-4 grid gap-4 ${items.length > 1 ? 'sm:grid-cols-2' : ''}`}>
        {items.map((item) => {
          const Icon = item.icon;
          const iconClass = item.isLove ? 'text-pink-600 dark:text-pink-400' : 'text-accentBright';
          const content = (
            <>
              <Icon className={`size-5 shrink-0 ${iconClass}`} aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-heading text-base font-semibold text-ink">{item.heading}</p>
                <p className="mt-1 font-thai text-sm leading-relaxed text-inkMuted">{item.reason}</p>
                <span className="mt-3 inline-flex min-h-11 items-center gap-1 font-heading text-sm text-accentBright">
                  {item.cta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </div>
            </>
          );
          const cardClass =
            'flex items-start gap-3 rounded-2xl border border-edge bg-surface p-5 text-left transition-colors hover:bg-surface2/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright';

          if (item.type === 'link') {
            return (
              <Link key={item.href} href={item.href} className={cardClass}>
                {content}
              </Link>
            );
          }

          return (
            <button key={item.tab} type="button" onClick={() => onTabChange(item.tab)} className={cardClass}>
              {content}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export const READ_NEXT_OVERVIEW: ReadNextItem[] = [
  {
    type: 'tab',
    tab: 'readings',
    icon: Sparkles,
    heading: 'โชค 6 ด้าน',
    reason: 'อยากรู้ลึกกว่าภาพรวม ลองเปิดอ่านทีละด้านที่เจ้าสนใจ',
    cta: 'ดูโชค 6 ด้าน',
  },
  {
    type: 'tab',
    tab: 'details',
    icon: Map,
    heading: 'แผนผังชีวิต',
    reason: 'อยากรู้ว่าคำทำนายเหล่านี้มาจากไหน ดูเสาชะตาและธาตุของเจ้าได้ที่นี่',
    cta: 'ดูแผนผังชีวิต',
  },
];

export const READ_NEXT_READINGS: ReadNextItem[] = [
  {
    type: 'link',
    href: '/dashboard/compatibility',
    icon: Heart,
    isLove: true,
    heading: 'ดูดวงคู่',
    reason: 'อ่านความรักของตัวเองแล้ว ลองดูว่าธาตุของเจ้ากับอีกคนเข้ากันแค่ไหน',
    cta: 'ดูดวงคู่',
  },
  {
    type: 'tab',
    tab: 'details',
    icon: Map,
    heading: 'แผนผังชีวิต',
    reason: 'คำทำนายทั้ง 6 ด้านนี้คำนวณจากเสาชะตาของเจ้า ดูที่มาได้ที่นี่',
    cta: 'ดูแผนผังชีวิต',
  },
];

export const READ_NEXT_DETAILS: ReadNextItem[] = [
  {
    type: 'link',
    href: '/dashboard/today',
    icon: Sun,
    heading: 'ดวงวันนี้',
    reason: 'รู้จักเสาชะตาแล้ว มาดูว่าพลังของวันนี้เป็นยังไงบ้าง',
    cta: 'ดูดวงวันนี้',
  },
  {
    type: 'link',
    href: '/dashboard/compatibility',
    icon: Heart,
    isLove: true,
    heading: 'ดูดวงคู่',
    reason: 'ธาตุและเสาชะตาของเจ้าเข้ากับใครได้ดี ลองส่องดวงคู่ดู',
    cta: 'ดูดวงคู่',
  },
];
