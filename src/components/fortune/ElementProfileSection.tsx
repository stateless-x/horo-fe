'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Sparkles, Shield, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import type { ElementProfile } from "@/lib-packages/shared/types/astrology";
import { ELEMENT_COLORS } from "@/lib-packages/shared/constants/design";

interface ElementProfileSectionProps {
  elementProfile: ElementProfile;
}

export function ElementProfileSection({
  elementProfile,
}: ElementProfileSectionProps) {
  const elementColor = ELEMENT_COLORS[elementProfile.primaryElement];
  const [currentSlide, setCurrentSlide] = useState(0);

  const elementNames: Record<string, string> = {
    earth: "ธาตุดิน",
    fire: "ธาตุไฟ",
    water: "ธาตุน้ำ",
    wood: "ธาตุไม้",
    metal: "ธาตุทอง",
  };

  // Carousel slides data
  const slides = [
    {
      icon: Sparkles,
      title: "จุดแข็ง",
      items: elementProfile.strengths,
    },
    {
      icon: Shield,
      title: "จุดอ่อน",
      items: elementProfile.weaknesses,
    },
    {
      icon: Heart,
      title: "ธาตุที่เข้ากัน",
      items: elementProfile.compatibleElements.map((el) => elementNames[el]),
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative">
      {/* Ambient glow background */}
      <div
        className="absolute inset-0 rounded-3xl md:rounded-[32px] blur-2xl md:blur-3xl opacity-15 md:opacity-20"
        style={{ backgroundColor: elementColor.primary }}
      />

      {/* Main container with glassmorphism */}
      <div
        className="relative rounded-3xl md:rounded-[32px] border border-edge p-5 sm:p-8 md:p-10 overflow-hidden backdrop-blur-sm"
        style={{
          background: `linear-gradient(135deg, ${elementColor.glow}15, rgba(15, 10, 26, 0.8))`,
        }}
      >
        {/* Decorative gradient orbs - smaller on mobile */}
        <div
          className="absolute -top-16 -right-16 md:-top-24 md:-right-24 w-32 h-32 md:w-48 md:h-48 rounded-full blur-2xl md:blur-3xl opacity-15 md:opacity-20"
          style={{ backgroundColor: elementColor.primary }}
        />
        <div
          className="absolute -bottom-16 -left-16 md:-bottom-24 md:-left-24 w-32 h-32 md:w-48 md:h-48 rounded-full blur-2xl md:blur-3xl opacity-10"
          style={{ backgroundColor: elementColor.primary }}
        />

        {/* Element visual with animated rings - responsive sizing */}
        <div className="flex justify-center mb-6 md:mb-8 relative">
          {/* Outer pulsing ring */}
          <motion.div
            className="absolute w-24 h-24 md:w-32 md:h-32 rounded-full"
            style={{
              background: `radial-gradient(circle, ${elementColor.glow}40, transparent)`,
            }}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{
              duration: 2,
              repeat: 2,
              ease: "easeInOut"
            }}
          />

          {/* Middle ring */}
          <motion.div
            className="absolute w-20 h-20 md:w-28 md:h-28 rounded-full border-2 opacity-30"
            style={{
              borderColor: elementColor.primary,
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: 0.3,
              ease: "linear"
            }}
          />

          {/* Main element orb */}
          <div
            className="relative w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 md:hover:scale-110 cursor-pointer group touch-manipulation"
            style={{
              backgroundColor: elementColor.glow,
              boxShadow: `0 0 40px ${elementColor.glow}, 0 0 60px ${elementColor.glow}40`,
            }}
          >
            <div
              className="w-12 h-12 md:w-16 md:h-16 rounded-full transition-all duration-300 group-active:scale-110 md:group-hover:w-20 md:group-hover:h-20"
              style={{ backgroundColor: elementColor.primary }}
            >
              <div
                className="w-full h-full rounded-full opacity-50"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${elementColor.primary}, transparent)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Element name and description with better spacing */}
        <div className="text-center mb-8 md:mb-10 relative z-10 px-2">
          <p className="font-thai text-ink/80 text-base md:text-lg mb-2 md:mb-3">
            ธาตุประจำตัวของเจ้าคือ
          </p>
          <h2
            className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 transition-all duration-300 active:scale-95 md:hover:scale-105 inline-block cursor-default touch-manipulation"
            style={{
              color: elementColor.primary,
              textShadow: `0 0 20px ${elementColor.glow}`,
            }}
          >
            {elementNames[elementProfile.primaryElement]}
          </h2>
          <p className="font-oracle text-ink text-base md:text-lg leading-relaxed md:leading-relaxed max-w-2xl mx-auto">
            {elementProfile.corePersonality}
          </p>
        </div>

        {/* Info Carousel */}
        <div className="relative mb-6 md:mb-8">
          {/* Carousel Container */}
          <div className="relative overflow-hidden px-12 md:px-16">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe > 500) {
                    nextSlide();
                  } else if (swipe < -500) {
                    prevSlide();
                  }
                }}
                className="cursor-grab active:cursor-grabbing touch-manipulation"
              >
                <div
                  className="relative rounded-xl md:rounded-2xl p-6 md:p-8 min-h-[280px] md:min-h-[320px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {/* Icon and Title */}
                  <div className="flex items-center gap-3 mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    >
                      {React.createElement(slides[currentSlide].icon, {
                        className: "w-6 h-6 md:w-7 md:h-7 flex-shrink-0",
                        style: { color: elementColor.primary },
                      })}
                    </motion.div>
                    <h3
                      className="font-heading font-medium text-xl md:text-2xl"
                      style={{ color: elementColor.primary }}
                    >
                      {slides[currentSlide].title}
                    </h3>
                  </div>

                  {/* Items List */}
                  <ul className="space-y-3 md:space-y-4">
                    {slides[currentSlide].items.map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="text-ink font-thai text-base md:text-lg flex items-start gap-3 leading-relaxed"
                      >
                        <span
                          className="inline-block w-2 h-2 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: elementColor.primary }}
                        />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 md:hover:scale-110 touch-manipulation z-10"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${elementColor.primary}30`,
              boxShadow: `0 4px 20px ${elementColor.glow}`,
            }}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" style={{ color: elementColor.primary }} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 md:hover:scale-110 touch-manipulation z-10"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${elementColor.primary}30`,
              boxShadow: `0 4px 20px ${elementColor.glow}`,
            }}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" style={{ color: elementColor.primary }} />
          </button>

          {/* Indicator Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="transition-all duration-300 touch-manipulation"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div
                  className={`rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-8 h-2"
                      : "w-2 h-2 hover:w-3 active:w-3"
                  }`}
                  style={{
                    backgroundColor:
                      index === currentSlide
                        ? elementColor.primary
                        : `${elementColor.primary}40`,
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Conflict warning with improved styling */}
        <div
          className="relative rounded-xl md:rounded-2xl p-4 md:p-5 flex items-start gap-3 md:gap-4 transition-all duration-300 active:scale-95 md:hover:scale-[1.02] cursor-default overflow-hidden touch-manipulation"
          style={{
            background: "rgba(251, 191, 36, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(251, 191, 36, 0.2)",
            boxShadow: "0 4px 20px rgba(251, 191, 36, 0.1)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-transparent" />
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{
              duration: 2,
              repeat: 2,
              ease: "easeInOut"
            }}
          >
            <AlertTriangle className="text-amber-400 w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-0.5 relative z-10" />
          </motion.div>
          <div className="relative z-10">
            <p className="text-ink font-thai text-sm md:text-base lg:text-lg leading-relaxed">
              <span className="text-amber-400 font-medium">ระวังธาตุ:</span>{" "}
              <span className="font-semibold">{elementNames[elementProfile.conflictingElement]}</span>
              {" "}
              <span className="text-inkMuted">(ธาตุนี้ข่มธาตุของเจ้า)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
