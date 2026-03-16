'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sun, Orbit, Heart, Settings } from 'lucide-react';

interface NavTab {
  key: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_TABS: NavTab[] = [
  { key: 'today', label: 'ดวงวันนี้', href: '/dashboard/today', icon: Sun },
  { key: 'fortune', label: 'ดวงชะตา', href: '/dashboard/fortune', icon: Orbit },
  { key: 'compatibility', label: 'ดวงคู่', href: '/dashboard/compatibility', icon: Heart },
  { key: 'settings', label: 'ตั้งค่า', href: '/dashboard/settings', icon: Settings },
];

export function DashboardNavBar() {
  const pathname = usePathname();

  const activeKey = NAV_TABS.find((tab) => pathname.startsWith(tab.href))?.key ?? 'today';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-deepNight/80 backdrop-blur-lg border-t border-darkPurple/50 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_TABS.map((tab) => {
          const isActive = activeKey === tab.key;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`relative flex flex-col items-center gap-1 py-2.5 px-3 min-w-[64px] transition-colors duration-200 ${
                isActive ? 'text-amethyst' : 'text-ashGray hover:text-paleOrchid'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-heading leading-tight">{tab.label}</span>

              {isActive && (
                <motion.div
                  layoutId="dashboardActiveTab"
                  className="absolute -top-px left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-amethyst to-lavenderGlow shadow-[0_0_6px_rgba(168,85,247,0.4)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
