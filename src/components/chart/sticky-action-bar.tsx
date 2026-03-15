'use client';

import { Share2 } from 'lucide-react';

interface StickyActionBarProps {
  onShare: () => void;
}

export function StickyActionBar({ onShare }: StickyActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-voidBlack/80 backdrop-blur-lg border-t border-darkPurple/50 px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] z-40">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onShare}
          className="w-full bg-amethyst hover:bg-lavenderGlow text-voidBlack font-heading font-semibold rounded-xl px-6 py-3 transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-amethyst/30 hover:shadow-lg hover:shadow-lavenderGlow/30"
        >
          <Share2 className="w-[18px] h-[18px]" />
          <span>แชร์ดวงชะตา</span>
        </button>
      </div>
    </div>
  );
}
