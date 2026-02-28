'use client';

import { Share2, RefreshCw } from 'lucide-react';

interface StickyActionBarProps {
  onShare: () => void;
  onNewReading: () => void;
}

export function StickyActionBar({ onShare, onNewReading }: StickyActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-voidBlack/80 backdrop-blur-lg border-t border-darkPurple/50 px-4 py-3 pb-[env(safe-area-inset-bottom)] z-40">
      <div className="max-w-4xl mx-auto flex gap-3">
        {/* Share button - PRIMARY (60% width) */}
        <button
          onClick={onShare}
          className="flex-[3] bg-amethyst hover:bg-royalPurple text-ghostWhite font-heading font-medium rounded-xl px-6 py-3 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Share2 className="w-[18px] h-[18px]" />
          <span>แชร์ดวงชะตา</span>
        </button>

        {/* New reading button - SECONDARY (40% width) */}
        <button
          onClick={onNewReading}
          className="flex-[2] bg-transparent border border-amethyst/50 text-amethyst hover:bg-amethyst/10 font-heading font-medium rounded-xl px-6 py-3 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-[18px] h-[18px]" />
          <span className="hidden sm:inline">สร้างดวงใหม่</span>
          <span className="sm:hidden">ดวงใหม่</span>
        </button>
      </div>
    </div>
  );
}
