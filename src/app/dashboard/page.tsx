"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/lib-packages/ui";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClientDate } from "@/components/client-date";

/**
 * Main Dashboard - Daily Horoscope (Home)
 *
 * Features:
 * - Today's fortune card (AI-generated 3-4 sentences)
 * - Element energy indicator
 * - Lucky number, color, direction
 * - Share button → generates styled card (IG Story/LINE/X sized)
 * - Refreshes at midnight Thai time (UTC+7)
 *
 * Protected route - requires authentication
 */
export default function DashboardPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const [shareStatus, setShareStatus] = useState<"idle" | "copying" | "copied">(
    "idle",
  );

  // Redirect unauthenticated users to login
  // Redirect incomplete onboarding to fortune detail page
  useEffect(() => {
    if (!sessionLoading) {
      if (!session) {
        router.push("/login");
      } else if (!(session.user as any)?.onboardingCompleted) {
        // User is authenticated but hasn't completed onboarding
        // Redirect to fortune detail page to complete the flow
        router.push("/dashboard/fortune");
      }
    }
  }, [session, sessionLoading, router]);

  const {
    data: dailyReading,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["daily-reading"],
    queryFn: () => api.get("/api/fortune/daily"),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!session, // Only fetch when authenticated
    retry: 3, // Max 3 retries
    retryDelay: (attemptIndex) =>
      Math.min(1000 * Math.pow(2, attemptIndex), 30000), // Exponential backoff: 1s, 2s, 4s, max 30s
  });

  // Handle share functionality
  const handleShare = async () => {
    const shareText = `ดวงชะตาวันนี้ของฉัน 🔮

เลขมงคล: 7
สีมงคล: น้ำเงิน
ทิศมงคล: ทิศตะวันออก

วันนี้เป็นวันที่ดีสำหรับการเริ่มต้นสิ่งใหม่!

มาดูดวงของเจ้ากัน!`;

    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/fortune`;

    try {
      // Try Web Share API (mobile)
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "Horo - ดวงชะตาวันนี้",
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: Copy to clipboard (desktop)
        const fullText = `${shareText}\n\n${shareUrl}`;
        await navigator.clipboard.writeText(fullText);
        setShareStatus("copied");

        // Reset status after 2 seconds
        setTimeout(() => setShareStatus("idle"), 2000);
      }
    } catch (error) {
      console.error("Share error:", error);
      // Fallback to clipboard even if share fails
      try {
        const fullText = `${shareText}\n\n${shareUrl}`;
        await navigator.clipboard.writeText(fullText);
        setShareStatus("copied");
        setTimeout(() => setShareStatus("idle"), 2000);
      } catch (clipboardError) {
        console.error("Clipboard error:", clipboardError);
      }
    }
  };

  // Show loading state while checking session or fetching data
  if (sessionLoading || isLoading || !session) {
    return (
      <div className="min-h-screen bg-voidBlack flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 border-4 border-royalPurple border-t-transparent rounded-full animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <p className="text-paleOrchid font-oracle">
            สวัสดี, {(session.user as any).displayName || session.user.name || "เจ้า"}
          </p>
          <h1 className="text-4xl font-heading text-ghostWhite">
            ดวงชะตาวันนี้
          </h1>
          <p className="text-ashGray">
            <ClientDate />
          </p>
        </motion.div>

        {/* Daily Fortune Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-darkPurple to-deepNight">
              <CardTitle className="text-center">โชคลาภวันนี้</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Mock content - replace with actual data */}
              <div className="space-y-4">
                <p className="text-lg leading-relaxed text-ghostWhite/90 font-oracle font-light">
                  วันนี้เป็นวันที่ดีสำหรับการเริ่มต้นสิ่งใหม่
                  พลังงานขององค์ประกอบธาตุดินเข้มแข็ง
                  ทำให้เจ้ามีความมั่นคงและมั่นใจในตัวเอง
                  เหมาะกับการตัดสินใจเรื่องสำคัญ
                </p>
              </div>

              <hr className="border-darkPurple" />

              {/* Lucky Info Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-ashGray mb-1">เลขมงคล</p>
                  <p className="text-2xl font-heading text-amethyst">7</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-ashGray mb-1">สีมงคล</p>
                  <p className="text-lg text-ghostWhite">น้ำเงิน</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-ashGray mb-1">ทิศมงคล</p>
                  <p className="text-lg text-ghostWhite">ทิศตะวันออก</p>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="w-full py-3 bg-royalPurple hover:bg-amethyst text-ghostWhite rounded-md transition-colors font-heading"
              >
                {shareStatus === "copied" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    คัดลอกแล้ว!
                  </span>
                ) : (
                  "แชร์ดวงชะตาของเจ้า"
                )}
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Element Energy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>พลังองค์ประกอบ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "ไม้ (Wood)", value: 20, color: "bg-green-500" },
                { name: "ไฟ (Fire)", value: 15, color: "bg-red-500" },
                { name: "ดิน (Earth)", value: 30, color: "bg-yellow-700" },
                { name: "โลหะ (Metal)", value: 20, color: "bg-gray-400" },
                { name: "น้ำ (Water)", value: 15, color: "bg-blue-500" },
              ].map((element) => (
                <div key={element.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ashGray">{element.name}</span>
                    <span className="text-ghostWhite">{element.value}%</span>
                  </div>
                  <div className="w-full bg-deepNight rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${element.value}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className={`h-full ${element.color}`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="p-6 text-center hover:border-royalPurple transition-colors cursor-pointer">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-heading text-ghostWhite">ดูดวงแบบเต็ม</h3>
          </Card>

          <Card className="p-6 text-center hover:border-royalPurple transition-colors cursor-pointer">
            <div className="text-4xl mb-2">💑</div>
            <h3 className="font-heading text-ghostWhite">ดูดวงคู่</h3>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
