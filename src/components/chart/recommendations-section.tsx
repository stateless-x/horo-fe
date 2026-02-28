import { Sparkles, Check, X } from 'lucide-react';
import type { Recommendations } from '@/lib-packages/shared/types/astrology';

interface RecommendationsSectionProps {
  recommendations: Recommendations;
}

export function RecommendationsSection({ recommendations }: RecommendationsSectionProps) {
  const renderDotRating = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className={`w-2 h-2 rounded-full ${
              dot <= rating ? 'bg-amethyst' : 'bg-darkPurple/50'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-6">
        <Sparkles className="text-lavenderGlow w-6 h-6" />
        <h2 className="font-heading text-xl font-medium text-ghostWhite">
          คำแนะนำ & ฤกษ์มงคล
        </h2>
      </div>

      {/* Lucky attributes grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-charcoal border border-darkPurple/50 rounded-lg p-4">
          <p className="text-lavenderGlow font-thai text-xs mb-2">สีมงคลปีนี้</p>
          <p className="text-ghostWhite font-heading font-medium text-base">
            {recommendations.luckyColors.join(', ')}
          </p>
        </div>

        <div className="bg-charcoal border border-darkPurple/50 rounded-lg p-4">
          <p className="text-lavenderGlow font-thai text-xs mb-2">เลขมงคล</p>
          <p className="text-ghostWhite font-heading font-medium text-base">
            {recommendations.luckyNumbers.join(', ')}
          </p>
        </div>

        <div className="bg-charcoal border border-darkPurple/50 rounded-lg p-4">
          <p className="text-lavenderGlow font-thai text-xs mb-2">ทิศมงคล</p>
          <p className="text-ghostWhite font-heading font-medium text-base">
            {recommendations.luckyDirection}
          </p>
        </div>

        <div className="bg-charcoal border border-darkPurple/50 rounded-lg p-4">
          <p className="text-lavenderGlow font-thai text-xs mb-2">วันมงคล</p>
          <p className="text-ghostWhite font-heading font-medium text-base">
            {recommendations.luckyDay}
          </p>
        </div>
      </div>

      {/* Monthly highlights */}
      {recommendations.monthlyHighlights.length > 0 && (
        <div className="bg-deepNight border border-darkPurple/50 rounded-xl p-6 mb-6">
          <h3 className="text-lavenderGlow font-heading font-medium text-base mb-4">
            เดือนเด่นของคุณ
          </h3>
          <div className="space-y-3">
            {recommendations.monthlyHighlights.map((highlight, index) => (
              <div
                key={index}
                className="flex items-center gap-4 pb-3 border-b border-darkPurple/30 last:border-0 last:pb-0"
              >
                <div className="w-16 flex-shrink-0">
                  <p className="text-ghostWhite font-heading font-medium text-sm">
                    {highlight.month}
                  </p>
                </div>
                <div className="flex-shrink-0">{renderDotRating(highlight.rating)}</div>
                <p className="text-ashGray font-thai text-sm flex-1">{highlight.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Do's and Don'ts */}
      <div className="bg-deepNight border border-darkPurple/50 rounded-xl p-6">
        <h3 className="text-lavenderGlow font-heading font-medium text-base mb-4">
          สิ่งที่ควรทำ & หลีกเลี่ยงปีนี้
        </h3>

        <div className="space-y-4">
          {/* Do's */}
          {recommendations.dos.length > 0 && (
            <div>
              <ul className="space-y-2">
                {recommendations.dos.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="text-emerald-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-ghostWhite font-thai text-sm">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Don'ts */}
          {recommendations.donts.length > 0 && (
            <div className="pt-4 border-t border-darkPurple/50">
              <ul className="space-y-2">
                {recommendations.donts.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="text-red-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-ghostWhite font-thai text-sm">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
