import React from 'react';
import {
  Brain,
  Check,
  Compass,
  Crosshair,
  Dumbbell,
  Flame,
  Layers,
  Shuffle,
  X,
} from 'lucide-react';
import { MANTRA_CARD_DECK } from '../data/mantraCards';
import { MantraCard, MantraCategory } from '../types';

interface DailyMantraModalProps {
  isOpen: boolean;
  card: MantraCard;
  currentDay: number;
  unlockedCount: number;
  onAccept: () => void;
  onDrawAnother: () => void;
  onOpenDeck: () => void;
}

export function getCategoryIcon(category: MantraCategory) {
  switch (category) {
    case 'Confidence':
      return Compass;
    case 'Strength':
      return Dumbbell;
    case 'Discipline':
      return Flame;
    case 'Wisdom':
      return Brain;
    case 'Focus':
      return Crosshair;
  }
}

export function getCategoryAccentClass(category: MantraCategory): string {
  switch (category) {
    case 'Confidence':
      return 'text-[#f59e0b]';
    case 'Strength':
      return 'text-[#fb7185]';
    case 'Discipline':
      return 'text-[#e11d48]';
    case 'Wisdom':
      return 'text-sky-400';
    case 'Focus':
      return 'text-emerald-400';
  }
}

export const DailyMantraModal: React.FC<DailyMantraModalProps> = ({
  isOpen,
  card,
  currentDay,
  unlockedCount,
  onAccept,
  onDrawAnother,
  onOpenDeck,
}) => {
  if (!isOpen) return null;

  const CategoryIcon = getCategoryIcon(card.category);
  const accentText = getCategoryAccentClass(card.category);
  const isApex = card.tier === 'Apex';
  const isVanguard = card.tier === 'Vanguard';

  const cardBorderClass = isApex
    ? 'border-[#f59e0b]/60'
    : isVanguard
    ? 'border-[#e11d48]/50'
    : 'border-zinc-700/90';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Daily Session Mantra Card"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="w-full max-w-md space-y-4 my-auto">
        {/* Top Context Strip */}
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span className="font-mono-tabular">
            Daily Session Mantra · Day {currentDay}
          </span>
          <button
            type="button"
            onClick={onAccept}
            aria-label="Close Daily Mantra"
            className="min-h-[40px] min-w-[40px] rounded-xl border border-zinc-800 bg-[#111113] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Collectible Mantra Card */}
        <article
          className={`bg-[#111113] border ${cardBorderClass} rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden`}
        >
          {/* Subtle top metallic hairline sheen */}
          <div
            aria-hidden="true"
            className={`absolute top-0 left-0 right-0 h-px ${
              isApex
                ? 'bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent'
                : 'bg-gradient-to-r from-transparent via-[#e11d48]/80 to-transparent'
            }`}
          />

          {/* Card Header Metadata */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#09090b] border border-zinc-800 flex items-center justify-center shrink-0">
                <CategoryIcon className={`w-4 h-4 ${accentText}`} />
              </div>
              <div>
                <div className={`text-xs font-semibold ${accentText}`}>
                  {card.category}
                </div>
                <div className="text-[11px] text-zinc-500 font-mono-tabular">
                  {card.tier} Tier · Unlocked Day {card.unlockDay}
                </div>
              </div>
            </div>

            <div className="font-mono-tabular text-xs font-bold text-zinc-400">
              #{card.cardNumber}/{MANTRA_CARD_DECK.length}
            </div>
          </div>

          {/* Center Emblem & Mantra */}
          <div className="py-3 space-y-4">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
              {card.title}
            </h2>
            <p className="text-base sm:text-lg font-medium text-zinc-100 leading-relaxed">
              “{card.mantra}”
            </p>
          </div>

          {/* Concrete Session Directive */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-1">
            <div className="text-[11px] font-semibold text-zinc-500">
              Session Directive
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {card.directive}
            </p>
          </div>

          {/* Primary CTA */}
          <div className="pt-1 space-y-2.5">
            <button
              type="button"
              onClick={onAccept}
              className="w-full min-h-[50px] px-5 rounded-xl bg-[#e11d48] hover:bg-[#be123c] active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Lock In Mantra &amp; Start Session</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onDrawAnother}
                className="min-h-[44px] px-3 rounded-xl bg-[#09090b] border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Draw Unlocked</span>
              </button>
              <button
                type="button"
                onClick={onOpenDeck}
                className="min-h-[44px] px-3 rounded-xl bg-[#09090b] border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Layers className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>
                  Deck ({unlockedCount}/{MANTRA_CARD_DECK.length})
                </span>
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
