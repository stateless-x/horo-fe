'use client';

import { useState, useEffect } from 'react';

interface HeroSectionProps {
  personalityTraits: string[];
  birthDateFormatted: string;
  currentAge: number;
  userName: string;
  elementAccent?: string;
  loadingState?: 'loading' | 'complete';
}

export function HeroSection({
  personalityTraits,
  birthDateFormatted,
  currentAge,
  userName,
  elementAccent,
  loadingState = 'complete',
}: HeroSectionProps) {
  const [showShimmer, setShowShimmer] = useState(false);

  // Trigger shimmer when fortune loads
  useEffect(() => {
    if (loadingState === 'complete') {
      setShowShimmer(true);
      const timer = setTimeout(() => setShowShimmer(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [loadingState]);

  return (
    <div className="bg-gradient-to-b from-darkPurple/30 to-voidBlack rounded-2xl p-8 text-center relative overflow-hidden">
      {/* "คำทำนายพร้อมแล้ว" badge */}
      <div className="inline-flex items-center justify-center mb-6">
        <div className="bg-royalPurple/20 border border-amethyst/30 text-lavenderGlow rounded-full px-4 py-1 text-[13px] font-heading font-medium animate-glow">
          คำทำนายของเจ้าพร้อมแล้ว
        </div>
      </div>

      {/* User name */}
      <h1 className="font-heading text-ghostWhite font-semibold text-3xl md:text-4xl mb-2">
        ดวงชะตาของ {userName}
      </h1>

      {/* Birth date and age */}
      <p className="font-thai text-ashGray text-base mb-6">
        {birthDateFormatted} · อายุ {currentAge} ปี
      </p>

      {/* Personality traits badge */}
      <div
        className="inline-block border rounded-lg px-6 py-3"
        style={{
          backgroundColor: elementAccent
            ? `${elementAccent}1a` // 10% opacity
            : "rgb(26, 10, 46, 0.3)", // darkPurple/30
          borderColor: elementAccent
            ? `${elementAccent}80` // 50% opacity
            : "rgb(26, 10, 46, 0.5)", // darkPurple/50
        }}
      >
        <p className="text-paleOrchid font-thai text-base">
          <span className="font-heading font-medium text-lavenderGlow">
            บุคลิกภาพ:
          </span>{" "}
          {personalityTraits.join(" · ")}
        </p>
      </div>

      {/* Element energy pulse glow behind name */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl -z-10 pointer-events-none element-pulse"
        style={{
          backgroundColor: elementAccent ? `${elementAccent}1a` : 'rgba(161,106,203,0.1)',
        }}
      />

      {/* Shimmer effect on first load */}
      {showShimmer && (
        <div className="absolute inset-0 -z-10 shimmer-sweep" />
      )}

      <style jsx>{`
        @keyframes elementPulse {
          0%, 100% {
            opacity: 0.05;
            transform: translate(-50%, -50%) scale(0.95);
          }
          50% {
            opacity: 0.15;
            transform: translate(-50%, -50%) scale(1.05);
          }
        }

        .element-pulse {
          animation: elementPulse 4s ease-in-out infinite;
        }

        @keyframes shimmerSweep {
          0% {
            background-position: -500px 0;
          }
          100% {
            background-position: 500px 0;
          }
        }

        .shimmer-sweep {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(161, 106, 203, 0.1) 25%,
            rgba(161, 106, 203, 0.2) 50%,
            rgba(161, 106, 203, 0.1) 75%,
            transparent 100%
          );
          background-size: 500px 100%;
          animation: shimmerSweep 2s ease-in-out;
          border-radius: 1rem;
        }
      `}</style>
    </div>
  );
}
