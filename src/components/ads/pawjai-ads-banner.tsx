'use client';

import { motion } from 'framer-motion';

const PAWJAI_URL = 'https://pawjai.co';
const BANNER_IMAGE_CDN = 'https://pawjai.b-cdn.net/ads/pawjai-ads/pawjai-banner.webp';
const BANNER_IMAGE_FALLBACK = '/pawjai-banner.webp';

export function PawjaiAdsBanner() {
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
      <p className="font-thai text-xs text-inkMuted/60 text-center mb-2">
        ผู้สนับสนุน
      </p>

      <div className="bg-surface border border-surface2/50 rounded-2xl p-4 space-y-3">
        {/* Banner Image */}
        <a
          href={PAWJAI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl overflow-hidden hover:opacity-95 transition-opacity duration-200"
          style={{ aspectRatio: '1336 / 611' }}
        >
          <img
            src={BANNER_IMAGE_CDN}
            alt="Pawjai.co บริการลงโฆษณา"
            width={1336}
            height={611}
            className="w-full h-full object-cover"
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
