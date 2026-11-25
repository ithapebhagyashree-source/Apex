import {
  HEALTHY_ACTIVITIES,
  getHealthyActivityMeta,
} from '../data/recoveryCompanion';
import { AppState, HealthyActivityId } from '../types';
import {
  getBestStreakDays,
  getCurrentCleanStreakDays,
} from './recoveryInsights';
import {
  ADVANCE_DAY_BONUS_XP,
  HABIT_XP,
  TOTAL_RESET_DAYS,
  getLocalDateKey,
  getRankInfo,
} from './storage';

export type ReviewScope = 'all' | string; // 'all' or 'YYYY-MM'

export interface MonthOption {
  key: string; // 'YYYY-MM'
  label: string; // e.g. 'November 2026'
  shortLabel: string; // e.g. 'Nov 2026'
  eventCount: number;
}

export type DayConsistencyStatus =
  | 'cleared'
  | 'frozen'
  | 'partial'
  | 'relapse'
  | 'unlogged';

export interface MonthlyDayCell {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  weekdayIndex: number; // 0 (Sun) - 6 (Sat)
  shortLabel: string; // e.g. 'Nov 14'
  status: DayConsistencyStatus;
  habitsDone: number;
  totalHabits: number;
  xpEarned: number;
  healthyActivitiesCount: number;
  isToday: boolean;
  isFuture: boolean;
}

export interface HabitPerformanceItem {
  id: string;
  label: string;
  source: 'habit' | 'replacement';
  categoryLabel: string;
  completions: number;
  possibleDays: number;
  ratePct: number;
  cleanDaysLinked: number;
}

export interface XpGrowthPoint {
  date: string; // YYYY-MM-DD
  shortLabel: string; // e.g. 'Nov 03'
  dayIndex: number;
  dailyXP: number;
  cumulativeXP: number;
  rollingAvgXP: number;
  rankName: string;
  isToday: boolean;
}

export interface ConsistencySlice {
  id: 'cleared' | 'frozen' | 'remaining';
  label: string;
  value: number;
  pct: number;
  color: string;
}

export interface PerformanceReviewReport {
  scope: ReviewScope;
  scopeLabel: string;
  availableMonths: MonthOption[];
  // 66-Day overall consistency
  overall66: {
    clearedDays: number;
    frozenDays: number;
    totalProtectedDays: number;
    remainingDays: number;
    completionPct: number;
    consistencyRatePct: number;
    currentStreakDays: number;
    bestStreakDays: number;
    relapsesTotal: number;
    slices: ConsistencySlice[];
  };
  // Monthly summary metrics
  summary: {
    activeDaysLogged: number;
    clearedDaysInPeriod: number;
    frozenDaysInPeriod: number;
    partialDaysInPeriod: number;
    relapsesInPeriod: number;
    periodConsistencyPct: number;
    xpEarnedInPeriod: number;
    avgDailyXP: number;
    peakDailyXP: number;
    peakDailyDateLabel: string | null;
    healthyActivitiesLogged: number;
    urgesDefeatedInPeriod: number;
    journalEntriesInPeriod: number;
    topTriggerInPeriod: string | null;
  };
  // Calendar cells for selected month (always populated for a month view)
  monthCalendar: {
    monthKey: string;
    monthLabel: string;
    daysInMonth: number;
    firstWeekday: number;
    cells: MonthlyDayCell[];
  };
  // Top healthy habits (both non-negotiable habits and replacement activities)
  habitRankings: HabitPerformanceItem[];
  // XP growth trend series
  xpTrend: XpGrowthPoint[];
  hasAnyLoggedActivity: boolean;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatMonthLabel(monthKey: string): { label: string; shortLabel: string } {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) {
    return { label: monthKey, shortLabel: monthKey };
  }
  return {
    label: `${MONTH_NAMES[m - 1]} ${y}`,
    shortLabel: `${MONTH_SHORT[m - 1]} ${y}`,
  };
}

function isValidDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatDateShort(dateKey: string): string {
  if (!isValidDateKey(dateKey)) return String(dateKey ?? '');
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d || m < 1 || m > 12) return dateKey;
  return `${MONTH_SHORT[m - 1]} ${d}`;
}

function getDaysInMonth(year: number, month1Based: number): number {
  const safeYear = Number.isFinite(year) && year > 1970 ? year : new Date().getFullYear();
  const safeMonth =
    Number.isFinite(month1Based) && month1Based >= 1 && month1Based <= 12
      ? month1Based
      : new Date().getMonth() + 1;
  return new Date(safeYear, safeMonth, 0).getDate();
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function getAvailableMonths(state: AppState): MonthOption[] {
  const todayKey = getLocalDateKey();
  const currentMonthKey = todayKey.slice(0, 7);
  const counts = new Map<string, number>();

  const bump = (dateStr?: unknown) => {
    if (typeof dateStr !== 'string' || dateStr.length < 7) return;
    const mk = dateStr.slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(mk)) return;
    const monthNum = Number(mk.slice(5, 7));
    if (monthNum < 1 || monthNum > 12) return;
    counts.set(mk, (counts.get(mk) ?? 0) + 1);
  };

  // Always include current month
  counts.set(currentMonthKey, counts.get(currentMonthKey) ?? 0);

  if (state?.startedAt) {
    const startDate = new Date(state.startedAt);
    if (!Number.isNaN(startDate.getTime())) {
      bump(getLocalDateKey(startDate));
    }
  }

  for (const h of state?.history ?? []) bump(h?.date);
  for (const dateKey of Object.keys(state?.dailyXPByDate ?? {})) {
    if ((state?.dailyXPByDate?.[dateKey] ?? 0) > 0) bump(dateKey);
  }
  for (const a of state?.healthyActivityLogs ?? []) bump(a?.date);
  for (const r of state?.relapseLogs ?? []) bump(r?.date);
  for (const u of state?.urgeLogs ?? []) bump(u?.date);
  for (const j of state?.journalEntries ?? []) bump(j?.date);

  return Array.from(counts.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, eventCount]) => {
      const { label, shortLabel } = formatMonthLabel(key);
      return { key, label, shortLabel, eventCount };
    });
}

