import React, { useMemo, useState } from 'react';
import { Eye, Lock, Sparkles } from 'lucide-react';
import {
  MANTRA_CARD_DECK,
  MANTRA_CATEGORIES,
  getNextLockedMantraCard,
  getUnlockedMantraCards,
} from '../data/mantraCards';
import { MantraCard, MantraCategory } from '../types';
import { getCategoryAccentClass, getCategoryIcon } from './DailyMantraModal';

interface MantraCardDeckProps {
  highestDayReached: number;
  onInspectCard: (card: MantraCard) => void;
}

type CategoryFilter = 'All' | MantraCategory;

export const MantraCardDeck: React.FC<MantraCardDeckProps> = ({
  highestDayReached,
  onInspectCard,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');

  const unlockedCards = useMemo(
    () => getUnlockedMantraCards(highestDayReached),
    [highestDayReached]
  );
  const nextLocked = useMemo(
    () => getNextLockedMantraCard(highestDayReached),
    [highestDayReached]
  );

  const visibleCards = useMemo(() => {
    if (categoryFilter === 'All') return MANTRA_CARD_DECK;
    return MANTRA_CARD_DECK.filter((c) => c.category === categoryFilter);
  }, [categoryFilter]);

  const unlockedPct = Math.round(
    (unlockedCards.length / MANTRA_CARD_DECK.length) * 100
  );

  return (
    <div className="space-y-6">
      {/* Collection Progress Summary Card */}
      <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#f59e0b] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Collectible Mantra Deck</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {unlockedCards.length} of {MANTRA_CARD_DECK.length} Cards Unlocked
            </h2>
          </div>

          <div className="text-xs font-mono-tabular text-zinc-400">
            {nextLocked ? (
              <span>
                Next unlock:{' '}
                <span className="text-white font-semibold">
                  Day {nextLocked.unlockDay}
                </span>{' '}
                ({nextLocked.unlockDay - highestDayReached}{' '}
                {nextLocked.unlockDay - highestDayReached === 1 ? 'day' : 'days'}{' '}
                away)
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">
                Complete 20/20 Master Deck Unlocked
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#e11d48] to-[#f59e0b] transition-all duration-500"
              style={{ width: `${unlockedPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono-tabular text-zinc-500">
            <span>Highest Day Reached: Day {highestDayReached}</span>
            <span>{unlockedPct}% Collected</span>
          </div>
        </div>
      </section>

      {/* Category Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['All', ...MANTRA_CATEGORIES] as CategoryFilter[]).map((cat) => {
          const active = categoryFilter === cat;
          const countInCat =
            cat === 'All'
              ? unlockedCards.length
              : unlockedCards.filter((c) => c.category === cat).length;
          const totalInCat =
            cat === 'All'
              ? MANTRA_CARD_DECK.length
              : MANTRA_CARD_DECK.filter((c) => c.category === cat).length;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`min-h-[44px] px-4 rounded-xl border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-white text-zinc-950 border-white font-semibold'
                  : 'bg-[#111113] text-zinc-400 border-zinc-800/90 hover:text-zinc-100 hover:border-zinc-700'
              }`}
            >
              {cat}{' '}
              <span className="font-mono-tabular opacity-75">
                ({countInCat}/{totalInCat})
              </span>
            </button>
          );
        })}
      </div>

      {/* Collectible Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleCards.map((card) => {
          const isUnlocked = highestDayReached >= card.unlockDay;
          const CategoryIcon = getCategoryIcon(card.category);
          const accentText = getCategoryAccentClass(card.category);
          const unlockProgress = Math.min(
            100,
            Math.round((highestDayReached / card.unlockDay) * 100)
          );

          if (!isUnlocked) {
            return (
              <article
                key={card.id}
                className="bg-[#0d0d0f] border border-zinc-800/70 rounded-2xl p-5 flex flex-col justify-between gap-4 opacity-85"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{card.category}</span>
                  </div>
                  <span className="font-mono-tabular text-zinc-600">
                    #{card.cardNumber}
                  </span>
                </div>

                <div className="py-4 space-y-1.5">
                  <div className="font-display text-xl font-bold text-zinc-500 tracking-wide">
                    Sealed {card.tier} Card
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Reach Day {card.unlockDay} in your 66-day reset to unlock this{' '}
                    {card.category.toLowerCase()} mantra.
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-900 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono-tabular text-zinc-500">
                    <span>Unlocks Day {card.unlockDay}</span>
                    <span>
                      Day {highestDayReached}/{card.unlockDay}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-700"
                      style={{ width: `${unlockProgress}%` }}
                    />
                  </div>
                </div>
              </article>
            );
          }

          const tierBorder =
            card.tier === 'Apex'
              ? 'border-[#f59e0b]/45 hover:border-[#f59e0b]/80'
              : card.tier === 'Vanguard'
              ? 'border-[#e11d48]/40 hover:border-[#e11d48]/70'
              : 'border-zinc-800 hover:border-zinc-600';

          return (
            <article
              key={card.id}
              className={`bg-[#111113] border ${tierBorder} rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#09090b] border border-zinc-800 flex items-center justify-center shrink-0">
                    <CategoryIcon className={`w-4 h-4 ${accentText}`} />
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${accentText}`}>
                      {card.category}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono-tabular">
                      {card.tier} · Day {card.unlockDay}
                    </div>
                  </div>
                </div>
                <span className="font-mono-tabular text-xs font-semibold text-zinc-500">
                  #{card.cardNumber}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  “{card.mantra}”
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-emerald-400 font-medium">
                  Unlocked
                </span>
                <button
                  type="button"
                  onClick={() => onInspectCard(card)}
                  className="min-h-[38px] px-3 rounded-lg bg-[#09090b] border border-zinc-800 hover:border-zinc-600 text-xs font-medium text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Card</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
