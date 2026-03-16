'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';

const CONSENT_KEY = 'horo-cookie-consent';

interface CookiePreferences {
  necessary: boolean; // always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
}

function getStoredPreferences(): CookiePreferences | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    const stored = getStoredPreferences();
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const save = useCallback((prefs: CookiePreferences) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    setVisible(false);
  }, []);

  function acceptAll() {
    save({ necessary: true, analytics: true, marketing: true });
  }

  function dismiss() {
    // Close without saving — banner will reappear on next page load
    setVisible(false);
  }

  function saveSettings() {
    save({ ...preferences, necessary: true });
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop overlay for settings panel */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60"
              onClick={() => setShowSettings(false)}
            />
          )}

          {/* Settings modal (centered) */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[70] flex items-center justify-center p-4"
              >
                <div
                  className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(15, 10, 26, 0.98), rgba(10, 10, 15, 0.99))',
                    backdropFilter: 'blur(20px)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="px-5 pt-5 pb-3">
                    <h3 className="text-base font-heading text-ghostWhite">
                      ตั้งค่าคุกกี้
                    </h3>
                    <p className="text-xs text-ashGray font-oracle mt-1 leading-relaxed">
                      เลือกประเภทคุกกี้ที่คุณต้องการอนุญาต
                    </p>
                  </div>

                  {/* Cookie categories */}
                  <div className="px-5 pb-2 space-y-3">
                    {/* Necessary */}
                    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-heading text-ghostWhite">
                          คุกกี้ที่จำเป็น
                        </p>
                        <p className="text-xs text-ashGray font-oracle mt-0.5 leading-relaxed">
                          จำเป็นสำหรับการทำงานของเว็บไซต์ เช่น การเข้าสู่ระบบ
                        </p>
                      </div>
                      <div className="flex-shrink-0 pt-0.5">
                        <div className="relative w-10 h-[22px] rounded-full bg-royalPurple cursor-not-allowed opacity-60">
                          <div className="absolute right-0.5 top-0.5 w-[18px] h-[18px] rounded-full bg-ghostWhite shadow-sm" />
                        </div>
                        <p className="text-[10px] text-ashGray/60 font-oracle text-center mt-1">
                          เปิดเสมอ
                        </p>
                      </div>
                    </div>

                    {/* Analytics */}
                    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-heading text-ghostWhite">
                          คุกกี้วิเคราะห์
                        </p>
                        <p className="text-xs text-ashGray font-oracle mt-0.5 leading-relaxed">
                          ช่วยให้เราเข้าใจการใช้งานเว็บไซต์และปรับปรุงประสบการณ์
                        </p>
                      </div>
                      <div className="flex-shrink-0 pt-0.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={preferences.analytics}
                          onClick={() =>
                            setPreferences((p) => ({
                              ...p,
                              analytics: !p.analytics,
                            }))
                          }
                          className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${
                            preferences.analytics
                              ? 'bg-royalPurple'
                              : 'bg-white/10'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-ghostWhite shadow-sm transition-all duration-200 ${
                              preferences.analytics ? 'right-0.5' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Marketing */}
                    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-heading text-ghostWhite">
                          คุกกี้การตลาด
                        </p>
                        <p className="text-xs text-ashGray font-oracle mt-0.5 leading-relaxed">
                          ใช้สำหรับแสดงโฆษณาที่เกี่ยวข้องและวัดผลแคมเปญ
                        </p>
                      </div>
                      <div className="flex-shrink-0 pt-0.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={preferences.marketing}
                          onClick={() =>
                            setPreferences((p) => ({
                              ...p,
                              marketing: !p.marketing,
                            }))
                          }
                          className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${
                            preferences.marketing
                              ? 'bg-royalPurple'
                              : 'bg-white/10'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-ghostWhite shadow-sm transition-all duration-200 ${
                              preferences.marketing ? 'right-0.5' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-5 py-4 flex gap-2">
                    <button
                      onClick={acceptAll}
                      className="flex-1 px-4 py-2.5 bg-royalPurple hover:bg-amethyst text-ghostWhite text-sm font-heading rounded-lg transition-colors"
                    >
                      ยอมรับทั้งหมด
                    </button>
                    <button
                      onClick={saveSettings}
                      className="flex-1 px-4 py-2.5 border border-white/15 hover:border-white/30 text-ghostWhite text-sm font-heading rounded-lg transition-colors"
                    >
                      บันทึกการตั้งค่า
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom banner */}
          {!showSettings && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50"
            >
              <div
                className="border-t border-white/10 px-4 py-4 md:py-5 shadow-[0_-8px_30px_rgba(0,0,0,0.4)]"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(15, 10, 26, 0.97), rgba(10, 10, 15, 0.99))',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center gap-3 md:gap-6 relative">
                  {/* Close button (dismiss without saving — reappears on refresh) */}
                  <button
                    onClick={dismiss}
                    className="absolute -top-1 right-0 md:relative md:top-auto md:right-auto md:order-last p-1.5 text-ashGray/60 hover:text-ghostWhite transition-colors rounded-lg"
                    aria-label="ปิด"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Text */}
                  <p className="text-sm text-ghostWhite/80 font-oracle leading-relaxed flex-1 pr-8 md:pr-0">
                    เราใช้คุกกี้เพื่อพัฒนาประสบการณ์การใช้งานของคุณ{' '}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="text-amethyst hover:text-lavenderGlow underline underline-offset-2 transition-colors"
                    >
                      นโยบายความเป็นส่วนตัว
                    </Link>
                  </p>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={acceptAll}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-royalPurple hover:bg-amethyst text-ghostWhite text-sm font-heading rounded-lg transition-colors whitespace-nowrap"
                    >
                      ยอมรับทั้งหมด
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="flex-1 md:flex-none px-5 py-2.5 border border-white/15 hover:border-white/30 text-ghostWhite text-sm font-heading rounded-lg transition-colors whitespace-nowrap"
                    >
                      ตั้งค่า
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
