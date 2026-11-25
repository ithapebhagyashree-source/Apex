import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { AppState, ModuleTab } from '../types';
import {
  ReviewScope,
  buildMonthlyReviewCsv,
  buildPerformanceReview,
} from '../utils/performanceReview';
import { TOTAL_RESET_DAYS, getLocalDateKey, getRankInfo } from '../utils/storage';
import { D3ConsistencyChart } from './D3ConsistencyChart';
import { D3TopHabitsChart } from './D3TopHabitsChart';
import { D3XpGrowthChart } from './D3XpGrowthChart';
import { ErrorBoundary } from './ErrorBoundary';

interface PerformanceReviewProps {
  state: AppState;
  onNavigate: (tab: ModuleTab) => void;
  onNotify: (message: string) => void;
}

export const PerformanceReview: React.FC<PerformanceReviewProps> = ({
  state,
  onNavigate,
  onNotify,
}) => {
  const defaultMonthKey = getLocalDateKey().slice(0, 7);
  const [selectedScope, setSelectedScope] =
    useState<ReviewScope>(defaultMonthKey);

  const report = useMemo(
    () => buildPerformanceReview(state, selectedScope),
    [state, selectedScope]
  );

  const safeTotalXP = Number.isFinite(state?.totalXP) ? Math.max(0, state.totalXP) : 0;
  const safeCallsign = state?.profile?.callsign?.trim() || 'Operator';
  const rankInfo = getRankInfo(safeTotalXP);
  const topHabit = report.habitRankings.find((h) => h.completions > 0) ?? null;

  const activeMonthIndex = report.availableMonths.findIndex(
    (m) => m.key === report.scope
  );
  const canStepOlder =
    report.scope !== 'all' &&
    activeMonthIndex >= 0 &&
    activeMonthIndex < report.availableMonths.length - 1;
  const canStepNewer = report.scope !== 'all' && activeMonthIndex > 0;

  const handleStepOlder = () => {
    if (!canStepOlder) return;
    setSelectedScope(report.availableMonths[activeMonthIndex + 1].key);
  };

  const handleStepNewer = () => {
    if (!canStepNewer) return;
    setSelectedScope(report.availableMonths[activeMonthIndex - 1].key);
  };

  const handleExportCsv = () => {
    const csv = buildMonthlyReviewCsv(report);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeSlug = report.scope === 'all' ? 'all-66-days' : report.scope;
    link.download = `life-reset-performance-review-${safeSlug}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify(`Exported ${report.scopeLabel} report as CSV.`);
  };

  const ledgerRows = [
    {
      label: 'Active Days Logged',
      value: `${report.summary.activeDaysLogged} ${
        report.summary.activeDaysLogged === 1 ? 'day' : 'days'
      }`,
      accent: 'text-white',
    },
    {
      label: 'Days Cleared / Freeze Shielded',
      value: `${report.summary.clearedDaysInPeriod} cleared · ${report.summary.frozenDaysInPeriod} frozen`,
      accent: 'text-emerald-400',
    },
    {
      label: 'Period Consistency Rate',
      value: `${report.summary.periodConsistencyPct}%`,
      accent: 'text-sky-400',
    },
    {
      label: 'Peak Single-Day XP',
      value:
        report.summary.peakDailyXP > 0
          ? `+${report.summary.peakDailyXP.toLocaleString()} XP (${report.summary.peakDailyDateLabel})`
          : '0 XP',
      accent: 'text-[#f59e0b]',
    },
    {
      label: 'Healthy Replacements Logged',
      value: `${report.summary.healthyActivitiesLogged} logs`,
      accent: 'text-zinc-100',
    },
    {
      label: 'Urges Defeated / Night Journals',
      value: `${report.summary.urgesDefeatedInPeriod} urges · ${report.summary.journalEntriesInPeriod} reflections`,
      accent: 'text-zinc-100',
    },
    {
      label: 'Current / All-Time Best Streak',
      value: `${report.overall66.currentStreakDays}d active · ${report.overall66.bestStreakDays}d best`,
      accent: 'text-zinc-100',
    },
    {
      label: 'Top Trigger in Period',
      value: report.summary.topTriggerInPeriod ?? 'None logged',
      accent: report.summary.topTriggerInPeriod
        ? 'text-[#fb7185]'
        : 'text-zinc-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header & Month Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-zinc-400">
            Monthly Summary Report · {safeCallsign} · Current Rank:{' '}
            <span className="text-[#f59e0b] font-semibold">
              {rankInfo.current.name}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Performance Review
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Stepper / Scope Controls */}
          <div className="flex items-center p-1 rounded-xl bg-[#111113] border border-zinc-800">
            <button
              type="button"
              onClick={handleStepOlder}
              disabled={!canStepOlder}
              aria-label="Previous month"
              className="min-h-[38px] min-w-[38px] rounded-lg flex items-center justify-center text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-2.5 flex items-center gap-1.5 text-xs font-semibold text-white whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
              <span>{report.scopeLabel}</span>
            </div>

            <button
              type="button"
              onClick={handleStepNewer}
              disabled={!canStepNewer}
              aria-label="Next month"
              className="min-h-[38px] min-w-[38px] rounded-lg flex items-center justify-center text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Scope Toggle: Current Month vs All 66 Days */}
          <div
            role="group"
            aria-label="Report range"
            className="flex items-center p-1 rounded-xl bg-[#111113] border border-zinc-800"
          >
            <button
              type="button"
              onClick={() =>
                setSelectedScope(
                  report.availableMonths[0]?.key ?? defaultMonthKey
                )
              }
              aria-pressed={report.scope !== 'all'}
              className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                report.scope !== 'all'
                  ? 'bg-[#e11d48] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setSelectedScope('all')}
              aria-pressed={report.scope === 'all'}
              className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                report.scope === 'all'
                  ? 'bg-[#e11d48] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All 66 Days
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="min-h-[44px] px-3.5 rounded-xl bg-[#111113] border border-zinc-800 hover:border-zinc-600 text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-[#f59e0b]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Multi-Month Quick Selector Row (shown when >1 month of history exists) */}
      {report.availableMonths.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {report.availableMonths.map((month) => {
            const active = report.scope === month.key;
            return (
              <button
                key={month.key}
                type="button"
                onClick={() => setSelectedScope(month.key)}
                aria-pressed={active}
                className={`min-h-[36px] px-3 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-zinc-800 border-zinc-600 text-white'
                    : 'bg-[#111113] border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {month.shortLabel}
              </button>
            );
          })}
        </div>
      )}

      {/* Quiet Empty-State Callout when brand new on Day 1 with zero history */}
      {!report.hasAnyLoggedActivity && (
        <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">
              Your {report.scopeLabel} report is ready for your first day
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              Check off today&apos;s habits, log a healthy replacement activity, or complete an urge timer session—every chart below updates automatically from your offline history.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('progress')}
            className="min-h-[44px] px-4 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Log Today&apos;s Habits</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* 4-Column Executive KPI Strip (Single Elevation with Hairline Dividers) */}
      <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-0 lg:divide-x divide-zinc-800/80">
          <div className="lg:pr-5 space-y-1">
            <div className="text-xs text-zinc-400">Overall 66-Day Consistency</div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-emerald-400 font-mono-tabular leading-none">
              {report.overall66.consistencyRatePct}%
            </div>
            <div className="text-xs text-zinc-500 font-mono-tabular">
              {report.overall66.totalProtectedDays}/{TOTAL_RESET_DAYS} days · Best{' '}
              {report.overall66.bestStreakDays}d
            </div>
          </div>

          <div className="lg:px-5 space-y-1">
            <div className="text-xs text-zinc-400">
              {report.scope === 'all' ? 'Total Cumulative XP' : 'Monthly XP Gained'}
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-[#f59e0b] font-mono-tabular leading-none">
              {report.scope === 'all'
                ? safeTotalXP.toLocaleString()
                : `+${report.summary.xpEarnedInPeriod.toLocaleString()}`}
            </div>
            <div className="text-xs text-zinc-500 font-mono-tabular">
              Avg {report.summary.avgDailyXP.toLocaleString()} XP / active day
            </div>
          </div>

          <div className="lg:px-5 space-y-1">
            <div className="text-xs text-zinc-400">Top Healthy Habit</div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight truncate">
              {topHabit ? topHabit.label : 'Not Logged Yet'}
            </div>
            <div className="text-xs text-zinc-500 font-mono-tabular">
              {topHabit
                ? `${topHabit.completions} ${
                    topHabit.completions === 1 ? 'day' : 'days'
                  } (${topHabit.ratePct}%)`
                : 'Complete a habit to rank'}
            </div>
          </div>

          <div className="lg:pl-5 space-y-1">
            <div className="text-xs text-zinc-400">Recovery Momentum</div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-sky-400 font-mono-tabular leading-none">
              {report.summary.healthyActivitiesLogged}
            </div>
            <div className="text-xs text-zinc-500 font-mono-tabular">
              replacements · {report.summary.urgesDefeatedInPeriod} urges defeated
            </div>
          </div>
        </div>
      </section>

      {/* D3 CHART 1: Overall 66-Day Consistency & Monthly Calendar Matrix */}
      <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">
              D3 Radial Breakdown &amp; Monthly Consistency Grid
            </div>
            <h2 className="text-lg font-semibold text-white">
              Overall 66-Day Consistency
            </h2>
          </div>
          <div className="text-xs font-mono-tabular text-zinc-400">
            Active Streak: {report.overall66.currentStreakDays}d · All-Time Best:{' '}
            <span className="text-[#f59e0b] font-semibold">
              {report.overall66.bestStreakDays}d
            </span>
          </div>
        </div>

        <ErrorBoundary
          compact
          title="Consistency chart could not render"
          fallbackMessage="Your 66-day consistency metrics are safe above. Retry to reload the radial and calendar charts."
        >
          <D3ConsistencyChart
            slices={report.overall66.slices}
            consistencyRatePct={report.overall66.consistencyRatePct}
            completionPct={report.overall66.completionPct}
            totalProtectedDays={report.overall66.totalProtectedDays}
            monthLabel={report.monthCalendar.monthLabel}
            firstWeekday={report.monthCalendar.firstWeekday}
            cells={report.monthCalendar.cells}
          />
        </ErrorBoundary>
      </section>

      {/* D3 CHART 2 (XP Growth Trends) + Monthly Executive Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <section className="lg:col-span-7 bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div className="space-y-1">
              <div className="text-xs text-zinc-400">
                D3 Cumulative Curve &amp; Daily Velocity
              </div>
              <h2 className="text-lg font-semibold text-white">
                Total XP Growth Trends
              </h2>
            </div>
            <div className="text-xs font-mono-tabular text-[#f59e0b] font-semibold">
              {safeTotalXP.toLocaleString()} Total XP
            </div>
          </div>

          <ErrorBoundary
            compact
            title="XP growth chart could not render"
            fallbackMessage="Your total XP and daily ledger remain intact. Retry to reload the trend graph."
          >
            <D3XpGrowthChart
              data={report.xpTrend}
              scopeLabel={report.scopeLabel}
            />
          </ErrorBoundary>
        </section>

        {/* Monthly Summary Ledger */}
        <section className="lg:col-span-5 bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">Aggregated Offline Ledger</div>
            <h2 className="text-lg font-semibold text-white">
              {report.scopeLabel} Breakdown
            </h2>
          </div>

          <dl className="divide-y divide-zinc-800/80 flex-1">
            {ledgerRows.map((row) => (
              <div
                key={row.label}
                className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm"
              >
                <dt className="text-zinc-400">{row.label}</dt>
                <dd
                  className={`font-mono-tabular font-semibold text-right ${row.accent}`}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* D3 CHART 3: Top Healthy Habits Horizontal Ranked Bar Chart */}
      <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">
              D3 Horizontal Ranking · Daily Non-Negotiables &amp; Recovery Replacements
            </div>
            <h2 className="text-lg font-semibold text-white">
              Top Healthy Habits
            </h2>
          </div>
          <div className="text-xs font-mono-tabular text-zinc-400">
            {report.habitRankings.filter((h) => h.completions > 0).length} of{' '}
            {report.habitRankings.length} habits active
          </div>
        </div>

        <ErrorBoundary
          compact
          title="Top habits chart could not render"
          fallbackMessage="Your habit completions are safely saved. Retry to reload the ranking chart."
        >
          <D3TopHabitsChart
            items={report.habitRankings}
            scopeLabel={report.scopeLabel}
          />
        </ErrorBoundary>
      </section>
    </div>
  );
};
