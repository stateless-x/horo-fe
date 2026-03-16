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
    <div className="sticky top-0 z-30 bg-deepNight/95 backdrop-blur-lg border-b border-darkPurple">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-royalPurple/50 to-transparent" />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center py-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`flex-1 relative py-3 px-4 transition-all duration-200 rounded-lg mx-1 ${
                  isActive
                    ? 'bg-royalPurple/15'
                    : 'hover:bg-darkPurple/30'
                }`}
              >
                {/* Tab label */}
                <span
                  className={`font-heading text-base transition-colors duration-200 ${
                    isActive
                      ? 'text-lavenderGlow font-semibold'
                      : 'text-ashGray font-medium hover:text-paleOrchid'
                  }`}
                >
                  {tab.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-gradient-to-r from-amethyst to-lavenderGlow shadow-[0_0_8px_rgba(168,85,247,0.4)]"
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
