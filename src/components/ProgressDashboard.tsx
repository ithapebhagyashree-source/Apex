import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Flame,
  Lock,
  RotateCcw,
  ShieldAlert,
  Snowflake,
  Sparkles,
  Timer,
  Zap,
} from 'lucide-react';
import {
  getCharacterProfileById,
  resolveHabitCharacterId,
} from '../data/animeCharacters';
import { AppState, HealthyActivityId, ModuleTab } from '../types';
import {
  getBestStreakDays,
  getCurrentCleanStreakDays,
} from '../utils/recoveryInsights';
import {
  ADVANCE_DAY_BONUS_XP,
  RANK_TIERS,
  TOTAL_RESET_DAYS,
  getLocalDateKey,
  getNextFreezeMilestone,
  getRankInfo,
  getWeeklyPhaseInfo,
} from '../utils/storage';
import { AnimeHabitCharacter } from './AnimeHabitCharacter';
import {
  RelapseCompassionateModal,
  RelapseResetPayload,
} from './RelapseCompassionateModal';
import { RpgStatsSection } from './RpgStatsSection';
import { SeedingGrowthCard } from './SeedingGrowthCard';
import { WeeklyBossCard } from './WeeklyBossCard';
import { WeeklyCategoryGaugesCard } from './WeeklyCategoryGaugesCard';
import { XpSparklineCard } from './XpSparklineCard';

