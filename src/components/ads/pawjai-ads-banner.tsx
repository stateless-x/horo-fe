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
      initial={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
      className="max-w-4xl mx-auto px-4 mt-8 mb-4"
    >
      <p className="font-thai text-xs text-ashGray/60 text-center mb-2">
        โฆษณา
      </p>

      <div className="bg-deepNight border border-darkPurple/50 rounded-2xl overflow-hidden">
        {/* Banner Image */}
        <a
          href={PAWJAI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full hover:opacity-95 transition-opacity duration-200"
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

        {/* Upsell section */}
        <div className="p-4 space-y-3">
          <p className="font-thai text-sm text-ashGray text-center">
            อัพเกรดเฉลี่ยเดือนละ 50 บาท
          </p>

          {/* Promo code box */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 bg-darkPurple/50 border border-royalPurple/30 rounded-xl px-4 py-2">
              <span className="font-thai text-xs text-ashGray mr-1">ใช้โค้ด</span>
              <span className="font-mono text-sm text-lavenderGlow tracking-wider">
                {PROMO_CODE}
              </span>
              <button
                onClick={handleCopyCode}
                className="text-ashGray hover:text-amethyst transition-colors duration-200 p-1"
                aria-label="คัดลอกโค้ด"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="flex justify-center">
            <a
              href={PAWJAI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-heading text-sm font-medium bg-royalPurple text-ghostWhite px-6 py-2.5 rounded-xl hover:bg-amethyst shadow-md shadow-royalPurple/30 hover:shadow-lg hover:shadow-amethyst/30 transition-all duration-200"
            >
              <span>ดูรายละเอียด</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
