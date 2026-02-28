'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

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
    <div className="relative rounded-3xl md:rounded-[32px] p-6 sm:p-8 md:p-12 text-center overflow-hidden">
      {/* Gradient background with glassmorphism */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${elementAccent ? `${elementAccent}15` : 'rgba(161,106,203,0.08)'}, rgba(15, 10, 26, 0.6))`,
          backdropFilter: 'blur(20px)',
        }}
      />

      {/* Decorative orbs */}
      <div
        className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 rounded-full blur-3xl opacity-10 -z-10"
        style={{ backgroundColor: elementAccent || '#a16acb' }}
      />
      <div
        className="absolute bottom-0 left-0 w-40 h-40 md:w-56 md:h-56 rounded-full blur-3xl opacity-5 -z-10"
        style={{ backgroundColor: elementAccent || '#a16acb' }}
      />

      {/* Floating badge with glow */}
      <div className="inline-flex items-center justify-center mb-6 md:mb-8">
        <div
          className="relative group cursor-default"
          style={{
            animation: 'floatBadge 3s ease-in-out infinite',
          }}
        >
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-30"
            style={{ backgroundColor: elementAccent || '#a16acb' }}
          />
          <div
            className="relative bg-white/5 backdrop-blur-md border border-white/10 text-lavenderGlow rounded-full px-5 py-2 text-sm md:text-base font-heading font-medium flex items-center gap-2 transition-all duration-300 group-hover:scale-105"
            style={{
              boxShadow: `0 0 30px ${elementAccent ? `${elementAccent}30` : 'rgba(161,106,203,0.2)'}`,
            }}
          >
            <Sparkles className="w-4 h-4 animate-pulse" style={{ color: elementAccent || '#a16acb' }} />
            <span>คำทำนายของเจ้าพร้อมแล้ว</span>
          </div>
        </div>
      </div>

      {/* User name with glow effect */}
      <div className="mb-3 md:mb-4">
        <h1
          className="font-heading text-ghostWhite font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl inline-block transition-all duration-300 hover:scale-105 cursor-default"
          style={{
            textShadow: `0 0 40px ${elementAccent ? `${elementAccent}40` : 'rgba(161,106,203,0.25)'}`,
          }}
        >
          ดวงชะตาของ <span style={{ color: elementAccent || '#a16acb' }}>{userName}</span>
        </h1>
      </div>

      {/* Birth date and age with decorative separators */}
      <div className="flex items-center justify-center gap-2 md:gap-3 mb-8 md:mb-10">
        <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-lavenderGlow/30" />
        <p className="font-thai text-ashGray text-sm md:text-base flex items-center gap-2">
          <span>{birthDateFormatted}</span>
          <span className="text-lavenderGlow/50">·</span>
          <span>อายุ {currentAge} ปี</span>
        </p>
        <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-lavenderGlow/30" />
      </div>

      {/* Personality traits as floating bubbles */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 max-w-3xl mx-auto">
        {personalityTraits.map((trait, index) => (
          <div
            key={index}
            className="group relative cursor-default"
            style={{
              animation: `floatTrait 3s ease-in-out infinite`,
              animationDelay: `${index * 0.2}s`,
            }}
          >
            <div
              className="absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"
              style={{ backgroundColor: elementAccent || '#a16acb' }}
            />
            <div
              className="relative px-4 py-2 rounded-full text-sm md:text-base font-thai transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
              style={{
                backgroundColor: elementAccent ? `${elementAccent}15` : 'rgba(161,106,203,0.08)',
                border: `1px solid ${elementAccent ? `${elementAccent}30` : 'rgba(161,106,203,0.2)'}`,
                color: elementAccent || '#a16acb',
                boxShadow: `0 4px 15px ${elementAccent ? `${elementAccent}10` : 'rgba(161,106,203,0.05)'}`,
              }}
            >
              {trait}
            </div>
          </div>
        ))}
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

        @keyframes floatBadge {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes floatTrait {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
}
