'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { ClientDate } from '@/components/client-date';
import { ScrollIndicator } from '@/components/ui/scroll-indicator';
import { ElementShowcase } from '@/components/landing/element-showcase';
import { ReadingCategories } from '@/components/landing/reading-categories';
import { FortuneProofPreview } from '@/components/landing/fortune-proof-preview';
import { SEOSections } from '@/components/seo/seo-sections';
import { CookieConsent } from '@/components/cookie-consent';

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
      {/* data-theme="dark": the hero is the Midnight Room in both themes — the
          door/eye video is dark art and a full-bleed dark band works on a light page */}
      <section data-theme="dark" className="relative min-h-[100dvh] flex items-center justify-center bg-ground text-ink">
        {/* Ambient Video Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {videoLoaded && !shouldReduceMotion && (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              poster="/horo-hero-poster.webp"
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            >
              <source src="/horo-hero.webm" type="video/webm" />
              <source src="/horo-hero.mp4" type="video/mp4" />
            </video>
          )}
          {shouldReduceMotion && (
            <img
              src="/horo-hero-poster.webp"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-ground/80 via-ground/60 to-ground" />
        </div>

        {/* Floating Particles */}
        {!shouldReduceMotion && (
          <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/5 w-1.5 h-1.5 rounded-full bg-accentBright/40 animate-float-1" />
            <div className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full bg-accentSoft/30 animate-float-2" />
            <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-accentBright/20 animate-float-3" />
            <div className="absolute top-2/3 right-1/3 w-1 h-1 rounded-full bg-accentSoft/25 animate-float-1 [animation-delay:2s]" />
            <div className="absolute top-1/2 left-2/3 w-1.5 h-1.5 rounded-full bg-accentBright/30 animate-float-2 [animation-delay:3s]" />
          </div>
        )}

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-7xl font-heading mb-6 tracking-tight bg-gradient-to-br from-ink via-accentFaint to-accentSoft bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(192,132,252,0.3)]">
              ดูดวงที่เข้าใจตัวตนของคุณ
            </h1>

            <p className="text-lg md:text-2xl text-accentFaint/80 mb-6 font-oracle font-light leading-relaxed">
              ผสานโหราศาสตร์ไทย ดวงจีนปาจื้อ (Bazi) และจิตวิทยา MBTI
              <br />
              ถอดรหัสทั้งดวงชะตาและนิสัยจริง ไม่ใช่แค่ดวง แต่คือ<span className="text-accentSoft/90 font-normal">แก่นแท้ของคุณ</span>
            </p>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mx-auto mb-10 h-px w-48 bg-gradient-to-r from-transparent via-accentSoft/40 to-transparent origin-center"
            />

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/fortune" className="w-full sm:w-auto">
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-10 py-4 bg-accent hover:bg-accentBright text-accentInk font-heading text-lg font-semibold rounded-lg transition-all shadow-md shadow-accent/20 dark:shadow-accent/30 hover:shadow-lg hover:shadow-accentBright/20 dark:hover:shadow-accentBright/30 touch-manipulation"
                >
                  เริ่มดูดวงฟรี
                </motion.button>
              </Link>

              <Link href="/login" className="w-full sm:w-auto">
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-10 py-4 border-2 border-accentBright/60 hover:border-accentBright text-accentBright hover:text-ink hover:bg-accentBright/10 dark:hover:bg-accentBright/15 font-heading text-lg rounded-lg transition-all touch-manipulation"
                >
                  เข้าสู่ระบบ
                </motion.button>
              </Link>
            </div>

            <p className="text-inkMuted/70 text-sm font-oracle mt-6">
              ฟรี · ใช้เวลาไม่ถึง 2 นาที · เห็นผลก่อนสมัครสมาชิก
            </p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <ScrollIndicator showDelay={1500} />
      </section>

      {/* ===== SECTION 2: Five Elements ===== */}
      <ElementShowcase />

      {/* ===== SECTION 4: Three Systems ===== */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading text-ink text-center mb-6"
          >
            ทำไมสายมูถึงทายได้ตรง
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-inkMuted font-oracle text-center mb-16 max-w-2xl mx-auto"
          >
            เพราะเราไม่ได้ดูแค่ดวง — เราอ่านทั้งชะตาและนิสัยของคุณ ผสาน 3 ศาสตร์ไว้ในคำทำนายเดียว
          </motion.p>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 relative max-w-md lg:max-w-none mx-auto">
            {/* Bazi */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group h-full"
            >
              <div className="absolute inset-0 rounded-2xl blur-2xl opacity-15 bg-accentBright/30 -z-10" />

              <div className="glass-card glass-card-lift relative overflow-hidden flex flex-col h-full">
                <Image
                  src="/assets/clay/systems/bazi.webp"
                  alt="โมเดลดินปั้นแท่นสี่เสาชะตาปาจื้อ"
                  width={960}
                  height={720}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 448px, 100vw"
                  className="aspect-[4/3] w-full object-contain p-4"
                />

                <div className="relative flex flex-col flex-1 p-6 md:p-8">
                  {/* Watermark */}
                  <span className="absolute top-4 right-4 text-5xl font-heading text-ink/[0.04] pointer-events-none select-none">
                    命
                  </span>

                  <h3 className="text-xl md:text-2xl font-heading text-accentBright mb-4">
                    ดวงจีนปาจื้อ (Bazi)
                  </h3>
                  <p className="text-ink font-oracle text-sm md:text-base leading-relaxed mb-4">
                    ศาสตร์โหราจีนโบราณที่วิเคราะห์ชะตาชีวิตจากสี่เสาชะตา (ปี เดือน วัน
                    ชั่วโมงเกิด) และธาตุทั้งห้า
                  </p>
                  <p className="text-inkMuted text-xs md:text-sm font-oracle mt-auto">
                    จุดเด่น: วิเคราะห์วงจรชีวิต 10 ปี และพลังธาตุในชาติ
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Thai Astrology */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative group h-full"
            >
              <div className="absolute inset-0 rounded-2xl blur-2xl opacity-15 bg-accent/30 -z-10" />

              <div className="glass-card glass-card-lift relative overflow-hidden flex flex-col h-full">
                <Image
                  src="/assets/clay/systems/thai-astrology.webp"
                  alt="โมเดลดินปั้นนพเคราะห์โคจรรอบดวงจันทร์"
                  width={960}
                  height={720}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 448px, 100vw"
                  className="aspect-[4/3] w-full object-contain p-4"
                />

                <div className="relative flex flex-col flex-1 p-6 md:p-8">
                  {/* Watermark */}
                  <span className="absolute top-4 right-4 text-5xl font-heading text-ink/[0.04] pointer-events-none select-none">
                    ๙
                  </span>

                  <h3 className="text-xl md:text-2xl font-heading text-accentBright mb-4">
                    โหราศาสตร์ไทย
                  </h3>
                  <p className="text-ink font-oracle text-sm md:text-base leading-relaxed mb-4">
                    ภูมิปัญญาไทยที่ดูดวงจากวันเกิด นพเคราะห์ และจักรนพคุณ
                    เพื่อดูความสัมพันธ์และโชคลาภ
                  </p>
                  <p className="text-inkMuted text-xs md:text-sm font-oracle mt-auto">
                    จุดเด่น: วิเคราะห์ความสัมพันธ์ โชคลาภ และจังหวะเวลา
                  </p>
                </div>
              </div>
            </motion.div>

            {/* MBTI */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative group h-full"
            >
              <div className="absolute inset-0 rounded-2xl blur-2xl opacity-15 bg-accentSoft/30 -z-10" />

              <div className="glass-card glass-card-lift relative overflow-hidden flex flex-col h-full">
                <Image
                  src="/assets/clay/systems/mbti.webp"
                  alt="โมเดลดินปั้นสมองสองซีกแทนบุคลิกภาพ MBTI"
                  width={960}
                  height={720}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 448px, 100vw"
                  className="aspect-[4/3] w-full object-contain p-4"
                />

                <div className="relative flex flex-col flex-1 p-6 md:p-8">
                  {/* Watermark */}
                  <span className="absolute top-4 right-4 text-5xl font-heading text-ink/[0.04] pointer-events-none select-none">
                    心
                  </span>

                  <h3 className="text-xl md:text-2xl font-heading text-accentBright mb-4">
                    จิตวิทยา MBTI
                  </h3>
                  <p className="text-ink font-oracle text-sm md:text-base leading-relaxed mb-4">
                    จิตวิทยาบุคลิกภาพ 16 แบบ ที่ทำให้คำทำนายรู้จักนิสัยจริง
                    และเตือนจุดอ่อนของคนแบบคุณ
                  </p>
                  <p className="text-inkMuted text-xs md:text-sm font-oracle mt-auto">
                    จุดเด่น: เตือนตามบุคลิกภาพ ปรับคำแนะนำให้เหมาะกับตัวคุณ
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: Six Readings ===== */}
      <ReadingCategories />

      {/* ===== SECTION 5.5: Proof — a real reading, shown ===== */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading text-ink text-center mb-6"
          >
            คำทำนายหน้าตาเป็นแบบนี้
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-inkMuted font-oracle text-center mb-12 max-w-2xl mx-auto"
          >
            ไม่ใช่คำทำนายกว้าง ๆ ที่ใครอ่านก็ตรง —
            ทุกบรรทัดคำนวณจากวันเกิด เวลาเกิด และบุคลิกภาพของคุณคนเดียว
          </motion.p>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <FortuneProofPreview />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="glass-card p-6 md:p-8">
                <p className="font-mono text-xs tracking-wider text-inkMuted/60 mb-3">ตัวอย่างคำทำนาย · ธาตุไม้ · INFP</p>
                <p className="font-oracle text-accentFaint/90 leading-relaxed">
                  &ldquo;เจ้าเป็นไม้ที่โตท่ามกลางลมแรง — ใจอ่อนโยนแต่รากลึก
                  ช่วงนี้การงานของเจ้ากำลังเข้าเดือนที่ธาตุทองกดทับ
                  คนบุคลิกแบบเจ้ามักยอมรับงานเกินตัวเพราะไม่กล้าปฏิเสธ
                  จงระวังสัปดาห์ที่สามของเดือน&rdquo;
                </p>
              </div>
              <p className="text-inkMuted text-sm leading-relaxed">
                สังเกตบรรทัดสุดท้าย — คำเตือนอิงจากจุดอ่อนของบุคลิกภาพแบบคุณโดยตรง
                นี่คือสิ่งที่โหราศาสตร์อย่างเดียวให้ไม่ได้ และแบบทดสอบบุคลิกภาพอย่างเดียวก็ให้ไม่ได้
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: Final CTA — "The Invitation" ===== */}
      <section className="py-24 px-6 text-center relative">
        {/* Top divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-heading text-ink mb-4">
            พร้อมรู้จักตัวเองลึกกว่าเดิมหรือยัง
          </h2>
          <p className="text-inkMuted font-oracle mb-10">
            ฟรี ไม่เสียค่าใช้จ่าย · ใช้เวลาไม่ถึง 2 นาที · เห็นผลก่อนสมัครสมาชิก
          </p>

          <Link href="/fortune">
            <div className="relative inline-block">
              {/* Glow pulse behind button */}
              <div className="absolute inset-0 bg-accent rounded-lg blur-xl animate-ctaGlow" />
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-14 py-5 bg-accent hover:bg-accentBright text-accentInk font-heading text-xl font-semibold rounded-lg transition-all shadow-md shadow-accent/20 dark:shadow-accent/30 hover:shadow-lg hover:shadow-accentBright/20 dark:hover:shadow-accentBright/30 touch-manipulation"
              >
                เริ่มดูดวงฟรี
              </motion.button>
            </div>
          </Link>

          <p className="text-inkMuted/60 text-sm font-oracle mt-6">
            ดูดวงด้วย โหราศาสตร์ไทย × ดวงจีนปาจื้อ (Bazi) × จิตวิทยา MBTI
          </p>
        </motion.div>
      </section>

      {/* ===== SEO Content — collapsed, crawlable ===== */}
      <SEOSections />

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
