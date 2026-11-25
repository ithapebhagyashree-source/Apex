import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { AppState, HabitCategory, ModuleTab } from '../types';
import { getLocalDateKey } from '../utils/storage';

const CATEGORY_ORDER: HabitCategory[] = [
  'Focus',
  'Fitness',
  'Nutrition',
  'Sleep',
  'Mindset',
  'Detox',
];

const CATEGORY_META: Record<
  HabitCategory,
  { stroke: string; textClass: string; barClass: string }
> = {
  Focus: {
    stroke: '#38bdf8',
    textClass: 'text-sky-400',
    barClass: 'bg-sky-400',
  },
  Fitness: {
    stroke: '#e11d48',
    textClass: 'text-[#fb7185]',
    barClass: 'bg-[#e11d48]',
  },
  Nutrition: {
    stroke: '#10b981',
    textClass: 'text-emerald-400',
    barClass: 'bg-emerald-400',
  },
  Sleep: {
    stroke: '#a78bfa',
    textClass: 'text-violet-400',
    barClass: 'bg-violet-400',
  },
  Mindset: {
    stroke: '#f59e0b',
    textClass: 'text-[#f59e0b]',
    barClass: 'bg-[#f59e0b]',
  },
  Detox: {
    stroke: '#fb7185',
    textClass: 'text-rose-400',
    barClass: 'bg-rose-400',
  },
};

interface CategoryWeeklyStat {
  category: HabitCategory;
  habitCount: number;
  completedChecks: number;
  possibleChecks: number;
  ratePct: number;
  dailyRatios: number[]; // 7 entries: oldest -> today (0..1)
  doneToday: boolean;
}

interface WeeklyCategoryGaugesCardProps {
  state: AppState;
  onOpenHeatmap: (tab: ModuleTab) => void;
}

export const WeeklyCategoryGaugesCard: React.FC<
  WeeklyCategoryGaugesCardProps
