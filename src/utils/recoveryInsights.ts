import {
  HEALTHY_ACTIVITIES,
  RELAPSE_TRIGGERS,
  getHealthyActivityMeta,
  getTimeWindowFromHour,
  getTimeWindowRangeLabel,
} from '../data/recoveryCompanion';
import {
  AppState,
  DangerTimeWindow,
  HealthyActivityId,
  RelapseTrigger,
} from '../types';
import { TOTAL_RESET_DAYS, getLocalDateKey } from './storage';

export function getCurrentCleanStreakDays(state: AppState): number {
  const uniqueClearedOrFrozen = new Set([
    ...state.completedDays,
    ...(state.frozenDays ?? []),
  ]);
  return Math.max(1, state.currentDay, uniqueClearedOrFrozen.size);
}

export function getBestStreakDays(state: AppState): number {
  const current = getCurrentCleanStreakDays(state);
  const archivedMax = (state.gardenArchive ?? []).reduce(
    (max, item) => Math.max(max, item.daysGrown),
    0
  );
  return Math.max(
    1,
    state.bestStreakDays ?? 1,
    state.highestDayReached ?? 1,
    current,
    archivedMax
  );
}

export interface ActivityProtectionStat {
  id: HealthyActivityId;
  label: string;
  totalDaysLogged: number;
  cleanDaysProtected: number;
  cleanRatePct: number;
}

export interface PatternInsightsResult {
  topProtectiveActivity: {
    hasData: boolean;
    top: ActivityProtectionStat | null;
    runnerUp: ActivityProtectionStat | null;
    totalLogsCount: number;
    breakdown: ActivityProtectionStat[];
  };
  triggerAnalysis: {
    hasLoggedData: boolean;
    topTrigger: string;
    topTriggerCount: number;
    dangerTime: DangerTimeWindow;
    dangerTimeRange: string;
    dangerTimeLabel: string;
    totalIncidents: number;
    preventionTip: string;
    sourceLabel: string;
  };
  consistency: {
    ratePct: number;
    cleanDays: number;
    totalTrackedDays: number;
    relapses: number;
    journey66Pct: number;
    currentStreakDays: number;
    bestStreakDays: number;
    subtitle: string;
  };
}

function inferWindowFromProfile(vulnerabilityWindow: string): DangerTimeWindow {
  const lower = (vulnerabilityWindow || '').toLowerCase();
  if (lower.includes('morning')) return 'Morning';
  if (lower.includes('afternoon')) return 'Afternoon';
  if (lower.includes('evening')) return 'Evening';
  return 'Late Night';
}

function inferTipForTrigger(trigger: string): string {
  const exact = RELAPSE_TRIGGERS.find(
    (t) => t.id.toLowerCase() === trigger.toLowerCase()
  );
  if (exact) return exact.preventionTip;
  const lower = trigger.toLowerCase();
  if (lower.includes('bored')) return RELAPSE_TRIGGERS[0].preventionTip;
  if (lower.includes('stress') || lower.includes('anxi'))
    return RELAPSE_TRIGGERS[1].preventionTip;
  if (lower.includes('night') || lower.includes('sleep'))
    return RELAPSE_TRIGGERS[2].preventionTip;
  if (lower.includes('phone') || lower.includes('scroll'))
    return RELAPSE_TRIGGERS[3].preventionTip;
  return RELAPSE_TRIGGERS[4].preventionTip;
}

