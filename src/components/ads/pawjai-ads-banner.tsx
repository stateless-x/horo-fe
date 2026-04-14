'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ExternalLink } from 'lucide-react';

const PAWJAI_URL = 'https://pawjai.co';
const BANNER_IMAGE_CDN = 'https://pawjai.b-cdn.net/ads/pawjai-ads/pawjai-banner.webp';
const BANNER_IMAGE_FALLBACK = '/pawjai-banner.webp';
const PROMO_CODE = 'PAWJAI35';

export function PawjaiAdsBanner() {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.2,
      }}
      className="max-w-4xl mx-auto px-4 mt-8 mb-4"
    >
      <p className="font-thai text-xs text-ashGray/60 text-center mb-2">
        โฆษณา
      </p>

      <div className="bg-deepNight border border-darkPurple/50 rounded-2xl p-4 space-y-3">
        {/* Banner Image */}
        <a
          href={PAWJAI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl overflow-hidden hover:opacity-95 transition-opacity duration-200"
        >
          <img
            src={BANNER_IMAGE_CDN}
            alt="Pawjai.co - บริการลงโฆษณา"
            className="w-full h-auto"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = BANNER_IMAGE_FALLBACK;
            }}
          />
        </a>
      </div>
    </motion.div>
  );
}