interface ProgressDashboardProps {
  state: AppState;
  onToggleHabit: (habitId: string) => void;
  onToggleHealthyActivity: (activityId: HealthyActivityId) => void;
  onAdvanceDay: () => void;
  onUseStreakFreeze: () => void;
  onRelapseReset: (payload: RelapseResetPayload) => void;
  onLaunchUrgeBreaker: () => void;
  onDismissHardModeBanner: () => void;
  onDismissFreezeBanner: () => void;
  onNavigate: (tab: ModuleTab) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  state,
  onToggleHabit,
  onToggleHealthyActivity,
  onAdvanceDay,
  onUseStreakFreeze,
  onRelapseReset,
  onLaunchUrgeBreaker,
  onDismissHardModeBanner,
  onDismissFreezeBanner,
  onNavigate,
}) => {
  const [showRelapseConfirm, setShowRelapseConfirm] = useState(false);
  const [showFreezeConfirm, setShowFreezeConfirm] = useState(false);

  const currentStreakDays = getCurrentCleanStreakDays(state);
  const bestStreakDays = getBestStreakDays(state);

  const uniqueClearedOrFrozen = new Set([
    ...state.completedDays,
    ...(state.frozenDays ?? []),
  ]);
  const completedCount = uniqueClearedOrFrozen.size;
  const completionPct = Math.min(
    100,
    Math.round((completedCount / TOTAL_RESET_DAYS) * 100)
  );
  const rankInfo = getRankInfo(state.totalXP);
  const weeklyPhase = getWeeklyPhaseInfo(state.currentDay);
  const freezeInfo = getNextFreezeMilestone(state);

  const totalHabits = state.habits.length;
  const checkedHabitsCount = state.habits.filter((h) =>
    state.todayCheckedIds.includes(h.id)
  ).length;
  const allHabitsChecked = totalHabits > 0 && checkedHabitsCount === totalHabits;
  const remainingHabits = Math.max(0, totalHabits - checkedHabitsCount);
  const isFinished66 = completedCount >= TOTAL_RESET_DAYS;
  const canUseFreezeToday =
    state.streakFreezeTokens > 0 && !state.dayAdvancedToday && !isFinished66;

  // SVG Ring Geometry
  const ringRadius = 96;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference * (1 - completionPct / 100);

  const todayKey = getLocalDateKey();
  const showHardModeResetNotice = state.lastHardModeResetDate === todayKey;
  const showFreezeAutoNotice = state.lastFreezeAutoUsedDate === todayKey;

  return (
    <div className="space-y-6">
      {/* Automatic Streak Freeze Deployed Banner */}
      {showFreezeAutoNotice && (
        <div className="bg-sky-500/10 border border-sky-400/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Snowflake className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-white">
                Streak Freeze Auto-Deployed · Streak Protected
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                1 Streak Freeze Token was automatically spent at midnight to shield your streak after an unfinished day under Hard Mode.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissFreezeBanner}
            className="min-h-[40px] px-4 rounded-xl bg-[#111113] border border-zinc-800 hover:border-zinc-600 text-xs font-semibold text-white whitespace-nowrap shrink-0"
          >
            Got It
          </button>
        </div>
      )}

      {/* Hard Mode Automatic Midnight Reset Alert */}
      {showHardModeResetNotice && (
        <div className="bg-[#e11d48]/10 border border-[#e11d48]/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#e11d48] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-white">
                Hard Mode Enforced · Streak Reset to Day 1
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Yesterday&apos;s daily non-negotiables were not 100% completed before midnight. Own the reset and start Day 1 cleanly.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissHardModeBanner}
            className="min-h-[40px] px-4 rounded-xl bg-[#111113] border border-zinc-800 hover:border-zinc-600 text-xs font-semibold text-white whitespace-nowrap shrink-0"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Top Greeting, Weekly Phase Badge & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f59e0b]/12 border border-[#f59e0b]/35 text-[#f59e0b] font-semibold font-mono-tabular">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>
                Week {weeklyPhase.week} of {weeklyPhase.totalWeeks} ·{' '}
                {weeklyPhase.phaseName}
              </span>
            </div>
            {state.hardMode && (
              <span className="text-[#fb7185] font-semibold font-mono-tabular">
                Hard Mode Active
              </span>
            )}
            <span className="text-zinc-400">
              {state.profile.callsign} · Wake {state.profile.wakeTime} · Deep Work{' '}
              {state.profile.deepWorkHours}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {state.profile.primaryGoal}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('tools')}
            className="min-h-[44px] px-3.5 rounded-xl bg-[#111113] border border-zinc-800 hover:border-zinc-600 text-zinc-200 hover:text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <Timer className="w-4 h-4 text-[#f59e0b]" />
            <span>Mini Tools</span>
          </button>

          <button
            type="button"
            onClick={onLaunchUrgeBreaker}
            className="min-h-[44px] px-4 rounded-xl bg-[#e11d48]/12 border border-[#e11d48]/40 hover:bg-[#e11d48]/20 text-[#fb7185] hover:text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <ShieldAlert className="w-4 h-4 text-[#e11d48]" />
            <span>Urge Breaker</span>
          </button>
        </div>
      </div>

      {/* Main Responsive 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Dominant Focal Anchor: 66-Day SVG Progress Ring & 7-Day XP Sparkline */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-6 sm:p-8 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-zinc-400 mb-4">
            <span className="font-medium text-zinc-300">66-Day Transformation Ring</span>
            <span className="font-mono-tabular">
              {completedCount}/{TOTAL_RESET_DAYS} Days Cleared
            </span>
          </div>

          {/* Large Precision SVG Ring */}
          <div className="relative w-60 h-60 sm:w-64 sm:h-64 flex items-center justify-center my-2">
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 228 228"
              aria-label={`Day ${state.currentDay} of 66, ${completionPct} percent complete`}
            >
              <defs>
                <linearGradient id="resetRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e11d48" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              {/* Subtle outer tick track */}
              <circle
                cx="114"
                cy="114"
                r={ringRadius + 10}
                fill="none"
                stroke="#27272a"
                strokeWidth="1"
                strokeDasharray="2 7.5"
              />
              {/* Main background track */}
              <circle
                cx="114"
                cy="114"
                r={ringRadius}
                fill="none"
                stroke="#18181b"
                strokeWidth="14"
              />
              {/* Active progress arc */}
              <circle
                cx="114"
                cy="114"
                r={ringRadius}
                fill="none"
                stroke="url(#resetRingGrad)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-[stroke-dashoffset] duration-500 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-medium text-zinc-400">
                {isFinished66 ? 'Protocol Complete' : 'Current Mission'}
              </span>
              <div className="font-display text-5xl sm:text-6xl font-bold text-white tracking-tight leading-none mt-1 font-mono-tabular">
                Day {state.currentDay}
              </div>
              <span className="text-sm text-zinc-400 font-medium mt-1">
                of {TOTAL_RESET_DAYS}
              </span>
              <span className="mt-2 font-mono-tabular text-sm font-bold text-[#f59e0b]">
                {completionPct}% Complete
              </span>
            </div>
          </div>

          {/* Key Metric Trio (Unboxed Clean Columns) */}
          <div className="w-full grid grid-cols-3 gap-4 pt-6 mt-4 border-t border-zinc-800/80 text-center">
            <div>
              <div className="text-xs text-zinc-500">Total XP</div>
              <div className="font-mono-tabular text-xl sm:text-2xl font-bold text-[#f59e0b] mt-0.5">
                {state.totalXP.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">Today&apos;s Habits</div>
              <div className="font-mono-tabular text-xl sm:text-2xl font-bold text-white mt-0.5">
                {checkedHabitsCount}/{totalHabits}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">Urges Broken</div>
              <div className="font-mono-tabular text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">
                {state.urgeBreakersCompleted}
              </div>
            </div>
          </div>

          {/* Primary Game Loop Actions */}
          <div className="w-full pt-6 space-y-3">
            <button
              type="button"
              onClick={onAdvanceDay}
              disabled={!allHabitsChecked || state.dayAdvancedToday || isFinished66}
              className={`w-full min-h-[52px] px-5 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
                allHabitsChecked && !state.dayAdvancedToday && !isFinished66
                  ? 'bg-[#e11d48] hover:bg-[#be123c] text-white active:scale-[0.99] shadow-lg shadow-[#e11d48]/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {isFinished66 ? (
                <>
                  <Award className="w-5 h-5 text-[#f59e0b]" />
                  <span>All 66 Days Conquered</span>
                </>
              ) : state.dayAdvancedToday ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Day Logged · Resets Automatically at Midnight</span>
                </>
              ) : allHabitsChecked ? (
                <>
                  <Flame className="w-5 h-5" />
                  <span>
                    Complete Today &amp; Advance Day (+{ADVANCE_DAY_BONUS_XP} XP)
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    Check {remainingHabits} More{' '}
                    {remainingHabits === 1 ? 'Habit' : 'Habits'} to Unlock Advance
                  </span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowRelapseConfirm(true)}
                className="min-h-[44px] px-3 text-xs font-medium text-zinc-400 hover:text-[#fb7185] flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Relapse / Reset to Day 1</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('habits')}
                className="min-h-[44px] px-3 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Open 66-Day Heatmap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          </section>

          <XpSparklineCard state={state} />
        </div>

        {/* Right Column: Discipline Rank Ladder & Quick Today Checklist */}
        <div className="lg:col-span-5 space-y-6">
          {/* Discipline Rank Card */}
          <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-zinc-400">Discipline Rank</div>
                <div className="font-display text-3xl font-bold text-[#f59e0b] tracking-tight mt-0.5">
                  {rankInfo.current.name}
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {rankInfo.current.tagline}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#f59e0b]/12 border border-[#f59e0b]/30 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-[#f59e0b]" />
              </div>
            </div>

            {/* Progress to next rank */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  {rankInfo.next
                    ? `Next: ${rankInfo.next.name}`
                    : 'Maximum Rank Achieved'}
                </span>
                <span className="font-mono-tabular text-zinc-300">
                  {rankInfo.next
                    ? `${rankInfo.xpToNext.toLocaleString()} XP needed`
                    : `${state.totalXP.toLocaleString()} XP`}
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f59e0b] transition-all duration-500"
                  style={{ width: `${rankInfo.progressPercent}%` }}
                />
              </div>
            </div>

            {/* 5-Tier Ladder Display */}
            <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-zinc-800/80">
              {RANK_TIERS.map((tier, idx) => {
                const reached = idx <= rankInfo.tierIndex;
                const isCurrent = idx === rankInfo.tierIndex;
                return (
                  <div key={tier.name} className="text-center space-y-1">
                    <div
                      className={`h-1.5 rounded-full ${
                        isCurrent
                          ? 'bg-[#f59e0b]'
                          : reached
                          ? 'bg-emerald-500/80'
                          : 'bg-zinc-800'
                      }`}
                    />
                    <div
                      className={`text-[10px] sm:text-[11px] truncate ${
                        isCurrent
                          ? 'text-[#f59e0b] font-semibold'
                          : reached
                          ? 'text-zinc-300'
                          : 'text-zinc-500'
                      }`}
                    >
                      {tier.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Streak Freeze Shield Section */}
            <div className="pt-4 border-t border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/12 border border-sky-400/30 flex items-center justify-center shrink-0">
                    <Snowflake className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">
                      Streak Freeze Shield
                    </div>
                    <div className="text-xs text-zinc-400 font-mono-tabular">
                      <span className="text-sky-400 font-semibold">
                        {state.streakFreezeTokens}{' '}
                        {state.streakFreezeTokens === 1 ? 'Token' : 'Tokens'} Ready
                      </span>{' '}
                      · {freezeInfo.earnedCount}/{freezeInfo.totalMilestones} Earned
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canUseFreezeToday}
                  onClick={() => setShowFreezeConfirm(true)}
                  className={`min-h-[40px] px-3.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    canUseFreezeToday
                      ? 'bg-sky-500/15 border-sky-400/45 text-sky-300 hover:bg-sky-500/25 hover:text-white'
                      : 'bg-[#09090b] border-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {state.dayAdvancedToday ? 'Day Locked' : 'Use Freeze'}
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono-tabular">
                  <span className="text-zinc-500">
                    {freezeInfo.next
                      ? `Next Token: ${freezeInfo.next.label} (${freezeInfo.next.xp.toLocaleString()} XP)`
                      : 'All 5 Milestone Freeze Tokens Earned'}
                  </span>
                  {freezeInfo.next && (
                    <span className="text-sky-400">
                      {freezeInfo.xpRemaining.toLocaleString()} XP left
                    </span>
                  )}
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400 transition-all duration-500"
                    style={{ width: `${freezeInfo.progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Today's Non-Negotiable Checklist Quick Execution */}
          <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Today&apos;s Non-Negotiables
                </h2>
                <p className="text-xs text-zinc-400">
                  Check every habit to unlock Day {state.currentDay} completion
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate('codex')}
                  className="min-h-[36px] px-2.5 rounded-lg text-xs font-medium text-[#f59e0b] hover:text-amber-300 flex items-center gap-1 transition-colors whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Codex</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('habits')}
                  className="min-h-[36px] px-2.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
                >
                  Edit List
                </button>
              </div>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {state.habits.map((habit) => {
                const checked = state.todayCheckedIds.includes(habit.id);
                const charId = resolveHabitCharacterId(habit);
                const charProfile = getCharacterProfileById(charId);
                return (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => onToggleHabit(habit.id)}
                    className="w-full py-3 min-h-[60px] flex items-center justify-between gap-3 text-left group transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
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
                        size="sm"
                      />

                      <div className="min-w-0">
                        <div
                          className={`text-sm font-medium truncate transition-colors ${
                            checked
                              ? 'text-zinc-500 line-through'
                              : 'text-zinc-100 group-hover:text-white'
                          }`}
                        >
                          {habit.title}
                        </div>
                        <div className="text-xs text-zinc-500 truncate">
                          {habit.category} · {charProfile.name} · +{habit.xpValue} XP
                        </div>
                      </div>
                    </div>
                    <span
                      className={`font-mono-tabular text-xs font-semibold shrink-0 ${
                        checked ? 'text-emerald-400' : 'text-zinc-500'
                      }`}
                    >
                      {checked ? 'Done' : `+${habit.xpValue}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Weekly Habit Completion Rate Radial Gauges per Category */}
      <WeeklyCategoryGaugesCard state={state} onOpenHeatmap={onNavigate} />

      {/* Seeding Growth & Recovery Companion: 5-Stage SVG Plant, My Garden, 1-Tap Activities & Offline Pattern Insights */}
      <SeedingGrowthCard
        state={state}
        onToggleHealthyActivity={onToggleHealthyActivity}
        onOpenRelapseModal={() => setShowRelapseConfirm(true)}
        onLaunchUrgeBreaker={onLaunchUrgeBreaker}
      />

      {/* Weekly Milestone Boss Fight Card */}
      <WeeklyBossCard state={state} />

      {/* Full-Width 6-Stat RPG Radar & Attribute Leveling Section */}
      <RpgStatsSection state={state} />

      {/* Compassionate Relapse & Trigger Pattern Modal */}
      <RelapseCompassionateModal
        isOpen={showRelapseConfirm}
        currentStreakDays={currentStreakDays}
        bestStreakDays={bestStreakDays}
        canUseFreezeToday={canUseFreezeToday}
        onConfirmReset={(payload) => {
          setShowRelapseConfirm(false);
          onRelapseReset(payload);
        }}
        onUseFreezeInstead={() => {
          setShowRelapseConfirm(false);
          setShowFreezeConfirm(true);
        }}
        onClose={() => setShowRelapseConfirm(false)}
      />

      {/* Streak Freeze Confirmation Modal */}
      {showFreezeConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Streak Freeze"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-[#111113] border border-sky-400/40 rounded-2xl p-6 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/35 flex items-center justify-center shrink-0">
                <Snowflake className="w-5 h-5 text-sky-400" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold text-white">
                  Deploy 1 Streak Freeze for Day {state.currentDay}?
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Spends 1 of your {state.streakFreezeTokens} Streak Freeze{' '}
                  {state.streakFreezeTokens === 1 ? 'token' : 'tokens'} to shield Day{' '}
                  {state.currentDay} on your 66-day heatmap and protect your streak without resetting to Day 1. No completion bonus XP is awarded on a frozen day.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowFreezeConfirm(false)}
                className="min-h-[44px] px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-sm font-medium text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFreezeConfirm(false);
                  onUseStreakFreeze();
                }}
                className="min-h-[44px] px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-sm font-semibold text-zinc-950 transition-colors"
              >
                Confirm Streak Freeze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
