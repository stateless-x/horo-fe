'use client';

import { motion } from 'framer-motion';

export type FortuneTab = 'fortune' | 'pillars' | 'recommendations';

interface FortuneTabBarProps {
  activeTab: FortuneTab;
  onTabChange: (tab: FortuneTab) => void;
}

interface Tab {
  key: FortuneTab;
  label: string;
}

const TABS: Tab[] = [
  { key: 'fortune', label: 'ดวงชะตา' },
  { key: 'pillars', label: 'เสาชะตา' },
  { key: 'recommendations', label: 'คำแนะนำ' },
];

export function FortuneTabBar({ activeTab, onTabChange }: FortuneTabBarProps) {
  return (
    <div className="sticky top-0 z-30 bg-voidBlack/90 backdrop-blur-lg border-b border-darkPurple/50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className="flex-1 relative py-4 px-4 transition-colors duration-200"
              >
                {/* Tab label */}
                <span
                  className={`font-heading font-medium text-sm md:text-base transition-colors duration-200 ${
                    isActive ? 'text-amethyst' : 'text-ashGray'
                  }`}
                >
                  {tab.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amethyst"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
