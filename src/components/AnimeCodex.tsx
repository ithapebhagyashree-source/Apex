import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Maximize2,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import {
  ANIME_CODEX_CHARACTERS,
  AnimeCharacterProfile,
  isCharacterUnlocked,
  resolveHabitCharacterId,
} from '../data/animeCharacters';
import { AppState, HabitCategory } from '../types';
import { AnimeHabitCharacter } from './AnimeHabitCharacter';

interface AnimeCodexProps {
  state: AppState;
}

type CodexFilter = 'All' | 'Habit' | 'Achievement' | HabitCategory;

const CODEX_FILTERS: { value: CodexFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Habit', label: 'Habits' },
  { value: 'Achievement', label: 'Achievements' },
  { value: 'Fitness', label: 'Fitness' },
  { value: 'Focus', label: 'Focus' },
  { value: 'Mindset', label: 'Mindset' },
  { value: 'Detox', label: 'Detox' },
  { value: 'Nutrition', label: 'Nutrition' },
  { value: 'Sleep', label: 'Sleep' },
];

export const AnimeCodex: React.FC<AnimeCodexProps> = ({ state }) => {
  const [filter, setFilter] = useState<CodexFilter>('All');
  const [galleryCharId, setGalleryCharId] = useState<string | null>(null);
  const [powerUpSignal, setPowerUpSignal] = useState(0);

  const enrichedCharacters = useMemo(() => {
    return ANIME_CODEX_CHARACTERS.map((char) => {
      const unlocked = isCharacterUnlocked(char, state);
      const linkedHabits =
        char.kind === 'Habit'
          ? state.habits.filter((h) => resolveHabitCharacterId(h) === char.id)
          : [];
      return {
        ...char,
        unlocked,
        linkedHabits,
      };
    });
  }, [state]);

  const unlockedList = useMemo(
    () => enrichedCharacters.filter((c) => c.unlocked),
    [enrichedCharacters]
  );

  const filteredCharacters = useMemo(() => {
    if (filter === 'All') return enrichedCharacters;
    if (filter === 'Habit' || filter === 'Achievement') {
      return enrichedCharacters.filter((c) => c.kind === filter);
    }
    return enrichedCharacters.filter((c) => c.habitCategory === filter);
  }, [enrichedCharacters, filter]);

  const activeGalleryIndex = useMemo(() => {
    if (!galleryCharId) return -1;
    return unlockedList.findIndex((c) => c.id === galleryCharId);
  }, [galleryCharId, unlockedList]);

  const activeGalleryChar =
    activeGalleryIndex >= 0 ? unlockedList[activeGalleryIndex] : null;

  const handlePrevGallery = () => {
    if (unlockedList.length <= 1 || activeGalleryIndex < 0) return;
    const prevIdx =
      (activeGalleryIndex - 1 + unlockedList.length) % unlockedList.length;
    setGalleryCharId(unlockedList[prevIdx].id);
  };

  const handleNextGallery = () => {
    if (unlockedList.length <= 1 || activeGalleryIndex < 0) return;
    const nextIdx = (activeGalleryIndex + 1) % unlockedList.length;
    setGalleryCharId(unlockedList[nextIdx].id);
  };

  const openFullScreenGallery = (char?: AnimeCharacterProfile) => {
    const target = char ?? unlockedList[0];
    if (!target) return;
    setGalleryCharId(target.id);
    setPowerUpSignal((n) => n + 1);
  };

  const unlockedPct = Math.round(
    (unlockedList.length / ANIME_CODEX_CHARACTERS.length) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-zinc-400 font-mono-tabular">
            {unlockedList.length}/{ANIME_CODEX_CHARACTERS.length} Characters
            Unlocked ({unlockedPct}%)
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Anime Codex &amp; Character Gallery
          </h1>
        </div>

        <button
          type="button"
          disabled={unlockedList.length === 0}
          onClick={() => openFullScreenGallery()}
          className="min-h-[44px] px-5 rounded-xl bg-[#e11d48] hover:bg-[#be123c] disabled:opacity-40 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
        >
          <Maximize2 className="w-4 h-4" />
          <span>Full-Screen Gallery</span>
        </button>
      </div>

      {/* Progress Strip */}
      <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-300 font-medium">
            Habit Heroes &amp; Achievement Guardians
          </span>
          <span className="font-mono-tabular text-[#f59e0b] font-semibold">
            {unlockedList.length} / {ANIME_CODEX_CHARACTERS.length} Collected
          </span>
        </div>
        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#e11d48] to-[#f59e0b] transition-all duration-500"
            style={{ width: `${unlockedPct}%` }}
          />
        </div>
      </section>

      {/* Category Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CODEX_FILTERS.map((opt) => {
          const active = filter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={`min-h-[44px] px-4 rounded-xl border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-white text-zinc-950 border-white font-semibold'
                  : 'bg-[#111113] text-zinc-400 border-zinc-800/90 hover:text-zinc-100 hover:border-zinc-700'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Character Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCharacters.map((char) => {
          if (!char.unlocked) {
            return (
              <article
                key={char.id}
                className="bg-[#0d0d0f] border border-zinc-800/75 rounded-2xl p-5 flex flex-col justify-between gap-4 opacity-85"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-16 h-16 rounded-xl bg-[#09090b] border border-zinc-800 flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6 text-zinc-600" />
                  </div>
                  <div className="text-right text-xs font-mono-tabular text-zinc-500">
                    <div>{char.kind}</div>
                    <div className="text-zinc-600">{char.habitCategory}</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="font-display text-2xl font-bold text-zinc-500">
                    Locked Character
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Unlock condition: {char.unlockRequirement}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-900 text-[11px] font-mono-tabular text-zinc-500">
                  Sealed in Codex
                </div>
              </article>
            );
          }

          return (
            <article
              key={char.id}
              className="bg-[#111113] border border-zinc-800/90 hover:border-zinc-600 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <AnimeHabitCharacter
                  characterId={char.id}
                  checked={char.linkedHabits.some((h) =>
                    state.todayCheckedIds.includes(h.id)
                  )}
                  size="lg"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-xs font-mono-tabular text-[#f59e0b] font-semibold">
                    {char.habitCategory} · {char.kind}
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white leading-tight">
                    {char.name}
                  </h2>
                  <div className="text-xs text-zinc-400">{char.epithet}</div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {char.bio}
              </p>

              <div className="space-y-2.5 pt-3 border-t border-zinc-800/80">
                <div className="text-xs text-zinc-400 flex items-center justify-between gap-2">
                  <span className="truncate">
                    Signature:{' '}
                    <span className="text-zinc-200 font-medium">
                      {char.signatureMove}
                    </span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => openFullScreenGallery(char)}
                  className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#09090b] border border-zinc-800 hover:border-[#e11d48]/60 text-xs font-semibold text-zinc-200 hover:text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Inspect Full Screen</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Full-Screen Character Gallery Lightbox */}
      {activeGalleryChar && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Anime Codex Full-Screen Gallery: ${activeGalleryChar.name}`}
          className="fixed inset-0 z-50 bg-[#09090b]/98 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 overflow-y-auto"
        >
          {/* Top Gallery Controls */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono-tabular text-zinc-400">
              <Sparkles className="w-4 h-4 text-[#f59e0b]" />
              <span>
                Anime Codex · {activeGalleryIndex + 1} / {unlockedList.length}{' '}
                Unlocked
              </span>
            </div>

            <button
              type="button"
              onClick={() => setGalleryCharId(null)}
              aria-label="Close Full-Screen Gallery"
              className="min-h-[44px] min-w-[44px] rounded-xl border border-zinc-800 bg-[#111113] flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Character Showcase */}
          <div className="w-full max-w-4xl mx-auto my-auto py-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-6 flex flex-col items-center justify-center space-y-5">
              <AnimeHabitCharacter
                characterId={activeGalleryChar.id}
                checked={true}
                size="xl"
                powerUpSignal={powerUpSignal}
              />

              <button
                type="button"
                onClick={() => setPowerUpSignal((n) => n + 1)}
                className="min-h-[44px] px-5 rounded-xl bg-[#e11d48]/15 border border-[#e11d48]/50 hover:bg-[#e11d48]/25 text-xs sm:text-sm font-semibold text-white flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Zap className="w-4 h-4 text-[#f59e0b]" />
                <span>Trigger Power-Up Aura</span>
              </button>
            </div>

            <div className="md:col-span-6 bg-[#111113] border border-zinc-800 rounded-2xl p-6 space-y-5">
              <div className="space-y-1">
                <div className="text-xs font-mono-tabular text-[#f59e0b] font-semibold">
                  {activeGalleryChar.habitCategory} · {activeGalleryChar.kind}
                </div>
                <h2 className="font-display text-4xl font-bold text-white tracking-tight">
                  {activeGalleryChar.name} — {activeGalleryChar.epithet}
                </h2>
              </div>

              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
                {activeGalleryChar.bio}
              </p>

              <dl className="divide-y divide-zinc-800/80 text-xs sm:text-sm">
                <div className="py-2.5 flex items-center justify-between gap-3">
                  <dt className="text-zinc-500">Category</dt>
                  <dd className="text-white font-semibold">
                    {activeGalleryChar.habitCategory}
                  </dd>
                </div>
                <div className="py-2.5 flex items-center justify-between gap-3">
                  <dt className="text-zinc-500">Signature Technique</dt>
                  <dd className="text-[#f59e0b] font-semibold">
                    {activeGalleryChar.signatureMove}
                  </dd>
                </div>
                <div className="py-2.5 flex items-center justify-between gap-3">
                  <dt className="text-zinc-500">Unlock Source</dt>
                  <dd className="text-zinc-200 text-right">
                    {activeGalleryChar.unlockRequirement}
                  </dd>
                </div>
                {activeGalleryChar.linkedHabits.length > 0 && (
                  <div className="py-2.5 space-y-1">
                    <dt className="text-zinc-500">Active Linked Habits</dt>
                    <dd className="text-emerald-400 font-medium">
                      {activeGalleryChar.linkedHabits
                        .map((h) => h.title)
                        .join(' · ')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Bottom Prev / Next Gallery Carousel Controls */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-3 pt-4 border-t border-zinc-900">
            <button
              type="button"
              disabled={unlockedList.length <= 1}
              onClick={handlePrevGallery}
              className="min-h-[46px] px-4 rounded-xl border border-zinc-800 bg-[#111113] hover:border-zinc-700 disabled:opacity-35 text-xs sm:text-sm font-medium text-zinc-200 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto">
              {unlockedList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGalleryCharId(item.id)}
                  className={`min-h-[36px] px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    item.id === activeGalleryChar.id
                      ? 'bg-[#e11d48] text-white font-semibold'
                      : 'bg-[#111113] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={unlockedList.length <= 1}
              onClick={handleNextGallery}
              className="min-h-[46px] px-4 rounded-xl border border-zinc-800 bg-[#111113] hover:border-zinc-700 disabled:opacity-35 text-xs sm:text-sm font-medium text-zinc-200 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
