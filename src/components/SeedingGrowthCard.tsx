import React, { useMemo, useState } from 'react';
import {
  Activity,
  Award,
  BookOpen,
  Brain,
  Check,
  Code2,
  Droplets,
  Flame,
  RotateCcw,
  ShieldAlert,
  Sprout,
  TrendingUp,
  Users,
  Wind,
} from 'lucide-react';
import {
  HEALTHY_ACTIVITIES,
  PLANT_STAGES,
  getNextPlantStageInfo,
} from '../data/recoveryCompanion';
import {
  AppState,
  GardenTreeRecord,
  HealthyActivityId,
  PlantStageId,
} from '../types';
import {
  computePatternInsights,
  getBestStreakDays,
  getCurrentCleanStreakDays,
} from '../utils/recoveryInsights';
import { TOTAL_RESET_DAYS, getLocalDateKey } from '../utils/storage';
import { PlantIllustration } from './PlantIllustration';

interface SeedingGrowthCardProps {
  state: AppState;
  onToggleHealthyActivity: (activityId: HealthyActivityId) => void;
  onOpenRelapseModal: () => void;
  onLaunchUrgeBreaker: () => void;
}

const ACTIVITY_ICONS: Record<
  HealthyActivityId,
  React.ComponentType<{ className?: string }>
> = {
  exercise: Activity,
  meditation: Brain,
  study_coding: Code2,
  reading: BookOpen,
  friends: Users,
  cold_water: Droplets,
};

function formatShortDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return dateKey;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const SeedingGrowthCard: React.FC<SeedingGrowthCardProps> = ({
  state,
  onToggleHealthyActivity,
  onOpenRelapseModal,
  onLaunchUrgeBreaker,
}) => {
  const currentStreakDays = getCurrentCleanStreakDays(state);
  const bestStreakDays = getBestStreakDays(state);
  const stageInfo = useMemo(
    () => getNextPlantStageInfo(currentStreakDays),
    [currentStreakDays]
  );
  const insights = useMemo(() => computePatternInsights(state), [state]);

  const [previewStageId, setPreviewStageId] = useState<PlantStageId | null>(null);
  const [selectedGardenTree, setSelectedGardenTree] =
    useState<GardenTreeRecord | null>(null);

  const displayedStage =
    PLANT_STAGES.find((s) => s.id === previewStageId) ?? stageInfo.current;
  const isPreviewingOther =
    previewStageId !== null && previewStageId !== stageInfo.current.id;

  const todayKey = getLocalDateKey();
  const todayLoggedActivityIds = useMemo(() => {
    const set = new Set<HealthyActivityId>();
    for (const log of state.healthyActivityLogs ?? []) {
      if (log.date === todayKey) {
        set.add(log.activityId);
      }
    }
    return set;
  }, [state.healthyActivityLogs, todayKey]);

  const activityCountsById = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of insights.topProtectiveActivity.breakdown) {
      map[item.id] = item.totalDaysLogged;
    }
    return map;
  }, [insights.topProtectiveActivity.breakdown]);

  const gardenArchive = state.gardenArchive ?? [];
  const latestRelapse = (state.relapseLogs ?? [])[0] ?? null;

  return (
    <div className="space-y-6">
      {/* PART 1: Evolving Illustrated Plant & Garden */}
      <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs text-emerald-400 font-medium">
              Seeding Growth &amp; Recovery Companion · Visual Streak Growth
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Living Streak Plant &amp; Garden
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono-tabular text-zinc-400">
            <span>
              Stage {stageInfo.stageIndex + 1} of {PLANT_STAGES.length}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold">
              {stageInfo.current.name} ({stageInfo.current.dayRangeLabel})
            </span>
          </div>
        </div>

        {/* Plant Showcase + Current vs All-Time Best Streak */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Illustrated Botanical Stage Canvas */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-2xl bg-[#09090b] border border-zinc-800/80 p-5 relative">
            <div className="w-full flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span className="font-medium text-zinc-200">
                {displayedStage.name}
              </span>
              <span className="font-mono-tabular text-zinc-500">
                {displayedStage.dayRangeLabel}
              </span>
            </div>

            <div className="w-full h-48 sm:h-52 flex items-center justify-center">
              <PlantIllustration stage={displayedStage.id} size="hero" />
            </div>

            <p className="text-xs text-zinc-400 text-center leading-relaxed max-w-xs mt-1">
              {displayedStage.caption}
            </p>

            {isPreviewingOther && (
              <button
                type="button"
                onClick={() => setPreviewStageId(null)}
                className="mt-3 min-h-[36px] px-3 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-emerald-500/60 text-xs font-medium text-emerald-300 transition-colors whitespace-nowrap"
              >
                Return to Live Stage ({stageInfo.current.name})
              </button>
            )}
          </div>

          {/* Right: Separate Current Streak & All-Time Best Streak + Stage Evolution */}
          <div className="lg:col-span-7 space-y-5">
            {/* Dual Streak Ledger (Unboxed Clean Columns) */}
            <div className="grid grid-cols-2 gap-4 pb-5 border-b border-zinc-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Current Clean Streak</span>
                </div>
                <div className="font-display text-4xl sm:text-5xl font-bold text-white font-mono-tabular leading-none">
                  {currentStreakDays}
                  <span className="text-lg sm:text-xl font-sans font-medium text-zinc-400 ml-1.5">
                    {currentStreakDays === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <div className="text-xs text-emerald-400">
                  Active Stage: {stageInfo.current.name}
                </div>
              </div>

              <div className="space-y-1 pl-4 border-l border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Award className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
                  <span>All-Time Best Streak</span>
                </div>
                <div className="font-display text-4xl sm:text-5xl font-bold text-[#f59e0b] font-mono-tabular leading-none">
                  {bestStreakDays}
                  <span className="text-lg sm:text-xl font-sans font-medium text-zinc-400 ml-1.5">
                    {bestStreakDays === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <div className="text-xs text-zinc-400">
                  Permanent record · Never erased on reset
                </div>
              </div>
            </div>

            {/* Stage Evolution Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium">
                  {stageInfo.next
                    ? `Next Evolution: ${stageInfo.next.name} (${stageInfo.next.dayRangeLabel})`
                    : 'Final Stage Reached: Flourishing Tree'}
                </span>
                <span className="font-mono-tabular text-emerald-400 font-semibold">
                  {stageInfo.next
                    ? `${stageInfo.daysToNext} ${
                        stageInfo.daysToNext === 1 ? 'day' : 'days'
                      } to go`
                    : `${currentStreakDays}/${TOTAL_RESET_DAYS} Days`}
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#f59e0b] transition-all duration-500"
                  style={{ width: `${stageInfo.stageProgressPct}%` }}
                />
              </div>
            </div>

            {/* Interactive 5-Stage Botanical Roadmap */}
            <div className="space-y-2">
              <div className="text-xs text-zinc-400">
                Tap any growth stage to preview its illustration:
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {PLANT_STAGES.map((stage, idx) => {
                  const isLive = stage.id === stageInfo.current.id;
                  const isSelected = displayedStage.id === stage.id;
                  const unlocked = idx <= stageInfo.stageIndex;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() =>
                        setPreviewStageId(
                          stage.id === stageInfo.current.id ? null : stage.id
                        )
                      }
                      aria-pressed={isSelected}
                      className={`min-h-[52px] px-1.5 py-2 rounded-xl border text-center transition-colors flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? 'bg-emerald-500/12 border-emerald-500/60 text-white'
                          : unlocked
                          ? 'bg-[#09090b] border-zinc-800 text-zinc-300 hover:border-zinc-600'
                          : 'bg-[#09090b]/60 border-zinc-800/70 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                      }`}
                    >
                      <span className="text-[11px] font-semibold truncate w-full">
                        {stage.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] font-mono-tabular opacity-80 whitespace-nowrap">
                        {isLive ? 'Live' : `D${stage.minDay}–${stage.maxDay}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mini "My Garden" Archive Row */}
        <div className="pt-5 border-t border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-400 shrink-0" />
              <h3 className="text-sm font-semibold text-white">My Garden</h3>
              <span className="text-xs text-zinc-500 font-mono-tabular">
                · {gardenArchive.length}{' '}
                {gardenArchive.length === 1 ? 'archived plant' : 'archived plants'}
              </span>
            </div>
            {selectedGardenTree && (
              <button
                type="button"
                onClick={() => setSelectedGardenTree(null)}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Close detail
              </button>
            )}
          </div>

          {gardenArchive.length === 0 ? (
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your past grown plants and completed 66-day trees are planted permanently here. Every streak you grow leaves roots in your garden—even if you reset and begin a fresh seed.
            </p>
          ) : (
            <>
              <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1">
                {gardenArchive.map((tree) => {
                  const isInspected = selectedGardenTree?.id === tree.id;
                  return (
                    <button
                      key={tree.id}
                      type="button"
                      onClick={() =>
                        setSelectedGardenTree(isInspected ? null : tree)
                      }
                      className={`shrink-0 w-28 p-2.5 rounded-xl border text-center transition-colors flex flex-col items-center gap-1 ${
                        isInspected
                          ? 'bg-emerald-500/12 border-emerald-500/60'
                          : 'bg-[#09090b] border-zinc-800/90 hover:border-zinc-600'
                      }`}
                    >
                      <PlantIllustration stage={tree.stageId} size="mini" />
                      <div className="text-xs font-semibold text-zinc-100 truncate w-full">
                        {tree.stageName}
                      </div>
                      <div className="text-[11px] font-mono-tabular text-emerald-400">
                        {tree.daysGrown}d · {formatShortDate(tree.archivedDate)}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedGardenTree && (
                <div className="pt-2 text-xs text-zinc-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold text-white">
                    {selectedGardenTree.stageName} ({selectedGardenTree.daysGrown}{' '}
                    {selectedGardenTree.daysGrown === 1 ? 'day' : 'days'})
                  </span>
                  <span aria-hidden="true" className="text-zinc-600">
                    ·
                  </span>
                  <span>
                    Archived {formatShortDate(selectedGardenTree.archivedDate)}
                  </span>
                  <span aria-hidden="true" className="text-zinc-600">
                    ·
                  </span>
                  <span className="text-zinc-400">
                    {selectedGardenTree.outcome === 'completed'
                      ? 'Completed 66-Day Cycle'
                      : selectedGardenTree.trigger
                      ? `Trigger logged: ${selectedGardenTree.trigger}`
                      : 'Reset & replanted'}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* PART 2: Healthy Replacement & Relapse Pattern Tracker */}
      <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">
              1-Tap Daily Replacement Activities · Keep Your Streak Protected
            </div>
            <h2 className="text-lg font-semibold text-white">
              Healthy Replacement &amp; Recovery Tracker
            </h2>
          </div>

          <div className="text-xs font-mono-tabular text-zinc-400">
            <span className="text-emerald-400 font-semibold">
              {todayLoggedActivityIds.size}/{HEALTHY_ACTIVITIES.length}
            </span>{' '}
            logged today
          </div>
        </div>

        {/* 1-Tap Healthy Replacement Activity Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {HEALTHY_ACTIVITIES.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.id];
            const loggedToday = todayLoggedActivityIds.has(activity.id);
            const totalCount = activityCountsById[activity.id] ?? 0;

            return (
              <button
                key={activity.id}
                type="button"
                onClick={() => onToggleHealthyActivity(activity.id)}
                aria-pressed={loggedToday}
                className={`min-h-[64px] p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2.5 active:scale-[0.99] ${
                  loggedToday
                    ? 'bg-emerald-500/12 border-emerald-500/60 text-white'
                    : 'bg-[#09090b] border-zinc-800/90 text-zinc-300 hover:border-zinc-600 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      loggedToday
                        ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                        : 'bg-[#111113] border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {loggedToday ? (
                      <Check className="w-4 h-4" strokeWidth={3} />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold truncate">
                      {activity.label}
                    </div>
                    <div className="text-[11px] font-mono-tabular text-zinc-400 truncate">
                      {loggedToday
                        ? 'Logged today'
                        : totalCount > 0
                        ? `${totalCount} ${totalCount === 1 ? 'day' : 'days'} total`
                        : 'Tap to log'}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Calm Support & Relapse Pattern Strip */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5 text-xs text-zinc-400">
            <div className="text-zinc-200 font-medium">
              Feeling a craving or need to log an honest reset?
            </div>
            <div>
              {latestRelapse
                ? `Last logged trigger: ${latestRelapse.trigger} (${latestRelapse.timeWindow}) · Pattern saved privately offline`
                : 'No shame, no judgment—tagging triggers reveals when you need extra support.'}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onLaunchUrgeBreaker}
              className="min-h-[44px] px-3.5 rounded-xl bg-emerald-500/12 border border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Wind className="w-4 h-4" />
              <span>Breathe Through Urge</span>
            </button>

            <button
              type="button"
              onClick={onOpenRelapseModal}
              className="min-h-[44px] px-3.5 rounded-xl bg-[#09090b] border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Log Slip / Reset</span>
            </button>
          </div>
        </div>
      </section>

      {/* PART 4: Advanced Pattern Insights Card (100% Offline Analytics) */}
      <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">
              100% Offline Pattern Engine · Streaks, Activities &amp; Urge Logs
            </div>
            <h2 className="text-lg font-semibold text-white">
              Advanced Pattern Insights
            </h2>
          </div>

          <div className="text-xs font-mono-tabular text-zinc-500">
            {insights.topProtectiveActivity.totalLogsCount} activity logs ·{' '}
            {insights.triggerAnalysis.totalIncidents} urge/reset events
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 divide-y md:divide-y-0 md:divide-x divide-zinc-800/80">
          {/* Insight 1: Top Protective Activity */}
          <div className="space-y-2.5 pt-1 md:pt-0">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Top Protective Activity</span>
            </div>

            {insights.topProtectiveActivity.hasData &&
            insights.topProtectiveActivity.top ? (
              <>
                <div className="font-display text-3xl font-bold text-white tracking-tight">
                  {insights.topProtectiveActivity.top.label}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono-tabular">
                  Kept streak clean on{' '}
                  <strong className="text-emerald-400">
                    {insights.topProtectiveActivity.top.cleanDaysProtected}
                  </strong>{' '}
                  of {insights.topProtectiveActivity.top.totalDaysLogged}{' '}
                  logged{' '}
                  {insights.topProtectiveActivity.top.totalDaysLogged === 1
                    ? 'day'
                    : 'days'}{' '}
                  ({insights.topProtectiveActivity.top.cleanRatePct}% streak-safe).
                </p>
                {insights.topProtectiveActivity.runnerUp && (
                  <div className="text-xs text-zinc-500">
                    Runner-up: {insights.topProtectiveActivity.runnerUp.label} (
                    {insights.topProtectiveActivity.runnerUp.cleanDaysProtected}d)
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="font-display text-2xl font-bold text-zinc-300 tracking-tight">
                  Ready to measure
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tap any healthy replacement activity above today to start identifying which habit protects your streak best.
                </p>
              </>
            )}
          </div>

          {/* Insight 2: #1 Trigger & Danger Time */}
          <div className="space-y-2.5 pt-4 md:pt-0 md:pl-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#f59e0b]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>#1 Trigger &amp; Danger Time</span>
            </div>

            <div className="space-y-0.5">
              <div className="font-display text-3xl font-bold text-white tracking-tight">
                {insights.triggerAnalysis.topTrigger}
              </div>
              <div className="text-xs font-mono-tabular text-[#f59e0b] font-medium">
                Danger Window: {insights.triggerAnalysis.dangerTimeLabel}
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {insights.triggerAnalysis.preventionTip}
            </p>
            <div className="text-[11px] text-zinc-500">
              {insights.triggerAnalysis.sourceLabel}
            </div>
          </div>

          {/* Insight 3: Overall 66-Day Consistency Rate */}
          <div className="space-y-2.5 pt-4 md:pt-0 md:pl-5">
            <div className="flex items-center gap-2 text-xs font-medium text-sky-400">
              <Award className="w-4 h-4 shrink-0" />
              <span>Overall 66-Day Consistency</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold text-white font-mono-tabular leading-none">
                {insights.consistency.ratePct}%
              </span>
              <span className="text-xs text-zinc-400 font-mono-tabular">
                clean consistency
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 transition-all duration-500"
                  style={{ width: `${insights.consistency.ratePct}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono-tabular">
                {insights.consistency.subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
