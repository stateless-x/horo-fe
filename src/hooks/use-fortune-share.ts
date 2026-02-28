import { useCallback } from "react";
import { useFortuneStore } from "@/stores/fortune";
import type { StructuredChartResponse } from "@/lib-packages/shared/types/astrology";

/**
 * Fortune Share Hook
 *
 * Handles sharing functionality with Web Share API fallback to clipboard.
 */
export function useFortuneShare() {
  const { shareStatus, setShareStatus } = useFortuneStore();

  const handleShare = useCallback(
    async (chartData: StructuredChartResponse | null) => {
      if (!chartData) return;

      const shareText = `ดวงชะตาของฉัน: ${chartData.elementProfile.primaryElement} 🔮

สีมงคล: ${chartData.birthStar.luckyColor}
เลขมงคล: ${chartData.birthStar.luckyNumber}
ดาวประจำวัน: ${chartData.birthStar.planet}

มาดูดวงของเจ้ากันเถอะ!`;

      const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/fortune`;

      try {
        // Try Web Share API (mobile)
        if (typeof navigator !== "undefined" && navigator.share) {
          await navigator.share({
            title: "Horo - ดวงชะตาของฉัน",
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
    },
    [setShareStatus],
  );

  return {
    handleShare,
    shareStatus,
  };
}
