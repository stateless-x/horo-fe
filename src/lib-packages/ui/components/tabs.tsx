'use client';

import { useState, createContext, useContext, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

// ---- Context ----

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

// ---- Types ----

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
  onChange?: (value: string) => void;
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

// ---- Components ----

/**
 * Root Tabs container - manages active tab state
 */
export function Tabs({ defaultValue, children, className, onChange }: TabsProps) {
  const [activeTab, setActiveTabState] = useState(defaultValue);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    onChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

/**
 * Tab triggers container - horizontal scrollable on mobile
 */
export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        'flex gap-1 p-1 bg-deepNight/80 backdrop-blur-sm rounded-xl border border-darkPurple/30 sticky top-0 z-10',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Individual tab trigger button
 */
export function TabsTrigger({ value, children, className, icon }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        'relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-heading text-sm transition-colors',
        isActive
          ? 'text-ghostWhite'
          : 'text-ashGray hover:text-ghostWhite/80',
        className
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-royalPurple/40 rounded-lg border border-royalPurple/30"
          transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {icon}
        {children}
      </span>
    </button>
  );
}

/**
 * Tab content panel - only renders when active
 */
export function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('mt-4', className)}
    >
      {children}
    </motion.div>
  );
}
