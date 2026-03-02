'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Check } from 'lucide-react';
import {
  generateShareText,
  generateCompatibilityShareText,
  getShareUrl,
  getLineDeepLink,
  isMobile,
  trackShareEvent,
  type ShareData,
  type CompatibilityShareData,
  type SharePlatform,
} from '@/lib/share-utils';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  shareData?: ShareData;
  compatibilityData?: CompatibilityShareData;
  title?: string;
}

interface PlatformButtonProps {
  platform: SharePlatform;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

function PlatformButton({
  platform,
  label,
  icon,
  color,
  onClick,
}: PlatformButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 bg-charcoal border border-darkPurple/50 rounded-xl p-4 transition-all duration-200 hover:border-royalPurple/50 hover:bg-darkPurple/20"
      style={{ minWidth: '80px', minHeight: '80px' }}
    >
      <div
        className="w-8 h-8 flex items-center justify-center"
        style={{ color }}
      >
        {icon}
      </div>
      <span className="font-thai text-xs text-ashGray">{label}</span>
    </button>
  );
}

export function ShareSheet({ isOpen, onClose, shareData, compatibilityData, title }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const shareUrl = shareData?.url || compatibilityData?.url || '';
  const shareType = compatibilityData ? 'compatibility' : 'fortune';

  const handleShare = (platform: SharePlatform) => {
    if (platform === 'copy') {
      // Copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        trackShareEvent('copy', shareType);
        setTimeout(() => setCopied(false), 2000);
      });
      return;
    }

    // For LINE on mobile, use deep link with URL in text
    if (platform === 'line' && isMobile()) {
      // Generate text with URL for mobile deep link
      const textWithUrl = compatibilityData
        ? `${generateCompatibilityShareText(platform, compatibilityData)}\n${shareUrl}`
        : shareData
          ? `${generateShareText(platform, shareData)}\n\nดูดวงของเจ้าได้ที่ ${shareUrl}`
          : '';

      const deepLink = getLineDeepLink(textWithUrl);
      window.location.href = deepLink;
      trackShareEvent('line', shareType);
      onClose();
      return;
    }

    // For other platforms or LINE on desktop, use platform share URL
    const text = compatibilityData
      ? generateCompatibilityShareText(platform, compatibilityData)
      : shareData
        ? generateShareText(platform, shareData)
        : '';

    const platformShareUrl = getShareUrl(platform, text, shareUrl);
    window.open(platformShareUrl, '_blank', 'width=600,height=400');
    trackShareEvent(platform, shareType);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-voidBlack/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Bottom sheet (mobile) / Modal (desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:w-full z-50"
          >
            <div className="bg-deepNight border-t border-darkPurple/50 md:border md:rounded-2xl rounded-t-3xl md:rounded-b-2xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-lg font-medium text-ghostWhite">
                  {title || (compatibilityData ? 'แชร์ผลดวงความสัมพันธ์' : 'แชร์ดวงชะตาของเจ้า')}
                </h3>
                <button
                  onClick={onClose}
                  className="text-ashGray hover:text-ghostWhite transition-colors"
                  aria-label="ปิด"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Platform buttons */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <PlatformButton
                  platform="line"
                  label="LINE"
                  color="#00B900"
                  onClick={() => handleShare('line')}
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8"
                    >
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                    </svg>
                  }
                />

                <PlatformButton
                  platform="facebook"
                  label="Facebook"
                  color="#1877F2"
                  onClick={() => handleShare('facebook')}
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  }
                />

                <PlatformButton
                  platform="twitter"
                  label="X"
                  color="#FFFFFF"
                  onClick={() => handleShare('twitter')}
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  }
                />
              </div>

              {/* Copy link button */}
              <button
                onClick={() => handleShare('copy')}
                className="w-full bg-charcoal border border-darkPurple/50 rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all duration-200 hover:border-royalPurple/50 hover:bg-darkPurple/20 mb-3"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span className="font-heading font-medium text-base text-emerald-400">
                      คัดลอกแล้ว!
                    </span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-5 h-5 text-ghostWhite" />
                    <span className="font-heading font-medium text-base text-ghostWhite">
                      คัดลอกลิงก์
                    </span>
                  </>
                )}
              </button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