export function computePatternInsights(state: AppState): PatternInsightsResult {
  const todayKey = getLocalDateKey();
  const relapseLogs = state.relapseLogs ?? [];
  const urgeLogs = state.urgeLogs ?? [];
  const activityLogs = state.healthyActivityLogs ?? [];

  // Build set of dates where a relapse occurred
  const relapseDateSet = new Set<string>();
  for (const r of relapseLogs) {
    relapseDateSet.add(r.date);
  }
  for (const h of state.history ?? []) {
    if (h.relapsed) relapseDateSet.add(h.date);
  }

  // 1. Top Protective Activity analysis
  const activityDatesMap = new Map<HealthyActivityId, Set<string>>();
  for (const act of HEALTHY_ACTIVITIES) {
    activityDatesMap.set(act.id, new Set<string>());
  }
  for (const log of activityLogs) {
    const set = activityDatesMap.get(log.activityId);
    if (set) {
      set.add(log.date);
    }
  }

  const breakdown: ActivityProtectionStat[] = HEALTHY_ACTIVITIES.map((act) => {
    const dates = Array.from(activityDatesMap.get(act.id) ?? []);
    const totalDaysLogged = dates.length;
    const cleanDaysProtected = dates.filter((d) => !relapseDateSet.has(d)).length;
    const cleanRatePct =
      totalDaysLogged > 0
        ? Math.round((cleanDaysProtected / totalDaysLogged) * 100)
        : 0;
    return {
      id: act.id,
      label: getHealthyActivityMeta(act.id).label,
      totalDaysLogged,
      cleanDaysProtected,
      cleanRatePct,
    };
  }).sort((a, b) => {
    if (b.cleanDaysProtected !== a.cleanDaysProtected) {
      return b.cleanDaysProtected - a.cleanDaysProtected;
    }
    if (b.cleanRatePct !== a.cleanRatePct) {
      return b.cleanRatePct - a.cleanRatePct;
    }
    return b.totalDaysLogged - a.totalDaysLogged;
  });

  const loggedActivities = breakdown.filter((b) => b.totalDaysLogged > 0);

  // 2. #1 Trigger & Danger Time analysis (relapse logs weighted 2x, urge logs 1x)
  const triggerScore = new Map<RelapseTrigger, { score: number; count: number }>();
  const windowScore = new Map<DangerTimeWindow, { score: number; count: number }>();

  const recordTrigger = (trigger: RelapseTrigger | undefined, weight: number) => {
    if (!trigger) return;
    const prev = triggerScore.get(trigger) ?? { score: 0, count: 0 };
    triggerScore.set(trigger, {
      score: prev.score + weight,
      count: prev.count + 1,
    });
  };

  const recordWindow = (win: DangerTimeWindow | undefined, hour: number, weight: number) => {
    const resolved = win ?? getTimeWindowFromHour(hour);
    const prev = windowScore.get(resolved) ?? { score: 0, count: 0 };
    windowScore.set(resolved, {
      score: prev.score + weight,
      count: prev.count + 1,
    });
  };

  for (const r of relapseLogs) {
    recordTrigger(r.trigger, 2);
    recordWindow(r.timeWindow, r.hour, 2);
  }
  for (const u of urgeLogs) {
    recordTrigger(u.trigger, 1);
    recordWindow(u.timeWindow, u.hour, 1);
  }

  const totalIncidents = relapseLogs.length + urgeLogs.length;
  const hasLoggedTrigger = triggerScore.size > 0;
  const hasLoggedWindow = windowScore.size > 0;

  let topTrigger = state.profile.hardestTrigger || 'Late Night';
  let topTriggerCount = 0;

  if (hasLoggedTrigger) {
    const sortedTriggers = Array.from(triggerScore.entries()).sort((a, b) => {
      if (b[1].score !== a[1].score) return b[1].score - a[1].score;
      return b[1].count - a[1].count;
    });
    topTrigger = sortedTriggers[0][0];
    topTriggerCount = sortedTriggers[0][1].count;
  }

  let dangerTime: DangerTimeWindow = inferWindowFromProfile(
    state.profile.vulnerabilityWindow
  );
  if (hasLoggedWindow) {
    const sortedWindows = Array.from(windowScore.entries()).sort((a, b) => {
      if (b[1].score !== a[1].score) return b[1].score - a[1].score;
      return b[1].count - a[1].count;
    });
    dangerTime = sortedWindows[0][0];
  }

  const dangerTimeRange = getTimeWindowRangeLabel(dangerTime);
  const sourceLabel = hasLoggedTrigger
    ? `Based on ${totalIncidents} logged ${totalIncidents === 1 ? 'event' : 'events'}`
    : hasLoggedWindow
    ? `Time from ${totalIncidents} urge ${totalIncidents === 1 ? 'session' : 'sessions'} · Trigger from setup`
    : 'Setup baseline · Updates as you log urges or resets';

  // 3. Overall 66-Day Consistency Rate
  const uniqueClearedOrFrozen = new Set([
    ...state.completedDays,
    ...(state.frozenDays ?? []),
  ]);
  const historyCleanDates = new Set(
    (state.history ?? [])
      .filter((h) => h.dayCompleted || h.frozen)
      .map((h) => h.date)
  );
  if (state.dayAdvancedToday) {
    historyCleanDates.add(todayKey);
  }

  const cleanDays = Math.max(uniqueClearedOrFrozen.size, historyCleanDates.size);
  const relapses = Math.max(state.relapseCount ?? 0, relapseLogs.length);
  const totalTrackedDays = cleanDays + relapses;

  const currentStreakDays = getCurrentCleanStreakDays(state);
  const bestStreakDays = getBestStreakDays(state);
  const journey66Pct = Math.min(
    100,
    Math.round((uniqueClearedOrFrozen.size / TOTAL_RESET_DAYS) * 100)
  );

  let ratePct = 0;
  let subtitle = 'Complete Day 1 habits to begin tracking your consistency rate.';

  if (totalTrackedDays > 0) {
    ratePct = Math.min(100, Math.round((cleanDays / totalTrackedDays) * 100));
    subtitle = `${cleanDays} clean ${cleanDays === 1 ? 'day' : 'days'} · ${relapses} ${
      relapses === 1 ? 'reset' : 'resets'
    } · ${uniqueClearedOrFrozen.size}/${TOTAL_RESET_DAYS} on active 66-day cycle`;
  } else if (state.habits.length > 0 && state.todayCheckedIds.length > 0) {
    const todayHabitPct = Math.round(
      (state.todayCheckedIds.length / state.habits.length) * 100
    );
    ratePct = todayHabitPct;
    subtitle = `Day 1 in progress · ${state.todayCheckedIds.length}/${state.habits.length} habits checked today`;
  }

  return {
    topProtectiveActivity: {
      hasData: loggedActivities.length > 0,
      top: loggedActivities[0] ?? null,
      runnerUp: loggedActivities[1] ?? null,
      totalLogsCount: activityLogs.length,
      breakdown,
    },
    triggerAnalysis: {
      hasLoggedData: hasLoggedTrigger || hasLoggedWindow,
      topTrigger,
      topTriggerCount,
      dangerTime,
      dangerTimeRange,
      dangerTimeLabel: `${dangerTime} (${dangerTimeRange})`,
      totalIncidents,
      preventionTip: inferTipForTrigger(topTrigger),
      sourceLabel,
    },
    consistency: {
      ratePct,
      cleanDays,
      totalTrackedDays,
      relapses,
      journey66Pct,
      currentStreakDays,
      bestStreakDays,
      subtitle,
    },
  };
}
