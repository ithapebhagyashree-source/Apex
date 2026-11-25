import React, { useState } from 'react';
import {
  Calendar,
  Check,
  Edit3,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  getCharacterProfileById,
  resolveHabitCharacterId,
} from '../data/animeCharacters';
import { AppState, Habit, HabitCategory, SeasonalArcId } from '../types';
import { HABIT_XP, TOTAL_RESET_DAYS } from '../utils/storage';
import { AnimeHabitCharacter } from './AnimeHabitCharacter';
import { SeasonalArcsHub } from './SeasonalArcsHub';

interface HabitsAndHeatmapProps {
  state: AppState;
  onToggleHabit: (habitId: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'xpValue'>) => void;
  onUpdateHabit: (
    id: string,
    updates: { title: string; category: HabitCategory; targetDetail: string }
  ) => void;
  onDeleteHabit: (id: string) => void;
  onToggleArcActive: (arcId: SeasonalArcId) => void;
  onLogArcDay: (arcId: SeasonalArcId) => void;
  onRestartArc: (arcId: SeasonalArcId) => void;
  onOpenCodex?: () => void;
}

const CATEGORIES: HabitCategory[] = [
  'Focus',
  'Fitness',
  'Nutrition',
  'Sleep',
  'Mindset',
  'Detox',
];

