import { Handshake, HeartHandshake, MessageCircleMore } from 'lucide-react';
import type { RelationshipType } from '@/lib-packages/shared';
import { relationshipReportCopy } from './report-copy';
import { relationshipReportVisuals } from './report-visuals';
import { SectionActionMap, type ActionTone } from './section-action-map';

type ConversationMoment = 'communication' | 'friction';

interface ConversationMomentMapProps {
  onChoose: (moment: ConversationMoment) => void;
  relationshipType?: RelationshipType;
}

/**
 * Two practical starting points for a reader who has reached the conversation
 * section. These are buttons, not decorative cards: a choice opens and lands
 * on the matching detailed guide below.
 */
export function ConversationMomentMap({ onChoose, relationshipType }: ConversationMomentMapProps) {
  const copy = relationshipReportCopy(relationshipType).conversation;
  const visuals = relationshipReportVisuals(relationshipType).conversation;
  const tone: ActionTone = relationshipType === 'romantic' || relationshipType === 'talking' || !relationshipType ? 'romance' : 'accent';
  const repairIcon = tone === 'romance' ? HeartHandshake : Handshake;

  return (
    <SectionActionMap
      title={copy.title}
      helper={copy.helper}
      onChoose={(id) => onChoose(id as ConversationMoment)}
      actions={[
        { id: 'communication', ...copy.open, icon: MessageCircleMore, tone, art: visuals.open },
        { id: 'friction', ...copy.tension, icon: repairIcon, tone, art: visuals.tension },
      ]}
    />
  );
}