export function buildPerformanceReview(
  state: AppState,
  requestedScope?: ReviewScope
): PerformanceReviewReport {
  const todayKey = getLocalDateKey();
  const currentMonthKey = todayKey.slice(0, 7);
  const availableMonths = getAvailableMonths(state);

  const scope: ReviewScope =
    requestedScope &&
    (requestedScope === 'all' ||
      availableMonths.some((m) => m.key === requestedScope))
      ? requestedScope
      : currentMonthKey;

  const calendarMonthKey = scope === 'all' ? currentMonthKey : scope;
  const scopeLabel =
    scope === 'all'
      ? 'All-Time 66-Day Summary'
      : formatMonthLabel(scope).label;

  const matchesScope = (dateKey: string): boolean => {
    if (scope === 'all') return true;
    return dateKey.startsWith(scope);
  };

  // Build unified per-date snapshots combining history, dailyXPByDate, live today, activities, and relapses
  interface DateSnapshot {
    date: string;
    completedHabitIds: Set<string>;
    totalHabits: number;
    dayCompleted: boolean;
    frozen: boolean;
    relapsed: boolean;
    xpEarned: number;
    healthyActivities: Set<HealthyActivityId>;
  }

  const safeHabits = Array.isArray(state?.habits) ? state.habits : [];
  const safeTodayCheckedIds = Array.isArray(state?.todayCheckedIds)
    ? state.todayCheckedIds
    : [];
  const safeTotalXP = Number.isFinite(state?.totalXP) ? Math.max(0, state.totalXP) : 0;

  const byDate = new Map<string, DateSnapshot>();
  const ensureDate = (date: string): DateSnapshot => {
    let snap = byDate.get(date);
    if (!snap) {
      snap = {
        date,
        completedHabitIds: new Set<string>(),
        totalHabits: safeHabits.length,
        dayCompleted: false,
        frozen: false,
        relapsed: false,
        xpEarned: 0,
        healthyActivities: new Set<HealthyActivityId>(),
      };
      byDate.set(date, snap);
    }
    return snap;
  };

  for (const entry of state?.history ?? []) {
    if (!entry || !isValidDateKey(entry.date)) continue;
    const snap = ensureDate(entry.date);
    for (const hid of entry.completedHabitIds ?? []) {
      if (typeof hid === 'string') snap.completedHabitIds.add(hid);
    }
    snap.totalHabits = Math.max(snap.totalHabits, entry.totalHabits || safeHabits.length);
    if (entry.dayCompleted) snap.dayCompleted = true;
    if (entry.frozen) snap.frozen = true;
    if (entry.relapsed) snap.relapsed = true;
    snap.xpEarned = Math.max(snap.xpEarned, Number(entry.xpEarned) || 0);
  }

  for (const [dateKey, xp] of Object.entries(state?.dailyXPByDate ?? {})) {
    if (isValidDateKey(dateKey) && typeof xp === 'number' && Number.isFinite(xp) && xp > 0) {
      const snap = ensureDate(dateKey);
      snap.xpEarned = Math.max(snap.xpEarned, xp);
    }
  }

  for (const act of state?.healthyActivityLogs ?? []) {
    if (!act || !isValidDateKey(act.date) || !act.activityId) continue;
    const snap = ensureDate(act.date);
    snap.healthyActivities.add(act.activityId);
  }

  for (const rel of state?.relapseLogs ?? []) {
    if (!rel || !isValidDateKey(rel.date)) continue;
    const snap = ensureDate(rel.date);
    snap.relapsed = true;
  }

  // Merge live today's state so Performance Review always reflects immediate actions
  const liveTodayHabitXP =
    safeHabits.filter((h) => safeTodayCheckedIds.includes(h.id)).length *
      HABIT_XP +
    (state?.dayAdvancedToday ? ADVANCE_DAY_BONUS_XP : 0);

  if (
    safeTodayCheckedIds.length > 0 ||
    state?.dayAdvancedToday ||
    (state?.dailyXPByDate?.[todayKey] ?? 0) > 0
  ) {
    const todaySnap = ensureDate(todayKey);
    for (const hid of safeTodayCheckedIds) {
      todaySnap.completedHabitIds.add(hid);
    }
    todaySnap.totalHabits = Math.max(todaySnap.totalHabits, safeHabits.length);
    if (state?.dayAdvancedToday) {
      todaySnap.dayCompleted = true;
    }
    todaySnap.xpEarned = Math.max(
      todaySnap.xpEarned,
      state?.dailyXPByDate?.[todayKey] ?? 0,
      liveTodayHabitXP
    );
  }

  // 1. Overall 66-Day Consistency stats
  const uniqueCleared = new Set(state.completedDays ?? []);
  const uniqueFrozen = new Set(
    (state.frozenDays ?? []).filter((d) => !uniqueCleared.has(d))
  );
  const clearedDays66 = Math.min(TOTAL_RESET_DAYS, uniqueCleared.size);
  const frozenDays66 = Math.min(
    Math.max(0, TOTAL_RESET_DAYS - clearedDays66),
    uniqueFrozen.size
  );
  const totalProtectedDays66 = clearedDays66 + frozenDays66;
  const remainingDays66 = Math.max(0, TOTAL_RESET_DAYS - totalProtectedDays66);
  const completionPct66 = Math.min(
    100,
    Math.round((totalProtectedDays66 / TOTAL_RESET_DAYS) * 100)
  );

  const relapsesTotal = Math.max(
    state.relapseCount ?? 0,
    (state.relapseLogs ?? []).length
  );
  const historyCleanCount = Array.from(byDate.values()).filter(
    (s) => s.dayCompleted || s.frozen
  ).length;
  const totalCleanOverall = Math.max(totalProtectedDays66, historyCleanCount);
  const totalTrackedOverall = totalCleanOverall + relapsesTotal;
  const consistencyRatePct =
    totalTrackedOverall > 0
      ? Math.min(100, Math.round((totalCleanOverall / totalTrackedOverall) * 100))
      : safeHabits.length > 0 && safeTodayCheckedIds.length > 0
      ? Math.round((safeTodayCheckedIds.length / safeHabits.length) * 100)
      : 0;

  const slices: ConsistencySlice[] = [
    {
      id: 'cleared',
      label: 'Cleared Days',
      value: clearedDays66,
      pct: Math.round((clearedDays66 / TOTAL_RESET_DAYS) * 100),
      color: '#10b981',
    },
    {
      id: 'frozen',
      label: 'Freeze Protected',
      value: frozenDays66,
      pct: Math.round((frozenDays66 / TOTAL_RESET_DAYS) * 100),
      color: '#38bdf8',
    },
    {
      id: 'remaining',
      label: 'Remaining in 66d',
      value: remainingDays66,
      pct: Math.max(
        0,
        100 -
          Math.round((clearedDays66 / TOTAL_RESET_DAYS) * 100) -
          Math.round((frozenDays66 / TOTAL_RESET_DAYS) * 100)
      ),
      color: '#27272a',
    },
  ];

  // 2. Build Calendar Matrix for calendarMonthKey
  const [rawCalYear, rawCalMonth] = calendarMonthKey.split('-').map(Number);
  const nowRef = new Date();
  const calYear =
    Number.isFinite(rawCalYear) && rawCalYear >= 2000 && rawCalYear <= 2100
      ? rawCalYear
      : nowRef.getFullYear();
  const calMonth =
    Number.isFinite(rawCalMonth) && rawCalMonth >= 1 && rawCalMonth <= 12
      ? rawCalMonth
      : nowRef.getMonth() + 1;
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstWeekday = new Date(calYear, calMonth - 1, 1).getDay();
  const cells: MonthlyDayCell[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${calYear}-${pad2(calMonth)}-${pad2(d)}`;
    const snap = byDate.get(dateKey);
    const isToday = dateKey === todayKey;
    const isFuture = dateKey > todayKey;

    let status: DayConsistencyStatus = 'unlogged';
    if (snap) {
      if (snap.relapsed) status = 'relapse';
      else if (snap.dayCompleted) status = 'cleared';
      else if (snap.frozen) status = 'frozen';
      else if (
        snap.completedHabitIds.size > 0 ||
        snap.healthyActivities.size > 0 ||
        snap.xpEarned > 0
      ) {
        status = 'partial';
      }
    }

    cells.push({
      date: dateKey,
      dayOfMonth: d,
      weekdayIndex: new Date(calYear, calMonth - 1, d).getDay(),
      shortLabel: formatDateShort(dateKey),
      status,
      habitsDone: snap ? snap.completedHabitIds.size : 0,
      totalHabits: snap ? snap.totalHabits : safeHabits.length,
      xpEarned: snap ? snap.xpEarned : 0,
      healthyActivitiesCount: snap ? snap.healthyActivities.size : 0,
      isToday,
      isFuture,
    });
  }

  // 3. Period-scoped summary metrics
  const scopedSnapshots = Array.from(byDate.values())
    .filter((s) => matchesScope(s.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  let clearedDaysInPeriod = 0;
  let frozenDaysInPeriod = 0;
  let partialDaysInPeriod = 0;
  let relapsesInPeriod = 0;
  let xpEarnedInPeriod = 0;
  let peakDailyXP = 0;
  let peakDailyDateLabel: string | null = null;

  for (const s of scopedSnapshots) {
    if (s.relapsed) relapsesInPeriod += 1;
    else if (s.dayCompleted) clearedDaysInPeriod += 1;
    else if (s.frozen) frozenDaysInPeriod += 1;
    else if (
      s.completedHabitIds.size > 0 ||
      s.healthyActivities.size > 0 ||
      s.xpEarned > 0
    ) {
      partialDaysInPeriod += 1;
    }

    xpEarnedInPeriod += s.xpEarned;
    if (s.xpEarned > peakDailyXP) {
      peakDailyXP = s.xpEarned;
      peakDailyDateLabel = formatDateShort(s.date);
    }
  }

  const activeDaysLogged =
    clearedDaysInPeriod +
    frozenDaysInPeriod +
    partialDaysInPeriod +
    relapsesInPeriod;

  const periodDenominator =
    clearedDaysInPeriod + frozenDaysInPeriod + relapsesInPeriod;
  const periodConsistencyPct =
    periodDenominator > 0
      ? Math.min(
          100,
          Math.round(
            ((clearedDaysInPeriod + frozenDaysInPeriod) / periodDenominator) * 100
          )
        )
      : partialDaysInPeriod > 0
      ? Math.round(
          (scopedSnapshots.reduce((sum, s) => sum + s.completedHabitIds.size, 0) /
            Math.max(
              1,
              scopedSnapshots.reduce((sum, s) => sum + s.totalHabits, 0)
            )) *
            100
        )
      : 0;

  const healthyActivitiesInPeriod = (state?.healthyActivityLogs ?? []).filter(
    (a) => a && isValidDateKey(a.date) && matchesScope(a.date)
  );
  const urgesInPeriod = (state?.urgeLogs ?? []).filter(
    (u) => u && u.completed && isValidDateKey(u.date) && matchesScope(u.date)
  );
  const journalsInPeriod = (state?.journalEntries ?? []).filter(
    (j) => j && isValidDateKey(j.date) && matchesScope(j.date)
  );

  // Top trigger in period
  const triggerCounts = new Map<string, number>();
  for (const r of state?.relapseLogs ?? []) {
    if (r && r.trigger && isValidDateKey(r.date) && matchesScope(r.date)) {
      triggerCounts.set(r.trigger, (triggerCounts.get(r.trigger) ?? 0) + 2);
    }
  }
  for (const u of state?.urgeLogs ?? []) {
    if (u && u.trigger && isValidDateKey(u.date) && matchesScope(u.date)) {
      triggerCounts.set(u.trigger, (triggerCounts.get(u.trigger) ?? 0) + 1);
    }
  }
  const topTriggerInPeriod =
    Array.from(triggerCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    null;

  // 4. Top Healthy Habits Ranking (Non-Negotiable Habits + Healthy Replacement Activities)
  const possibleDays = Math.max(1, activeDaysLogged);
  const habitRankings: HabitPerformanceItem[] = [];

  for (const habit of safeHabits) {
    if (!habit || !habit.id) continue;
    let completions = 0;
    let cleanDaysLinked = 0;
    for (const s of scopedSnapshots) {
      if (s.completedHabitIds.has(habit.id)) {
        completions += 1;
        if (!s.relapsed) cleanDaysLinked += 1;
      }
    }
    habitRankings.push({
      id: habit.id,
      label: habit.title || 'Habit',
      source: 'habit',
      categoryLabel: habit.category || 'Discipline',
      completions,
      possibleDays,
      ratePct:
        activeDaysLogged > 0
          ? Math.min(100, Math.round((completions / possibleDays) * 100))
          : 0,
      cleanDaysLinked,
    });
  }

  for (const act of HEALTHY_ACTIVITIES) {
    const dates = new Set(
      healthyActivitiesInPeriod
        .filter((l) => l.activityId === act.id)
        .map((l) => l.date)
    );
    const completions = dates.size;
    let cleanDaysLinked = 0;
    for (const d of dates) {
      const snap = byDate.get(d);
      if (!snap || !snap.relapsed) cleanDaysLinked += 1;
    }
    habitRankings.push({
      id: `rep-${act.id}`,
      label: getHealthyActivityMeta(act.id).label,
      source: 'replacement',
      categoryLabel: 'Recovery Activity',
      completions,
      possibleDays,
      ratePct:
        activeDaysLogged > 0
          ? Math.min(100, Math.round((completions / possibleDays) * 100))
          : 0,
      cleanDaysLinked,
    });
  }

  habitRankings.sort((a, b) => {
    if (b.completions !== a.completions) return b.completions - a.completions;
    if (b.cleanDaysLinked !== a.cleanDaysLinked)
      return b.cleanDaysLinked - a.cleanDaysLinked;
    return a.label.localeCompare(b.label);
  });

  // 5. Total XP Growth Trends Series
  const xpDateKeys: string[] = [];
  if (scope !== 'all') {
    const isCurrentMonth = scope === currentMonthKey;
    const todayDay = Number(todayKey.slice(8, 10));
    const maxDay = isCurrentMonth ? Math.max(7, Math.min(daysInMonth, todayDay)) : daysInMonth;
    for (let d = 1; d <= maxDay; d++) {
      xpDateKeys.push(`${calYear}-${pad2(calMonth)}-${pad2(d)}`);
    }
  } else {
    // Build continuous timeline from earliest recorded date (or last 14 days) up to today
    const allRecordedDates = Array.from(byDate.keys()).sort();
    const earliest = allRecordedDates[0];
    const endDate = new Date(
      Number(todayKey.slice(0, 4)),
      Number(todayKey.slice(5, 7)) - 1,
      Number(todayKey.slice(8, 10))
    );
    let startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 13);

    if (earliest && isValidDateKey(earliest) && earliest < getLocalDateKey(startDate)) {
      const [ey, em, ed] = earliest.split('-').map(Number);
      const parsedEarliest = new Date(ey, em - 1, ed);
      if (!Number.isNaN(parsedEarliest.getTime())) {
        startDate = parsedEarliest;
      }
    }

    // Cap at 66 days window so axis stays super crisp and never overflows
    const diffDays = Math.round(
      (endDate.getTime() - startDate.getTime()) / 86_400_000
    );
    if (!Number.isFinite(diffDays) || diffDays < 0 || diffDays > 65) {
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 65);
    }

    const cursor = new Date(startDate);
    let guard = 0;
    while (cursor <= endDate && guard < 70) {
      xpDateKeys.push(getLocalDateKey(cursor));
      cursor.setDate(cursor.getDate() + 1);
      guard += 1;
    }
  }

  // Compute XP earned strictly inside xpDateKeys vs baseline prior XP so cumulative curve lands accurately on state.totalXP
  const windowDailySum = xpDateKeys.reduce(
    (sum, dk) => sum + (byDate.get(dk)?.xpEarned ?? 0),
    0
  );
  const firstWindowDate = xpDateKeys[0] ?? todayKey;
  let priorTrackedXP = 0;
  for (const [dk, snap] of byDate.entries()) {
    if (dk < firstWindowDate) {
      priorTrackedXP += snap.xpEarned;
    }
  }
  // If user has legacy totalXP greater than recorded daily ledger, anchor baseline cleanly
  const lastWindowDate = xpDateKeys[xpDateKeys.length - 1] ?? todayKey;
  const includesToday = lastWindowDate >= todayKey;
  const baselineXP = includesToday
    ? Math.max(priorTrackedXP, Math.max(0, safeTotalXP - windowDailySum))
    : priorTrackedXP;

  let runningCumulative = baselineXP;
  const recentWindow: number[] = [];
  const xpTrend: XpGrowthPoint[] = xpDateKeys.map((dk, idx) => {
    const dailyXP = byDate.get(dk)?.xpEarned ?? 0;
    runningCumulative += dailyXP;
    recentWindow.push(dailyXP);
    if (recentWindow.length > 7) recentWindow.shift();
    const rollingAvgXP = Math.round(
      recentWindow.reduce((a, b) => a + b, 0) / recentWindow.length
    );

    return {
      date: dk,
      shortLabel: formatDateShort(dk),
      dayIndex: idx + 1,
      dailyXP,
      cumulativeXP: runningCumulative,
      rollingAvgXP,
      rankName: getRankInfo(runningCumulative).current.name,
      isToday: dk === todayKey,
    };
  });

  const avgDailyXP =
    activeDaysLogged > 0 ? Math.round(xpEarnedInPeriod / activeDaysLogged) : 0;

  const hasAnyLoggedActivity =
    activeDaysLogged > 0 ||
    safeTotalXP > 0 ||
    (state?.healthyActivityLogs ?? []).length > 0 ||
    (state?.urgeLogs ?? []).length > 0;

  return {
    scope,
    scopeLabel,
    availableMonths,
    overall66: {
      clearedDays: clearedDays66,
      frozenDays: frozenDays66,
      totalProtectedDays: totalProtectedDays66,
      remainingDays: remainingDays66,
      completionPct: completionPct66,
      consistencyRatePct,
      currentStreakDays: getCurrentCleanStreakDays(state),
      bestStreakDays: getBestStreakDays(state),
      relapsesTotal,
      slices,
    },
    summary: {
      activeDaysLogged,
      clearedDaysInPeriod,
      frozenDaysInPeriod,
      partialDaysInPeriod,
      relapsesInPeriod,
      periodConsistencyPct,
      xpEarnedInPeriod,
      avgDailyXP,
      peakDailyXP,
      peakDailyDateLabel,
      healthyActivitiesLogged: healthyActivitiesInPeriod.length,
      urgesDefeatedInPeriod:
        scope === 'all'
          ? Math.max(state?.urgeBreakersCompleted ?? 0, urgesInPeriod.length)
          : urgesInPeriod.length,
      journalEntriesInPeriod: journalsInPeriod.length,
      topTriggerInPeriod,
    },
    monthCalendar: {
      monthKey: calendarMonthKey,
      monthLabel: formatMonthLabel(calendarMonthKey).label,
      daysInMonth,
      firstWeekday,
      cells,
    },
    habitRankings,
    xpTrend,
    hasAnyLoggedActivity,
  };
}

export function buildMonthlyReviewCsv(report: PerformanceReviewReport): string {
  const rows: string[][] = [
    ['Section', 'Metric / Date', 'Value', 'Details'],
    ['Summary', 'Report Period', report.scopeLabel, ''],
    [
      'Summary',
      'Overall 66-Day Consistency',
      `${report.overall66.consistencyRatePct}%`,
      `${report.overall66.totalProtectedDays}/${TOTAL_RESET_DAYS} days protected`,
    ],
    [
      'Summary',
      'Current Streak / All-Time Best',
      `${report.overall66.currentStreakDays}d / ${report.overall66.bestStreakDays}d`,
      `${report.overall66.relapsesTotal} total resets`,
    ],
    [
      'Summary',
      'XP Earned in Period',
      `${report.summary.xpEarnedInPeriod} XP`,
      `Avg ${report.summary.avgDailyXP} XP per active day`,
    ],
    ['', '', '', ''],
    ['Top Healthy Habits', 'Habit / Activity', 'Completions', 'Type / Rate'],
    ...report.habitRankings.map((h) => [
      'Top Healthy Habits',
      h.label,
      String(h.completions),
      `${h.categoryLabel} (${h.ratePct}%)`,
    ]),
    ['', '', '', ''],
    ['XP Growth Trend', 'Date', 'Daily XP', 'Cumulative XP'],
    ...report.xpTrend.map((p) => [
      'XP Growth Trend',
      p.date,
      String(p.dailyXP),
      String(p.cumulativeXP),
    ]),
  ];

  return rows
    .map((cols) =>
      cols
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
}