export const HabitsAndHeatmap: React.FC<HabitsAndHeatmapProps> = ({
  state,
  onToggleHabit,
  onAddHabit,
  onUpdateHabit,
  onDeleteHabit,
  onToggleArcActive,
  onLogArcDay,
  onRestartArc,
  onOpenCodex,
}) => {
  const [selectedDayNum, setSelectedDayNum] = useState<number>(state.currentDay);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<HabitCategory>('Focus');
  const [formDetail, setFormDetail] = useState('');

  const openAddForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormCategory('Focus');
    setFormDetail('');
    setIsAdding(true);
  };

  const openEditForm = (habit: Habit) => {
    setIsAdding(false);
    setEditingId(habit.id);
    setFormTitle(habit.title);
    setFormCategory(habit.category);
    setFormDetail(habit.targetDetail);
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormTitle('');
    setFormDetail('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = formTitle.trim();
    if (!trimmed) return;
    const detail = formDetail.trim() || 'Daily non-negotiable standard';

    if (editingId) {
      onUpdateHabit(editingId, {
        title: trimmed,
        category: formCategory,
        targetDetail: detail,
      });
    } else {
      onAddHabit({
        title: trimmed,
        category: formCategory,
        targetDetail: detail,
      });
    }
    closeForm();
  };

  const checkedCount = state.habits.filter((h) =>
    state.todayCheckedIds.includes(h.id)
  ).length;
  const totalCount = state.habits.length;
  const todayPct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const daysArray = Array.from({ length: TOTAL_RESET_DAYS }, (_, i) => i + 1);

  const getDayStatus = (
    dayNum: number
  ): 'completed' | 'frozen' | 'current' | 'missed' | 'upcoming' => {
    if (state.completedDays.includes(dayNum)) return 'completed';
    if ((state.frozenDays ?? []).includes(dayNum)) return 'frozen';
    if (dayNum === state.currentDay) return 'current';
    if (state.missedDays.includes(dayNum) || dayNum < state.currentDay) return 'missed';
    return 'upcoming';
  };

  const selectedDayStatus = getDayStatus(selectedDayNum);
  const selectedDayHistory = state.history.find((h) => h.dayNumber === selectedDayNum);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs text-zinc-400">
            Auto-resets at midnight · +{HABIT_XP} XP per habit
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Daily Non-Negotiables &amp; 66-Day Grid
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenCodex && (
            <button
              type="button"
              onClick={onOpenCodex}
              className="min-h-[44px] px-3.5 rounded-xl bg-[#111113] border border-zinc-800 hover:border-[#f59e0b]/60 text-zinc-200 hover:text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#f59e0b]" />
              <span>Anime Codex</span>
            </button>
          )}
          <button
            type="button"
            onClick={openAddForm}
            className="min-h-[44px] px-4 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Form Drawer Card */}
      {(isAdding || editingId) && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-[#111113] border border-zinc-700 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              {editingId ? 'Edit Non-Negotiable Habit' : 'New Non-Negotiable Habit'}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              aria-label="Close form"
              className="min-h-[40px] min-w-[40px] rounded-lg flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="sm:col-span-2 block space-y-1.5">
              <span className="text-xs font-medium text-zinc-400">Habit Title</span>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g., Cold Shower or Read 20 Pages"
                maxLength={64}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#09090b] border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#e11d48]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-zinc-400">Category</span>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as HabitCategory)}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#09090b] border border-zinc-800 text-sm text-white focus:outline-none focus:border-[#e11d48]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-zinc-400">
              Standard / Target Detail
            </span>
            <input
              type="text"
              value={formDetail}
              onChange={(e) => setFormDetail(e.target.value)}
              placeholder="e.g., No phone in the room while completing"
              maxLength={100}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#09090b] border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#e11d48]"
            />
          </label>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={closeForm}
              className="min-h-[44px] px-4 rounded-xl border border-zinc-800 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-sm font-semibold text-white transition-colors"
            >
              {editingId ? 'Save Changes' : 'Add Habit'}
            </button>
          </div>
        </form>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Daily Checklist */}
        <section className="lg:col-span-6 bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Day {state.currentDay} Checklist
              </h2>
              <p className="text-xs text-zinc-400 font-mono-tabular">
                {checkedCount} of {totalCount} completed · {todayPct}%
              </p>
            </div>
            <div className="text-right font-mono-tabular">
              <div className="text-xs text-zinc-500">Earned Today</div>
              <div className="text-sm font-bold text-emerald-400">
                +{checkedCount * HABIT_XP} XP
              </div>
            </div>
          </div>

          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${todayPct}%` }}
            />
          </div>

          {state.habits.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-sm text-zinc-400">
                No habits configured yet. Add your first non-negotiable habit.
              </p>
              <button
                type="button"
                onClick={openAddForm}
                className="min-h-[44px] px-4 rounded-xl bg-[#e11d48] text-white text-sm font-semibold"
              >
                Create First Habit
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {state.habits.map((habit) => {
                const checked = state.todayCheckedIds.includes(habit.id);
                const charId = resolveHabitCharacterId(habit);
                const charProfile = getCharacterProfileById(charId);
                return (
                  <div
                    key={habit.id}
                    className="py-3 flex items-center justify-between gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleHabit(habit.id)}
                      className="flex-1 min-h-[60px] flex items-center gap-3 text-left group min-w-0"
                    >
                      <div
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                          checked
                            ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                            : 'border-zinc-700 bg-[#09090b] group-hover:border-zinc-500'
                        }`}
                      >
                        {checked && <Check className="w-4 h-4" strokeWidth={3} />}
                      </div>

                      <AnimeHabitCharacter
                        characterId={charId}
                        checked={checked}
                        size="md"
                      />

                      <div className="min-w-0 space-y-0.5">
                        <div
                          className={`text-sm sm:text-base font-medium leading-snug ${
                            checked
                              ? 'text-zinc-500 line-through'
                              : 'text-zinc-100 group-hover:text-white'
                          }`}
                        >
                          {habit.title}
                        </div>
                        <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-1.5">
                          <span className="text-[#f59e0b]">{habit.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-zinc-300 font-medium">
                            {charProfile.name}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{habit.targetDetail}</span>
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditForm(habit)}
                        aria-label={`Edit ${habit.title}`}
                        className="min-h-[44px] min-w-[40px] rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteHabit(habit.id)}
                        aria-label={`Delete ${habit.title}`}
                        className="min-h-[44px] min-w-[40px] rounded-lg flex items-center justify-center text-zinc-500 hover:text-[#fb7185] hover:bg-zinc-800/60 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 66-Day Visual Heatmap Grid */}
        <section className="lg:col-span-6 bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-white">
                66-Day Visual Heatmap
              </h2>
              <p className="text-xs text-zinc-400">
                Tap any square to inspect status
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                <span>Completed</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-sky-400 inline-block" />
                <span>Frozen</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#f59e0b] inline-block" />
                <span>Current</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-zinc-800 inline-block" />
                <span>Upcoming</span>
              </span>
            </div>
          </div>

          {/* 66 Numbered Squares */}
          <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5 sm:gap-2">
            {daysArray.map((dayNum) => {
              const status = getDayStatus(dayNum);
              const isSelected = selectedDayNum === dayNum;

              let tileClasses =
                'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700';
              if (status === 'completed') {
                tileClasses =
                  'bg-emerald-500/90 border-emerald-400/60 text-zinc-950 font-bold';
              } else if (status === 'frozen') {
                tileClasses =
                  'bg-sky-400/90 border-sky-300/70 text-zinc-950 font-bold';
              } else if (status === 'current') {
                tileClasses =
                  'bg-[#f59e0b] border-[#fbbf24] text-zinc-950 font-bold';
              } else if (status === 'missed') {
                tileClasses =
                  'bg-zinc-800/90 border-zinc-700 text-zinc-400';
              }

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => setSelectedDayNum(dayNum)}
                  aria-label={`Day ${dayNum}, status ${status}`}
                  className={`aspect-square min-h-[40px] sm:min-h-[38px] rounded-lg border font-mono-tabular text-xs flex items-center justify-center transition-transform active:scale-95 ${tileClasses} ${
                    isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111113]' : ''
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Selected Day Inspector */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-4 text-sm">
            <div className="space-y-0.5">
              <div className="font-semibold text-white font-mono-tabular">
                Day {selectedDayNum} of {TOTAL_RESET_DAYS}
              </div>
              <div className="text-xs text-zinc-400">
                {selectedDayStatus === 'completed' &&
                  (selectedDayHistory
                    ? `Completed on ${selectedDayHistory.date} · ${selectedDayHistory.completedHabitIds.length}/${selectedDayHistory.totalHabits} habits logged`
                    : 'Completed and locked in.')}
                {selectedDayStatus === 'frozen' &&
                  'Protected via Streak Freeze Token — streak preserved without reset.'}
                {selectedDayStatus === 'current' &&
                  `Active day · ${checkedCount}/${totalCount} habits checked so far`}
                {selectedDayStatus === 'missed' &&
                  'Missed or reset prior to completion'}
                {selectedDayStatus === 'upcoming' &&
                  'Upcoming day in your 66-day protocol'}
              </div>
            </div>

            <span
              className={`text-xs font-semibold shrink-0 ${
                selectedDayStatus === 'completed'
                  ? 'text-emerald-400'
                  : selectedDayStatus === 'frozen'
                  ? 'text-sky-400'
                  : selectedDayStatus === 'current'
                  ? 'text-[#f59e0b]'
                  : 'text-zinc-500'
              }`}
            >
              {selectedDayStatus === 'completed'
                ? 'Completed'
                : selectedDayStatus === 'frozen'
                ? 'Frozen Shield'
                : selectedDayStatus === 'current'
                ? 'In Progress'
                : selectedDayStatus === 'missed'
                ? 'Missed'
                : 'Upcoming'}
            </span>
          </div>

          {/* Recent Daily History Feed */}
          {state.history.length > 0 && (
            <div className="pt-4 border-t border-zinc-800/80 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Recent Daily Log History</span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {state.history.slice(0, 7).map((entry, idx) => (
                  <div
                    key={`${entry.date}-${idx}`}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-900 last:border-0"
                  >
                    <span className="font-mono-tabular text-zinc-300">
                      {entry.date} · Day {entry.dayNumber}
                    </span>
                    <span className="font-mono-tabular text-zinc-400">
                      {entry.completedHabitIds.length}/{entry.totalHabits} habits ·{' '}
                      <span
                        className={
                          entry.frozen
                            ? 'text-sky-400'
                            : entry.dayCompleted
                            ? 'text-emerald-400'
                            : 'text-zinc-500'
                        }
                      >
                        {entry.frozen
                          ? 'Frozen'
                          : entry.dayCompleted
                          ? 'Cleared'
                          : 'Partial'}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Seasonal Arcs & Special Challenges Hub */}
      <SeasonalArcsHub
        state={state}
        onToggleArcActive={onToggleArcActive}
        onLogArcDay={onLogArcDay}
        onRestartArc={onRestartArc}
      />
    </div>
  );
};