> = ({ state, onOpenHeatmap }) => {
  const { stats, overallRatePct, totalCompletedChecks, totalPossibleChecks } =
    useMemo(() => {
      const now = new Date();
      const todayKey = getLocalDateKey(now);

      // Build trailing 7 local date keys (oldest -> today)
      const last7Keys: string[] = [];
      for (let offset = 6; offset >= 0; offset--) {
        const d = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - offset
        );
        last7Keys.push(getLocalDateKey(d));
      }

      // Map each date key to the set of completed habit IDs recorded on that day
      const completedByDate = new Map<string, Set<string>>();
      for (const key of last7Keys) {
        completedByDate.set(key, new Set<string>());
      }

      for (const entry of state.history) {
        const bucket = completedByDate.get(entry.date);
        if (!bucket) continue;
        for (const id of entry.completedHabitIds ?? []) {
          bucket.add(id);
        }
      }

      // Include live checked habits for today
      const todayBucket = completedByDate.get(todayKey);
      if (todayBucket) {
        for (const id of state.todayCheckedIds) {
          todayBucket.add(id);
        }
      }

      let aggCompleted = 0;
      let aggPossible = 0;

      const computed: CategoryWeeklyStat[] = CATEGORY_ORDER.map((category) => {
        const catHabits = state.habits.filter((h) => h.category === category);
        const habitCount = catHabits.length;

        if (habitCount === 0) {
          return {
            category,
            habitCount: 0,
            completedChecks: 0,
            possibleChecks: 0,
            ratePct: 0,
            dailyRatios: last7Keys.map(() => 0),
            doneToday: false,
          };
        }

        let completedChecks = 0;
        const dailyRatios = last7Keys.map((key) => {
          const doneSet = completedByDate.get(key) ?? new Set<string>();
          const hits = catHabits.filter((h) => doneSet.has(h.id)).length;
          completedChecks += hits;
          return hits / habitCount;
        });

        const possibleChecks = habitCount * 7;
        aggCompleted += completedChecks;
        aggPossible += possibleChecks;

        const ratePct = Math.min(
          100,
          Math.round((completedChecks / possibleChecks) * 100)
        );
        const doneToday = dailyRatios[dailyRatios.length - 1] >= 1;

        return {
          category,
          habitCount,
          completedChecks,
          possibleChecks,
          ratePct,
          dailyRatios,
          doneToday,
        };
      });

      const overall =
        aggPossible > 0
          ? Math.min(100, Math.round((aggCompleted / aggPossible) * 100))
          : 0;

      return {
        stats: computed,
        overallRatePct: overall,
        totalCompletedChecks: aggCompleted,
        totalPossibleChecks: aggPossible,
      };
    }, [state.habits, state.history, state.todayCheckedIds]);

  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  return (
    <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs text-zinc-400 font-mono-tabular">
            Rolling 7-Day Consistency · {totalCompletedChecks}/{totalPossibleChecks}{' '}
            Checks ({overallRatePct}%)
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Weekly Habit Completion Rate
          </h2>
        </div>

        <button
          type="button"
          onClick={() => onOpenHeatmap('habits')}
          className="min-h-[40px] px-3 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-[#09090b] text-xs font-medium text-zinc-300 hover:text-white inline-flex items-center gap-1 self-start sm:self-auto transition-colors whitespace-nowrap shrink-0"
        >
          <span>Compare with 66-Day Heatmap</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      </div>

      {/* 6 Category Radial Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((item) => {
          const meta = CATEGORY_META[item.category];
          const dashOffset = circumference * (1 - item.ratePct / 100);
          const hasHabits = item.habitCount > 0;

          return (
            <button
              key={item.category}
              type="button"
              onClick={() => onOpenHeatmap('habits')}
              aria-label={`${item.category} weekly completion rate ${
                hasHabits ? `${item.ratePct}%` : 'no active habits'
              }`}
              className="group p-4 rounded-xl bg-[#09090b] border border-zinc-800/80 hover:border-zinc-700 flex flex-col items-center text-center gap-2.5 transition-colors"
            >
              {/* Small Radial SVG Gauge */}
              <div className="relative w-[76px] h-[76px] flex items-center justify-center">
                <svg
                  viewBox="0 0 76 76"
                  className="w-full h-full -rotate-90"
                  aria-hidden="true"
                >
                  <circle
                    cx="38"
                    cy="38"
                    r={radius}
                    fill="none"
                    stroke="#18181b"
                    strokeWidth="6.5"
                  />
                  {hasHabits && (
                    <circle
                      cx="38"
                      cy="38"
                      r={radius}
                      fill="none"
                      stroke={meta.stroke}
                      strokeWidth="6.5"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      className="transition-[stroke-dashoffset] duration-500 ease-out"
                    />
                  )}
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`font-mono-tabular text-sm font-bold ${
                      hasHabits ? 'text-white' : 'text-zinc-600'
                    }`}
                  >
                    {hasHabits ? `${item.ratePct}%` : '—'}
                  </span>
                </div>
              </div>

              {/* Category Label & Count */}
              <div className="space-y-0.5 w-full">
                <div
                  className={`text-sm font-semibold truncate ${
                    hasHabits ? meta.textClass : 'text-zinc-500'
                  }`}
                >
                  {item.category}
                </div>
                <div className="text-[11px] font-mono-tabular text-zinc-400">
                  {hasHabits
                    ? `${item.completedChecks}/${item.possibleChecks} · ${
                        item.doneToday ? 'Done today' : 'Pending'
                      }`
                    : 'No habits'}
                </div>
              </div>

              {/* 7-Day Micro Trend Strip (Oldest -> Today) */}
              <div
                className="w-full grid grid-cols-7 gap-1 pt-1"
                aria-hidden="true"
              >
                {item.dailyRatios.map((ratio, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-colors ${
                      ratio >= 1
                        ? meta.barClass
                        : ratio > 0
                          ? `${meta.barClass} opacity-45`
                          : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
