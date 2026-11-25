import React, { useEffect, useMemo, useState } from 'react';
import { Bookmark, Copy, Check, Layers, Shuffle, Sparkles } from 'lucide-react';
import {
  MANTRA_CARD_DECK,
  getUnlockedMantraCards,
} from '../data/mantraCards';
import { LEGEND_QUOTES } from '../data/quotes';
import { LegendQuote, MantraCard, QuoteSpeaker } from '../types';
import { MantraCardDeck } from './MantraCardDeck';

interface QuoteVaultProps {
  pinnedQuoteIds: string[];
  highestDayReached: number;
  initialSubView?: 'quotes' | 'deck';
  onTogglePin: (quoteId: string) => void;
  onOpenDailyMantra: (card?: MantraCard) => void;
}

type FilterOption = 'All' | QuoteSpeaker | 'Pinned';

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'David Goggins', label: 'David Goggins' },
  { value: 'Marcus Aurelius', label: 'Marcus Aurelius' },
  { value: 'Jocko Willink', label: 'Jocko Willink' },
  { value: 'Miyamoto Musashi', label: 'Miyamoto Musashi' },
  { value: 'Pinned', label: 'Pinned' },
];

export const QuoteVault: React.FC<QuoteVaultProps> = ({
  pinnedQuoteIds,
  highestDayReached,
  initialSubView = 'quotes',
  onTogglePin,
  onOpenDailyMantra,
}) => {
  const [subView, setSubView] = useState<'quotes' | 'deck'>(initialSubView);
  const [speakerFilter, setSpeakerFilter] = useState<FilterOption>('All');
  const [spotlightId, setSpotlightId] = useState<string>(LEGEND_QUOTES[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setSubView(initialSubView);
  }, [initialSubView]);

  const unlockedDeckCount = useMemo(
    () => getUnlockedMantraCards(highestDayReached).length,
    [highestDayReached]
  );

  const filteredQuotes = useMemo(() => {
    if (speakerFilter === 'All') return LEGEND_QUOTES;
    if (speakerFilter === 'Pinned') {
      return LEGEND_QUOTES.filter((q) => pinnedQuoteIds.includes(q.id));
    }
    return LEGEND_QUOTES.filter((q) => q.speaker === speakerFilter);
  }, [speakerFilter, pinnedQuoteIds]);

  const spotlightQuote: LegendQuote = useMemo(() => {
    return (
      LEGEND_QUOTES.find((q) => q.id === spotlightId) ?? LEGEND_QUOTES[0]
    );
  }, [spotlightId]);

  const handleRandomStrike = () => {
    const pool = filteredQuotes.length > 1 ? filteredQuotes : LEGEND_QUOTES;
    const candidates = pool.filter((q) => q.id !== spotlightQuote.id);
    const next =
      candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : pool[0];
    if (next) {
      setSpotlightId(next.id);
    }
  };

  const handleCopyQuote = (quote: LegendQuote) => {
    navigator.clipboard?.writeText(`"${quote.text}" — ${quote.speaker}`).catch(() => {
      // Clipboard may be unavailable in restricted contexts
    });
    setCopiedId(quote.id);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === quote.id ? null : prev));
    }, 1500);
  };

  const isSpotlightPinned = pinnedQuoteIds.includes(spotlightQuote.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs text-zinc-400 font-mono-tabular">
            {LEGEND_QUOTES.length} Quotes · {pinnedQuoteIds.length} Pinned
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            War Room &amp; Legends Quote Vault
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenDailyMantra()}
            className="min-h-[44px] px-4 rounded-xl bg-[#111113] border border-zinc-800 hover:border-zinc-600 text-zinc-200 hover:text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-[#f59e0b]" />
            <span>Today&apos;s Mantra</span>
          </button>

          {subView === 'quotes' && (
            <button
              type="button"
              onClick={handleRandomStrike}
              className="min-h-[44px] px-5 rounded-xl bg-[#e11d48] hover:bg-[#be123c] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap"
            >
              <Shuffle className="w-4 h-4" />
              <span>Random Strike</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-View Switcher: Legends Quotes vs Collectible Mantra Card Deck */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#111113] border border-zinc-800/90 max-w-md">
        <button
          type="button"
          onClick={() => setSubView('quotes')}
          className={`min-h-[44px] px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
            subView === 'quotes'
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Legends Quotes ({LEGEND_QUOTES.length})
        </button>
        <button
          type="button"
          onClick={() => setSubView('deck')}
          className={`min-h-[44px] px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
            subView === 'deck'
              ? 'bg-[#e11d48] text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>
            Mantra Deck ({unlockedDeckCount}/{MANTRA_CARD_DECK.length})
          </span>
        </button>
      </div>

      {subView === 'deck' ? (
        <MantraCardDeck
          highestDayReached={highestDayReached}
          onInspectCard={(card) => onOpenDailyMantra(card)}
        />
      ) : (
        <>

      {/* Spotlight Strike Card */}
      <section className="bg-[#111113] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between gap-3 text-xs text-zinc-400">
          <span className="font-medium text-[#f59e0b]">Active Strike</span>
          <span>
            {spotlightQuote.speaker} · {spotlightQuote.context}
          </span>
        </div>

        <blockquote className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight [text-wrap:balance]">
          “{spotlightQuote.text}”
        </blockquote>

        <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-zinc-200">
            {spotlightQuote.speaker}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyQuote(spotlightQuote)}
              className="min-h-[44px] px-3.5 rounded-xl border border-zinc-800 bg-[#09090b] hover:border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              {copiedId === spotlightQuote.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTogglePin(spotlightQuote.id)}
              className={`min-h-[44px] px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                isSpotlightPinned
                  ? 'bg-[#f59e0b]/15 border-[#f59e0b]/50 text-[#f59e0b]'
                  : 'border-zinc-800 bg-[#09090b] text-zinc-300 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Bookmark
                className="w-3.5 h-3.5"
                fill={isSpotlightPinned ? 'currentColor' : 'none'}
              />
              <span>{isSpotlightPinned ? 'Pinned' : 'Pin Quote'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Speaker Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTER_OPTIONS.map((opt) => {
          const active = speakerFilter === opt.value;
          const label =
            opt.value === 'Pinned'
              ? `Pinned (${pinnedQuoteIds.length})`
              : opt.label;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSpeakerFilter(opt.value)}
              className={`min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 border ${
                active
                  ? 'bg-white text-zinc-950 border-white font-semibold'
                  : 'bg-[#111113] text-zinc-400 border-zinc-800/90 hover:text-zinc-100 hover:border-zinc-700'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Quotes Grid */}
      {filteredQuotes.length === 0 ? (
        <div className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-10 text-center space-y-2">
          <div className="text-base font-semibold text-white">
            No pinned quotes yet
          </div>
          <p className="text-sm text-zinc-400">
            Tap the pin icon on any quote to build your personal war room lineup.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuotes.map((quote) => {
            const pinned = pinnedQuoteIds.includes(quote.id);
            const isActiveSpotlight = spotlightQuote.id === quote.id;
            return (
              <article
                key={quote.id}
                className={`bg-[#111113] border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors ${
                  isActiveSpotlight
                    ? 'border-[#e11d48]/50'
                    : 'border-zinc-800/90 hover:border-zinc-700'
                }`}
              >
                <p className="text-sm sm:text-base font-medium text-zinc-100 leading-relaxed">
                  “{quote.text}”
                </p>

                <div className="pt-3 border-t border-zinc-800/70 flex items-center justify-between gap-3">
                  <div className="text-xs text-zinc-400 min-w-0 truncate">
                    <span className="font-semibold text-zinc-200">
                      {quote.speaker}
                    </span>{' '}
                    <span aria-hidden="true">·</span>{' '}
                    <span>{quote.context}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSpotlightId(quote.id)}
                      className="min-h-[40px] px-2.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors whitespace-nowrap"
                    >
                      Focus
                    </button>
                    <button
                      type="button"
                      onClick={() => onTogglePin(quote.id)}
                      aria-label={pinned ? 'Unpin quote' : 'Pin quote'}
                      className={`min-h-[40px] min-w-[40px] rounded-lg flex items-center justify-center transition-colors ${
                        pinned
                          ? 'text-[#f59e0b] bg-[#f59e0b]/10'
                          : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
                      }`}
                    >
                      <Bookmark
                        className="w-4 h-4"
                        fill={pinned ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
        </>
      )}
    </div>
  );
};
