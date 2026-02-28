'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Eye, Sparkles, Moon } from 'lucide-react';
import { ClientDate } from '@/components/client-date';
import { ScrollIndicator } from '@/components/ui/scroll-indicator';
import { ElementShowcase } from '@/components/landing/element-showcase';
import { ReadingCategories } from '@/components/landing/reading-categories';
import { SEOSections } from '@/components/seo/seo-sections';

/**
 * Landing Page
 *
 * Narrative scroll experience: Mystery → Intrigue → Understanding → Breadth → Action
 * Returning users with valid session are automatically redirected to dashboard.
 */
export default function LandingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (session && !isPending) {
      router.push('/dashboard');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVideoLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* ===== SECTION 1: Hero — "The Threshold" ===== */}
      <section className="relative min-h-[100dvh] flex items-center justify-center">
        {/* Ambient Video Background */}
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
          <div className="absolute inset-0 bg-gradient-to-b from-voidBlack/80 via-voidBlack/60 to-voidBlack" />
        </div>

        {/* Floating Particles */}
        {!shouldReduceMotion && (
          <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/5 w-1.5 h-1.5 rounded-full bg-amethyst/40 animate-float-1" />
            <div className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full bg-lavenderGlow/30 animate-float-2" />
            <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-amethyst/20 animate-float-3" />
            <div className="absolute top-2/3 right-1/3 w-1 h-1 rounded-full bg-lavenderGlow/25 animate-float-1 [animation-delay:2s]" />
            <div className="absolute top-1/2 left-2/3 w-1.5 h-1.5 rounded-full bg-amethyst/30 animate-float-2 [animation-delay:3s]" />
          </div>
        )}

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-7xl font-heading text-ghostWhite mb-6 tracking-tight">
              เปิดประตูสู่ชะตา
            </h1>

            <p className="text-lg md:text-2xl text-paleOrchid/80 mb-6 font-oracle font-light">
              ดูดวงด้วยศาสตร์จีนโบราณ × โหราศาสตร์ไทย
            </p>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mx-auto mb-10 h-px w-48 bg-gradient-to-r from-transparent via-lavenderGlow/40 to-transparent origin-center"
            />

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/fortune" className="w-full sm:w-auto">
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-10 py-4 bg-royalPurple hover:bg-amethyst text-ghostWhite font-heading text-lg rounded-lg transition-all shadow-lg shadow-royalPurple/50 touch-manipulation"
                >
                  ดูดวงของเจ้า
                </motion.button>
              </Link>

              <Link href="/login" className="w-full sm:w-auto">
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-10 py-4 border-2 border-darkPurple hover:border-amethyst text-ghostWhite font-heading text-lg rounded-lg transition-all touch-manipulation"
                >
                  เข้าสู่ระบบ
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <ScrollIndicator showDelay={1500} />
      </section>

      {/* ===== SECTION 2: Five Elements ===== */}
      <ElementShowcase />

      {/* ===== SECTION 3: Daily Oracle ===== */}
      <section className="py-20 px-6 bg-deepNight/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <Eye className="w-8 h-8 text-lavenderGlow/60 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-heading text-ghostWhite mb-4">
              คำทำนายประจำวัน
            </h2>
            <p className="text-ashGray font-oracle">
              <ClientDate />
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative group"
          >
            {/* Ambient glow */}
            <div className="absolute inset-0 rounded-2xl blur-2xl opacity-15 bg-royalPurple/30 -z-10" />

            <div
              className="relative rounded-2xl p-6 md:p-10 overflow-hidden border border-white/10 transition-all duration-300 active:scale-[0.98] md:hover:scale-[1.01]"
              style={{
                background: 'linear-gradient(135deg, rgba(161,106,203,0.05), rgba(15, 10, 26, 0.8))',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Decorative side lines */}
              <div className="absolute left-0 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-amethyst/20 to-transparent" />
              <div className="absolute right-0 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-amethyst/20 to-transparent" />

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

      {/* ===== SECTION 4: Two Ancient Systems ===== */}
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

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 relative">
            {/* Bazi */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute inset-0 rounded-2xl blur-2xl opacity-15 bg-amethyst/30 -z-10" />

              <div
                className="relative rounded-2xl p-6 md:p-8 overflow-hidden border border-white/10 transition-all duration-300 active:scale-[0.98] md:hover:scale-[1.02] md:hover:-translate-y-1 h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(161,106,203,0.05), rgba(15, 10, 26, 0.8))',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
              >
                {/* Watermark */}
                <span className="absolute top-4 right-4 text-5xl font-heading text-white/[0.03] pointer-events-none select-none">
                  命
                </span>

                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-2xl opacity-10 bg-amethyst" />

                <Sparkles className="w-6 h-6 text-amethyst/70 mb-4 relative z-10" />
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

            {/* Connector — desktop only */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <span className="text-amethyst/40 text-2xl font-heading">×</span>
            </motion.div>

            {/* Divider — mobile only */}
            <div className="md:hidden h-px bg-gradient-to-r from-transparent via-darkPurple/50 to-transparent" />

            {/* Thai Astrology */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute inset-0 rounded-2xl blur-2xl opacity-15 bg-royalPurple/30 -z-10" />

              <div
                className="relative rounded-2xl p-6 md:p-8 overflow-hidden border border-white/10 transition-all duration-300 active:scale-[0.98] md:hover:scale-[1.02] md:hover:-translate-y-1 h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(161,106,203,0.05), rgba(15, 10, 26, 0.8))',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
              >
                {/* Watermark */}
                <span className="absolute top-4 right-4 text-5xl font-heading text-white/[0.03] pointer-events-none select-none">
                  ๙
                </span>

                <div className="absolute -top-16 -left-16 w-32 h-32 rounded-full blur-2xl opacity-10 bg-royalPurple" />

                <Moon className="w-6 h-6 text-amethyst/70 mb-4 relative z-10" />
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

      {/* ===== SECTION 5: Six Readings ===== */}
      <ReadingCategories />

      {/* ===== SECTION 6: Final CTA — "The Invitation" ===== */}
      <section className="py-24 px-6 text-center relative">
        {/* Top divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-royalPurple/30 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-heading text-ghostWhite mb-4">
            พร้อมที่จะรู้จักชะตาของเจ้าหรือยัง
          </h2>
          <p className="text-ashGray font-oracle mb-10">
            ไม่เสียค่าใช้จ่าย ใช้เวลาไม่ถึง 2 นาที
          </p>

          <Link href="/fortune">
            <div className="relative inline-block">
              {/* Glow pulse behind button */}
              <div className="absolute inset-0 bg-royalPurple rounded-lg blur-xl animate-ctaGlow" />
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-14 py-5 bg-royalPurple hover:bg-amethyst text-ghostWhite font-heading text-xl rounded-lg transition-all shadow-xl shadow-royalPurple/50 touch-manipulation"
              >
                เริ่มดูดวงเลย
              </motion.button>
            </div>
          </Link>

          <p className="text-ashGray/60 text-sm font-oracle mt-6">
            ดูดวงด้วย Bazi × โหราศาสตร์ไทย
          </p>
        </motion.div>
      </section>

      {/* ===== SEO Content — collapsed, crawlable ===== */}
      <SEOSections />
    </div>
  );
}
