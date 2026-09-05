"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { SkipForward } from 'lucide-react';
import { useOnboardingStore } from "@/stores/onboarding";

/**
 * Step 1: Welcome Animation
 *
 * Full-screen video (horo-welcome.webm / horo-welcome.mp4):
 * - Rinnegan-inspired eye behind Gate of Truth door
 * - Gate slides open → eye appears → stares → closes → 6 smaller eyes appear then vanish
 * - Must feel sacred and unsettling
 */
export function StepWelcome() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { nextStep } = useOnboardingStore();
  const hasAdvancedRef = useRef(false);

  const advanceOnce = useCallback(() => {
    if (hasAdvancedRef.current) return;
    hasAdvancedRef.current = true;
    nextStep();
  }, [nextStep]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => window.setTimeout(advanceOnce, 500);

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [advanceOnce]);

  const handleSkip = () => {
    videoRef.current?.pause();
    advanceOnce();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-ground"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover [object-position:calc(50%_-_20px)_50%] md:object-center"
      >
        <source src="/horo-welcome.webm" type="video/webm" />
        <source src="/horo-welcome.mp4" type="video/mp4" />
      </video>

      {/* The reveal has no loop attribute: it plays once, then advances. */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute bottom-6 right-4 z-10 inline-flex min-h-11 items-center gap-2 rounded-lg border border-edge bg-ground/80 px-4 font-heading text-sm text-inkMuted backdrop-blur transition-colors hover:border-accent/50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright sm:bottom-8 sm:right-8"
      >
        <SkipForward className="size-4" aria-hidden="true" />
        ข้ามแอนิเมชัน
      </button>
    </motion.div>
  );
}
