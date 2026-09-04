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
    <nav className="sticky top-14 z-30 border-b border-edge bg-ground/95 backdrop-blur-lg" aria-label="ส่วนของคำทำนาย">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-1 p-1.5" role="tablist" aria-label="เลือกเนื้อหาคำทำนาย">
          {TABS.map((tab, index) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                type="button"
                role="tab"
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                aria-selected={isActive}
                aria-controls={`fortune-panel-${tab.key}`}
                tabIndex={isActive ? 0 : -1}
                className={`relative min-h-11 flex-1 rounded-lg px-2 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright sm:px-4 ${
                  isActive
                    ? 'bg-accent text-accentInk'
                    : 'text-inkMuted hover:bg-surface2 hover:text-ink'
                }`}
              >
                <span className="font-heading text-sm font-semibold sm:text-base">
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
