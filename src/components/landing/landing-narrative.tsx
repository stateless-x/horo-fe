'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ClientDate } from '@/components/client-date';
import { ElementShowcase } from '@/components/landing/element-showcase';
import { ReadingCategories } from '@/components/landing/reading-categories';
import { FortuneProofPreview } from '@/components/landing/fortune-proof-preview';

/**
 * The animated narrative part of the landing page: hero through the closing
 * CTA. Split out of app/(marketing)/page.tsx so that page can be a Server
 * Component — which lets the FAQ and its JSON-LD render server-side instead
 * of being dragged across the client boundary with framer-motion.
 */
export function LandingNarrative() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  // useReducedMotion() is null on the server but resolved on the client's
  // first render, so gating the <video> on it alone renders different trees
  // on each side and React reports a hydration mismatch. Mount first, then
  // decide — same pattern as components/ui/clay-oracle-loader.tsx.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const activeVideo = mounted && shouldReduceMotion === false && videoPlaying;

  return (
    <>
      {/* ===== SECTION 1: Hero — "The Threshold" ===== */}
      {/* data-theme="dark": the hero is the Midnight Room in both themes — the
          door/eye video is dark art and a full-bleed dark band works on a light page */}
      <section data-theme="dark" className="relative min-h-[100dvh] flex items-center justify-center bg-ground text-ink">
        {/* Ambient Video Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* The poster is the base layer and is always in the server HTML, so
              the hero has art at first paint and the browser's preload scanner
              can find it. Previously both branches were gated (on a 500ms
              timer, and on shouldReduceMotion which is null on the server), so
              neither reached the prerendered markup and the hero stayed empty
              until hydration finished. The video fades in on top once it can
              actually play. */}
          <img
            src="/horo-hero-poster.webp"
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              activeVideo ? 'opacity-0' : 'opacity-20'
            }`}
          />
          {/* `=== false`, not `!`: useReducedMotion() returns null on the
              server, and `!null` is true — which would put a 597 kB webm /
              678 kB mp4 into the prerendered HTML and start fetching it at
              first paint, competing with the fonts and the poster. Explicit
              `false` keeps the video client-only. Same idiom as
              components/ui/clay-oracle-loader.tsx. */}
          {mounted && shouldReduceMotion === false && (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              poster="/horo-hero-poster.webp"
              preload="metadata"
              onPlaying={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              onWaiting={() => setVideoPlaying(false)}
              onStalled={() => setVideoPlaying(false)}
              onError={() => setVideoPlaying(false)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                activeVideo ? 'opacity-20' : 'opacity-0'
              }`}
            >
              <source src="/horo-hero.webm" type="video/webm" />
              <source src="/horo-hero.mp4" type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-ground/80 via-ground/60 to-ground" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-4xl md:text-7xl font-heading mb-6 tracking-tight bg-gradient-to-br from-ink via-accentFaint to-accentSoft bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(192,132,252,0.3)]">
              ดูดวงฟรี เผื่อวันนี้จะเข้าใจตัวเองขึ้น
            </h1>

            <p className="text-lg md:text-2xl text-accentFaint/80 mb-6 font-oracle font-light leading-relaxed">
              เรื่องงาน เรื่องรัก หรือเรื่องที่ยังคิดไม่ตก
              <br />
              ลองให้ดวงเป็นอีกมุม แล้วเลือกทางที่<span className="text-accentSoft/90 font-normal">สบายใจในแบบคุณ</span>
            </p>

            {/* Decorative line */}
            <div className="mx-auto mb-10 h-px w-48 bg-gradient-to-r from-transparent via-accentSoft/40 to-transparent" />

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
              ดูผลเบื้องต้นฟรี แล้วค่อยเข้าสู่ระบบเพื่ออ่านต่อ
            </p>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: Five Elements ===== */}
      <ElementShowcase />

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
            ลองอ่านสักนิด ก่อนเปิดดวงของคุณ
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-inkMuted font-oracle text-center mb-12 max-w-2xl mx-auto"
          >
            มีทั้งภาพรวมและคำแนะนำแยกเป็นเรื่อง
            อยากรู้เรื่องไหน ก็เลือกอ่านเรื่องนั้น
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
                  &ldquo;ใจดีได้ แต่อย่าลืมเผื่อใจไว้ให้ตัวเองด้วย
                  ถ้าช่วงนี้มีงานฝากมาเรื่อย ๆ ลองเช็กงานในมือก่อนรับเพิ่ม
                  คำว่าไม่สะดวกครั้งนี้ ไม่ได้แปลว่าคุณเป็นเพื่อนร่วมงานที่ไม่ดี&rdquo;
                </p>
              </div>
              <p className="text-inkMuted text-sm leading-relaxed">
                นี่คือตัวอย่างน้ำเสียงของคำทำนาย
                อ่านแล้วลองเก็บส่วนที่เข้ากับชีวิตคุณไปใช้ ไม่ต้องทำตามทุกข้อ
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
            มีเรื่องไหนอยู่ในใจ ลองเปิดดวงดู
          </h2>
          <p className="text-inkMuted font-oracle mb-10">
            บอกวันเกิด ดูผลเบื้องต้น แล้วค่อยตัดสินใจอ่านต่อ
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
            อ่านไว้เป็นมุมมอง ทางเดินต่อจากนี้คุณเลือกเอง
          </p>
        </motion.div>
      </section>
      {/* ===== SECTION 4: Three Systems ===== */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading text-ink text-center mb-6"
          >
            ดวงเล่าเรื่องคุณจากอะไรบ้าง
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-inkMuted font-oracle text-center mb-16 max-w-2xl mx-auto"
          >
            สายมูเป็นเว็บดูดวงออนไลน์ฟรี ใช้ AI เรียบเรียงคำทำนายจากดวงไทย ปาจื้อ และ MBTI ที่คุณเลือกบอก
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
                    เริ่มจากปี เดือน วัน และเวลาเกิด
                    เพื่ออ่านธาตุประจำตัวและจังหวะชีวิตตามศาสตร์จีน
                  </p>
                  <p className="text-inkMuted text-xs md:text-sm font-oracle mt-auto">
                    ชวนรู้จักธาตุของตัวเองให้มากขึ้น
                  </p>
                  <Link
                    href="/learn/bazi"
                    className="mt-5 min-h-11 inline-flex w-fit items-center text-sm font-heading text-accentBright underline decoration-accentBright/40 underline-offset-4 hover:text-accentSoft"
                  >
                    อ่านพื้นฐานปาจื้อ
                  </Link>
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
                    อ่านวันเกิดผ่านดาวประจำวัน
                    พร้อมสี เลข และทิศมงคลที่คุ้นเคย
                  </p>
                  <p className="text-inkMuted text-xs md:text-sm font-oracle mt-auto">
                    เติมไอเดียเล็ก ๆ ให้วันธรรมดา
                  </p>
                  <Link
                    href="/learn/thai-astrology"
                    className="mt-5 min-h-11 inline-flex w-fit items-center text-sm font-heading text-accentBright underline decoration-accentBright/40 underline-offset-4 hover:text-accentSoft"
                  >
                    อ่านพื้นฐานโหราศาสตร์ไทย
                  </Link>
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
                    บุคลิกภาพ MBTI
                  </h3>
                  <p className="text-ink font-oracle text-sm md:text-base leading-relaxed mb-4">
                    ถ้ารู้ MBTI ลองบอกเราเพิ่ม
                    เพื่อให้คำแนะนำมีมุมของนิสัยที่คุณคุ้นกับตัวเอง
                  </p>
                  <p className="text-inkMuted text-xs md:text-sm font-oracle mt-auto">
                    ไม่รู้ก็ข้ามได้ ดูดวงต่อได้เหมือนเดิม
                  </p>
                  <Link
                    href="/learn/mbti"
                    className="mt-5 min-h-11 inline-flex w-fit items-center text-sm font-heading text-accentBright underline decoration-accentBright/40 underline-offset-4 hover:text-accentSoft"
                  >
                    อ่านวิธีใช้ MBTI
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
          <p className="mt-8 text-center font-oracle text-sm text-inkMuted">
            อยากรู้ที่มาของคำว่าสายมูไหม{' '}
            <Link href="/learn/mutelu" className="min-h-11 inline-flex items-center text-accentBright underline decoration-accentBright/40 underline-offset-4 hover:text-accentSoft">
              อ่านเรื่องมูเตลู
            </Link>
          </p>
        </div>
      </section>

    </>
  );
}
