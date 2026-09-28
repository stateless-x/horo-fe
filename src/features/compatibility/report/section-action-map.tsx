import type { LucideIcon } from 'lucide-react';

type ActionTone = 'accent' | 'romance' | 'success' | 'warn';

export interface SectionAction {
  id: string;
  tag: string;
  title: string;
  detail: string;
  icon: LucideIcon;
  tone: ActionTone;
}

interface SectionActionMapProps {
  title: string;
  helper: string;
  actions: SectionAction[];
  onChoose: (id: string) => void;
}

const TONE_CLASSES: Record<ActionTone, { chip: string; icon: string; card: string }> = {
  accent: {
    chip: 'text-ink',
    icon: 'bg-surface2 text-ink',
    card: 'border-edge bg-surface hover:border-ink/20 hover:bg-surface2/55',
  },
  romance: {
    chip: 'text-romanceText',
    icon: 'bg-romance/10 text-romanceText',
    card: 'border-romance/20 bg-romance/[0.035] hover:border-romance/40 hover:bg-romance/[0.07]',
  },
  success: {
    chip: 'text-success',
    icon: 'bg-success/[0.1] text-success',
    card: 'border-success/20 bg-success/[0.035] hover:border-success/40 hover:bg-success/[0.07]',
  },
  warn: {
    chip: 'text-warn',
    icon: 'bg-warn/[0.1] text-warn',
    card: 'border-warn/20 bg-warn/[0.035] hover:border-warn/40 hover:bg-warn/[0.07]',
  },
};

/** A lightweight decision point at the start of each report tab. It always scrolls to real reading content. */
export function SectionActionMap({ title, helper, actions, onChoose }: SectionActionMapProps) {
  const hasThreeActions = actions.length === 3;

  return (
    <section aria-labelledby={`action-map-${title}`} className="border-y border-edge py-4 sm:py-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={`action-map-${title}`} className="font-heading text-lg font-semibold leading-snug text-ink">
          {title}
        </h3>
        <p className="shrink-0 text-xs leading-relaxed text-inkMuted">{helper}</p>
      </div>
      <div className={`mt-3 grid grid-cols-2 gap-3 sm:gap-4 ${hasThreeActions ? 'min-[720px]:grid-cols-3' : ''}`}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          const tone = TONE_CLASSES[action.tone];
          const spansPhoneRow = hasThreeActions && index === 2;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onChoose(action.id)}
              className={`group min-h-[140px] rounded-2xl border px-3 py-3.5 text-left transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(107,33,168,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright active:translate-y-0 sm:min-h-[152px] sm:px-4 ${tone.card} ${spansPhoneRow ? 'col-span-2 min-[720px]:col-span-1' : ''}`}
            >
              <span className={`grid size-8 place-items-center rounded-xl ${tone.icon}`}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className={`mt-3 block font-heading text-xs font-semibold ${tone.chip}`}>{action.tag}</span>
              <span className="mt-1.5 block text-balance font-heading text-base font-semibold leading-snug text-ink sm:text-lg">
                {action.title}
              </span>
              <span className="mt-1 block max-w-[24ch] text-sm leading-relaxed text-inkMuted">
                {action.detail}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
