'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { ClientDate } from '@/components/client-date';
import { SEOSections } from '@/components/seo/seo-sections';

/**
 * Landing Page
 *
 * Entry point for new users. Shows what the app does and provides clear CTAs.
 * Returning users with valid session are automatically redirected to dashboard.
 *
 * Performance optimizations:
 * - Lazy loads video after component mount
 * - Respects reduced motion preferences
 * - Auto-stopping animations (no infinite loops)
 * - Mobile-optimized touch interactions
 */
export default function LandingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (session && !isPending) {
      router.push('/dashboard');
    }
  }, [session, isPending, router]);

  // Lazy load video after component mounts
  useEffect(() => {
    // Delay video load to prioritize critical content
    const timer = setTimeout(() => {
      setVideoLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Don't render landing page for authenticated users
  if (session) {
    return null;
  }

  // Animation variants that respect reduced motion preference
  const fadeInUp = shouldReduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 1, y: 0 };
  const fadeInUpInitial = shouldReduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 30 };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Hero Section with Ambient Video */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Ambient Video Background - Lazy loaded for performance */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {videoLoaded && !shouldReduceMotion && (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            >
              <source src="/horo.webm" type="video/webm" />
            </video>
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-voidBlack/80 via-voidBlack/60 to-voidBlack" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-heading text-ghostWhite mb-6 tracking-tight">
              เปิดประตูสู่ชะตา
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-paleOrchid/80 mb-12 font-oracle font-light">
              ดูดวงด้วยศาสตร์จีนโบราณ × โหราศาสตร์ไทย
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Primary CTA */}
              <Link href="/fortune">
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-royalPurple hover:bg-amethyst text-ghostWhite font-heading text-lg rounded-lg transition-all shadow-lg shadow-royalPurple/50 touch-manipulation"
                >
                  ดูดวงของเจ้า
                </motion.button>
              </Link>

              {/* Secondary CTA */}
              <Link href="/login">
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 border-2 border-darkPurple hover:border-amethyst text-ghostWhite font-heading text-lg rounded-lg transition-all touch-manipulation"
                >
                  เข้าสู่ระบบ
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: 3, duration: 1.5, ease: "easeInOut" }}
              className="text-ashGray/60 text-xs flex flex-col items-center gap-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sample Fortune Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading text-ghostWhite mb-4">
              ดวงของเจ้าจะเป็นอย่างไร
            </h2>
            <p className="text-ashGray font-oracle">
              ตัวอย่างดวงที่ผู้ใช้จะได้รับ — ลึกลับและแม่นยำ
            </p>
          </motion.div>

          {/* Blurred Sample Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            {/* Ambient glow */}
            <div className="absolute inset-0 rounded-2xl blur-2xl opacity-20 bg-amethyst/30 -z-10" />

            <div
              className="relative rounded-2xl p-8 md:p-10 overflow-hidden border border-white/10 transition-all duration-300 active:scale-[0.98] md:hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(161,106,203,0.08), rgba(15, 10, 26, 0.8))',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Decorative orbs */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-15 bg-amethyst" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-10 bg-royalPurple" />

              {/* Blur Overlay */}
              <div className="absolute inset-0 backdrop-blur-sm bg-voidBlack/40 z-10 flex items-center justify-center">
                <div className="text-center px-4">
                  <motion.p
                    className="text-paleOrchid text-base md:text-lg mb-4 font-oracle"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    เข้าสู่ระบบเพื่อปลดล็อก
                  </motion.p>
                  <Link href="/fortune">
                    <motion.button
                      whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-royalPurple hover:bg-amethyst text-ghostWhite font-heading rounded-lg transition-all shadow-lg shadow-royalPurple/50 touch-manipulation"
                    >
                      ดูดวงของเจ้า
                    </motion.button>
                  </Link>
                </div>
              </div>

              {/* Sample Content (blurred) */}
              <div className="space-y-6 relative">
                <div className="text-center">
                  <p className="text-sm text-ashGray mb-2">องค์ประกอบหลัก</p>
                  <p className="text-3xl font-heading text-amethyst">ธาตุไฟ</p>
                </div>
                <hr className="border-darkPurple/50" />
                <p className="text-ghostWhite font-oracle leading-relaxed">
                  เจ้าถือกำเนิดในราศีแห่งไฟ มีพลังแห่งการเปลี่ยนแปลงและความหลงใหล
                  ช่วงชีวิตนี้ดวงชะตากำลังเปิดประตูใหม่ให้เจ้า...
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Daily Generic Horoscope */}
      <section className="py-20 px-6 bg-deepNight/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading text-ghostWhite mb-4">
              ดวงประจำวันนี้
            </h2>
            <p className="text-ashGray font-oracle">
              <ClientDate />
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative group"
          >
            {/* Ambient glow */}
            <div className="absolute inset-0 rounded-2xl blur-2xl opacity-15 bg-royalPurple/30 -z-10" />

            <div
              className="relative rounded-2xl p-8 md:p-10 overflow-hidden border border-white/10 transition-all duration-300 active:scale-[0.98] md:hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(161,106,203,0.05), rgba(15, 10, 26, 0.8))',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Decorative orbs */}
              <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-2xl opacity-10 bg-amethyst" />
              <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full blur-2xl opacity-10 bg-royalPurple" />

              <p className="text-ghostWhite font-oracle text-base md:text-lg leading-relaxed mb-6 relative z-10">
                วันนี้ธาตุไฟเด่น คนเกิดวันอังคารและวันเสาร์มีโอกาสดี
                เหมาะกับการเริ่มต้นสิ่งใหม่และการตัดสินใจสำคัญ
                ระวังเรื่องการสื่อสารที่อาจเกิดความเข้าใจผิด
              </p>
              <p className="text-ashGray text-sm font-oracle relative z-10">
                ต้องการดูดวงเฉพาะของเจ้า?{' '}
                <Link
                  href="/fortune"
                  className="text-amethyst hover:text-lavenderGlow underline transition-colors"
                >
                  ดูดวงตอนนี้
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Systems */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading text-ghostWhite text-center mb-16"
          >
            ศาสตร์ที่เราใช้
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Bazi */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              {/* Ambient glow */}
              <div className="absolute inset-0 rounded-2xl blur-2xl opacity-15 bg-amethyst/30 -z-10" />

              <div
                className="relative rounded-2xl p-6 md:p-8 overflow-hidden border border-white/10 transition-all duration-300 active:scale-[0.98] md:hover:scale-[1.02] md:hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, rgba(161,106,203,0.05), rgba(15, 10, 26, 0.8))',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
              >
                {/* Decorative orb */}
                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-2xl opacity-10 bg-amethyst" />

                <h3 className="text-xl md:text-2xl font-heading text-amethyst mb-4 relative z-10">
                  Bazi (四柱命理)
                </h3>
                <p className="text-ghostWhite font-oracle text-sm md:text-base leading-relaxed mb-4 relative z-10">
                  ศาสตร์โหราจีนโบราณที่วิเคราะห์ชะตาชีวิตจากเสาสี่ที่ (ปี เดือน วัน
                  ชั่วโมง) และธาตุทั้งห้า
                </p>
                <p className="text-ashGray text-xs md:text-sm font-oracle relative z-10">
                  จุดเด่น: วิเคราะห์วงจรชีวิต 10 ปี และพลังธาตุในชาติ
                </p>
              </div>
            </motion.div>

            {/* Thai Astrology */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              {/* Ambient glow */}
              <div className="absolute inset-0 rounded-2xl blur-2xl opacity-15 bg-royalPurple/30 -z-10" />

              <div
                className="relative rounded-2xl p-6 md:p-8 overflow-hidden border border-white/10 transition-all duration-300 active:scale-[0.98] md:hover:scale-[1.02] md:hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, rgba(161,106,203,0.05), rgba(15, 10, 26, 0.8))',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
              >
                {/* Decorative orb */}
                <div className="absolute -top-16 -left-16 w-32 h-32 rounded-full blur-2xl opacity-10 bg-royalPurple" />

                <h3 className="text-xl md:text-2xl font-heading text-amethyst mb-4 relative z-10">
                  โหราศาสตร์ไทย
                </h3>
                <p className="text-ghostWhite font-oracle text-sm md:text-base leading-relaxed mb-4 relative z-10">
                  ภูมิปัญญาไทยที่ดูดวงจากวันเกิด นพเคราะห์ และจักรนพคุณ
                  เพื่อดูความสัมพันธ์และโชคลาภ
                </p>
                <p className="text-ashGray text-xs md:text-sm font-oracle relative z-10">
                  จุดเด่น: วิเคราะห์ความสัมพันธ์ โชคลาภ และจังหวะเวลา
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-heading text-ghostWhite mb-6">
            พร้อมที่จะรู้จักชะตาของเจ้าหรือยัง
          </h2>
          <Link href="/fortune">
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-royalPurple hover:bg-amethyst text-ghostWhite font-heading text-xl rounded-lg transition-all shadow-xl shadow-royalPurple/50 touch-manipulation"
            >
              เริ่มดูดวงเลย
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* SEO Content Sections - Server-side rendered for search engines */}
      <SEOSections />
    </div>
  );
}
