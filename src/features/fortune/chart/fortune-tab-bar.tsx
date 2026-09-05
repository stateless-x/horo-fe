'use client';

export type FortuneTab = 'overview' | 'readings' | 'details';

interface FortuneTabBarProps {
  activeTab: FortuneTab;
  onTabChange: (tab: FortuneTab) => void;
}

interface Tab {
  key: FortuneTab;
  label: string;
}

const TABS: Tab[] = [
  { key: 'overview', label: 'สรุป' },
  { key: 'readings', label: 'อ่าน 6 ด้าน' },
  { key: 'details', label: 'ที่มาของดวง' },
];

/** Shared with the panels in the fortune page so aria wiring points both ways. */
export function fortuneTabId(key: FortuneTab) {
  return `fortune-tab-${key}`;
}

export function FortuneTabBar({ activeTab, onTabChange }: FortuneTabBarProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = TABS.length - 1;
    else return;

    event.preventDefault();
    onTabChange(TABS[nextIndex].key);
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[nextIndex]?.focus();
  };

  return (
    // bg-surface (not ground) so the strip reads as a control track rather than
    // dissolving into the page it sits on.
    <nav className="sticky top-14 z-30 border-b border-edge bg-surface/95 backdrop-blur-lg" aria-label="ส่วนของคำทำนาย">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-stretch gap-1 px-1.5" role="tablist" aria-label="เลือกเนื้อหาคำทำนาย">
          {TABS.map((tab, index) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                type="button"
                role="tab"
                key={tab.key}
                id={fortuneTabId(tab.key)}
                onClick={() => onTabChange(tab.key)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                aria-selected={isActive}
                aria-controls={`fortune-panel-${tab.key}`}
                tabIndex={isActive ? 0 : -1}
                // Underline-active matches AppHeader's nav language directly
                // above it, and frees bg-accent to mean "button" again.
                // pb-* > pt-* keeps the border clear of Thai below-baseline marks.
                className={`relative min-h-11 flex-1 border-b-2 px-2 pt-2.5 pb-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none sm:px-4 ${
                  isActive
                    ? 'border-accent text-ink'
                    : 'border-transparent text-inkMuted hover:bg-edgeSoft hover:text-ink'
                }`}
              >
                {/* Weight carries state alongside color, so selection survives
                    in grayscale and for low-vision users (WCAG 1.4.1). */}
                <span className={`font-heading text-sm sm:text-base ${isActive ? 'font-semibold' : 'font-normal'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
