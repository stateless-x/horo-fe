'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { useOnboardingStore } from '@/stores/onboarding';

interface InviteData {
  inviterName: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Invite Link Page
 *
 * Handles compatibility invite flow:
 * 1. Fetch invite details (who invited you)
 * 2. Show context message
 * 3. Guide through onboarding if not authenticated
 * 4. After auth, mark invite as used and redirect to compatibility results
 *
 * Example URL: /invite/a3f8c2d1
 */
export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const { reset: resetFlow } = useOnboardingStore();

  const token = params.token as string;

  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null);

  // Fetch invite details
  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/invite/${token}`
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch invite');
        }

        const data = await response.json();
        setInviteData(data);

        // Calculate days until expiry (client-only to prevent hydration errors)
        const days = Math.ceil(
          (new Date(data.expiresAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        );
        setDaysUntilExpiry(days);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  // Handle authenticated user
  useEffect(() => {
    if (session && inviteData && !sessionLoading) {
      // User is authenticated, mark invite as used and redirect to compatibility
      markInviteAsUsed();
    }
  }, [session, inviteData, sessionLoading]);

  const markInviteAsUsed = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invite/${token}/use`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to use invite');
      }

      // Redirect to compatibility results page
      // TODO: Create a compatibility results page or dashboard section
      router.push('/dashboard?compatibility=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process invite');
    }
  };

  const handleStartOnboarding = () => {
    resetFlow();
    setShowOnboarding(true);
  };

  // Loading state
  if (loading || sessionLoading) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center">
        <div className="text-ink text-lg font-oracle">กำลังโหลด...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="text-6xl">😕</div>
          <h1 className="text-2xl text-ink font-heading">
            ลิงก์ไม่ถูกต้อง
          </h1>
          <p className="text-inkMuted font-oracle">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-accent hover:bg-accentBright text-accentInk font-heading rounded-lg transition-all"
          >
            กลับสู่หน้าหลัก
          </button>
        </motion.div>
      </div>
    );
  }

  // Show onboarding flow if user clicked "Start"
  if (showOnboarding) {
    return <OnboardingFlow />;
  }

  // Show invite context page
  return (
    <div className="min-h-screen bg-ground flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-2xl"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-7xl"
        >
          ✨
        </motion.div>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl text-ink font-heading">
            {inviteData?.inviterName} เชิญเจ้ามาดูดวงคู่
          </h1>
          <p className="text-xl text-accentFaint font-oracle">
            มาดูกันว่าดวงของเจ้าและ {inviteData?.inviterName} จะเข้ากันหรือไม่
          </p>
        </div>

        {/* Explanation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-surface border border-surface2 rounded-xl p-6 space-y-3"
        >
          <p className="text-ink font-oracle leading-relaxed">
            เจ้าจะต้องกรอกข้อมูลวันเกิดของเจ้าเพื่อคำนวณดวงคู่
            <br />
            ระบบจะวิเคราะห์ความเข้ากันของเจ้าทั้งสองด้วยศาสตร์โหราจีนและไทย
          </p>
          <p className="text-inkMuted text-sm font-oracle">
            ข้อมูลของเจ้าจะถูกเก็บไว้เพื่อดูดวงในอนาคต
          </p>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartOnboarding}
          className="px-12 py-5 bg-accent hover:bg-accentBright text-accentInk font-heading text-xl rounded-lg transition-all shadow-xl shadow-accent/50"
        >
          เริ่มกรอกข้อมูล
        </motion.button>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-inkMuted/70 font-oracle"
        >
          {daysUntilExpiry !== null && (
            <>ลิงก์นี้จะหมดอายุใน {daysUntilExpiry} วัน</>
          )}
        </motion.p>
      </motion.div>
    </div>
  );
}
