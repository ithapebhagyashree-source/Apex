import { DEFAULT_ANSWERS, generateTailoredHabits } from '../data/onboardingQuestions';
import { getPlantStageForDays } from '../data/recoveryCompanion';
import {
  AppState,
  FavoriteTrack,
  HabitCategory,
  RankTier,
  RpgStatKey,
  RpgStatsMap,
} from '../types';

const DEFAULT_FAVORITE_TRACKS: FavoriteTrack[] = [
  {
    id: 'trk-default-1',
    query: 'Kordhell - Murder In My Mind',
    tag: 'Phonk',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'trk-default-2',
    query: 'DVRST - Close Eyes',
    tag: 'Workout',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'trk-default-3',
    query: 'Hans Zimmer - Time',
    tag: 'Focus',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'trk-default-4',
    query: 'Nujabes - Feather',
    tag: 'Chill',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const STORAGE_KEY = 'life_reset_66_ultimate_v1';
export const TOTAL_RESET_DAYS = 66;
export const TOTAL_WEEKLY_PHASES = 10;
export const HABIT_XP = 30;
export const URGE_BREAKER_XP = 50;
export const ADVANCE_DAY_BONUS_XP = 40;
export const POMODORO_25_XP = 35;
export const POMODORO_50_XP = 75;
export const RPG_XP_PER_LEVEL = 120;

export interface FreezeMilestone {
  xp: number;
  label: string;
}

export const STREAK_FREEZE_MILESTONES: FreezeMilestone[] = [
  { xp: 600, label: 'Disciple Threshold' },
  { xp: 1800, label: 'Warrior Threshold' },
  { xp: 3500, label: 'Midpoint Endurance' },
  { xp: 5500, label: 'Titan Threshold' },
  { xp: 7500, label: 'Unstoppable Threshold' },
];

export function syncFreezeMilestones(state: AppState): {
  nextState: AppState;
  newlyEarned: number;
} {
  const earned = new Set(state.earnedFreezeMilestones ?? []);
  let newlyEarned = 0;

  for (const milestone of STREAK_FREEZE_MILESTONES) {
    if (state.totalXP >= milestone.xp && !earned.has(milestone.xp)) {
      earned.add(milestone.xp);
      newlyEarned += 1;
    }
  }

  if (newlyEarned === 0) {
    return { nextState: state, newlyEarned: 0 };
  }

  return {
    newlyEarned,
    nextState: {
      ...state,
      streakFreezeTokens: (state.streakFreezeTokens ?? 0) + newlyEarned,
      earnedFreezeMilestones: Array.from(earned).sort((a, b) => a - b),
    },
  };
}

export function getNextFreezeMilestone(state: AppState): {
  next: FreezeMilestone | null;
  xpRemaining: number;
  progressPct: number;
  earnedCount: number;
  totalMilestones: number;
} {
  const earnedSet = new Set(state.earnedFreezeMilestones ?? []);
  const next =
    STREAK_FREEZE_MILESTONES.find((m) => !earnedSet.has(m.xp)) ?? null;
  const earnedCount = earnedSet.size;
  const totalMilestones = STREAK_FREEZE_MILESTONES.length;

  if (!next) {
    return {
      next: null,
      xpRemaining: 0,
      progressPct: 100,
      earnedCount,
      totalMilestones,
    };
  }

  const nextIdx = STREAK_FREEZE_MILESTONES.findIndex((m) => m.xp === next.xp);
  const prevXP = nextIdx > 0 ? STREAK_FREEZE_MILESTONES[nextIdx - 1].xp : 0;
  const span = Math.max(1, next.xp - prevXP);
  const progressPct = Math.min(
    100,
    Math.max(0, Math.round(((state.totalXP - prevXP) / span) * 100))
  );

  return {
    next,
    xpRemaining: Math.max(0, next.xp - state.totalXP),
    progressPct,
    earnedCount,
    totalMilestones,
  };
}

export const DEFAULT_STAT_XP: RpgStatsMap = {
  discipline: 0,
  strength: 0,
  focus: 0,
  wisdom: 0,
  confidence: 0,
  vitality: 0,
};

export interface RpgStatMeta {
  key: RpgStatKey;
  label: string;
  shortLabel: string;
  fedBy: string;
}

export const RPG_STAT_META: RpgStatMeta[] = [
  { key: 'discipline', label: 'Discipline', shortLabel: 'Discipline', fedBy: 'Detox, Streaks & All Habits' },
  { key: 'strength', label: 'Strength', shortLabel: 'Strength', fedBy: 'Fitness & Nutrition' },
  { key: 'focus', label: 'Focus', shortLabel: 'Focus', fedBy: 'Focus Habits & Pomodoro' },
  { key: 'wisdom', label: 'Wisdom', shortLabel: 'Wisdom', fedBy: 'Mindset & Night Journal' },
  { key: 'confidence', label: 'Confidence', shortLabel: 'Confidence', fedBy: 'Urge Breaker & Day Clears' },
  { key: 'vitality', label: 'Vitality', shortLabel: 'Vitality', fedBy: 'Sleep, Nutrition & Fitness' },
];

export const HABIT_CATEGORY_STAT_MAP: Record<
  HabitCategory,
  Partial<Record<RpgStatKey, number>>
> = {
  Focus: { focus: 30, discipline: 10 },
  Fitness: { strength: 30, vitality: 10 },
  Nutrition: { vitality: 30, strength: 10 },
  Sleep: { vitality: 30, discipline: 10 },
  Mindset: { wisdom: 30, confidence: 10 },
  Detox: { discipline: 30, confidence: 10 },
};

const WEEKLY_PHASE_NAMES: string[] = [
  'Ignition',
  'Friction',
  'Neural Wiring',
  'Momentum',
  'Consolidation',
  'Midpoint Forge',
  'Endurance',
  'Autopilot',
  'Mastery',
  'Final Ascent',
];

export function getWeeklyPhaseInfo(currentDay: number): {
  week: number;
  totalWeeks: number;
  phaseName: string;
  dayInWeek: number;
  daysInThisWeek: number;
} {
  const clampedDay = Math.min(TOTAL_RESET_DAYS, Math.max(1, currentDay));
  const week = Math.min(TOTAL_WEEKLY_PHASES, Math.ceil(clampedDay / 7));
  const dayInWeek = ((clampedDay - 1) % 7) + 1;
  const daysInThisWeek = week === TOTAL_WEEKLY_PHASES ? 3 : 7;
  return {
    week,
    totalWeeks: TOTAL_WEEKLY_PHASES,
    phaseName: WEEKLY_PHASE_NAMES[week - 1] ?? 'Final Ascent',
    dayInWeek,
    daysInThisWeek,
  };
}

export function applyStatDelta(
  current: RpgStatsMap | undefined,
  deltas: Partial<Record<RpgStatKey, number>>
): RpgStatsMap {
  const base: RpgStatsMap = { ...DEFAULT_STAT_XP, ...(current ?? {}) };
  for (const key of Object.keys(deltas) as RpgStatKey[]) {
    const delta = deltas[key] ?? 0;
    base[key] = Math.max(0, (base[key] ?? 0) + delta);
  }
  return base;
}

export interface ComputedRpgStat {
  key: RpgStatKey;
  label: string;
  fedBy: string;
  xp: number;
  level: number;
  progressPct: number;
  xpInLevel: number;
  xpForNextLevel: number;
  radarScore: number; // 15..100 scaled cleanly for visual radar chart
}

export function getComputedRpgStats(state: AppState): ComputedRpgStat[] {
  const stats = { ...DEFAULT_STAT_XP, ...(state.statXP ?? {}) };
  const maxStatXP = Math.max(RPG_XP_PER_LEVEL * 2, ...Object.values(stats));

  return RPG_STAT_META.map((meta) => {
    const xp = Math.max(0, stats[meta.key] ?? 0);
    const level = Math.floor(xp / RPG_XP_PER_LEVEL) + 1;
    const xpInLevel = xp % RPG_XP_PER_LEVEL;
    const progressPct = Math.round((xpInLevel / RPG_XP_PER_LEVEL) * 100);
    const radarScore =
      xp === 0 ? 14 : Math.min(100, Math.round(18 + (xp / maxStatXP) * 82));

    return {
      key: meta.key,
      label: meta.label,
      fedBy: meta.fedBy,
      xp,
      level,
      progressPct,
      xpInLevel,
      xpForNextLevel: RPG_XP_PER_LEVEL - xpInLevel,
      radarScore,
    };
  });
}

export const RANK_TIERS: RankTier[] = [
  {
    name: 'Novice',
    minXP: 0,
    maxXP: 599,
    tagline: 'Day 1 foundations. Proving you can keep small promises.',
  },
  {
    name: 'Disciple',
    minXP: 600,
    maxXP: 1799,
    tagline: 'Routines are locking in. Mood no longer dictates action.',
  },
  {
    name: 'Warrior',
    minXP: 1800,
    maxXP: 3999,
    tagline: 'Friction is fuel. Urges break against your standards.',
  },
  {
    name: 'Titan',
    minXP: 4000,
    maxXP: 7499,
    tagline: 'Relentless consistency. Identity forged through repetition.',
  },
  {
    name: 'Unstoppable',
    minXP: 7500,
    maxXP: null,
    tagline: 'Total self-command. Discipline has become your default state.',
  },
];

export function getRankInfo(totalXP: number): {
  current: RankTier;
  next: RankTier | null;
  progressPercent: number;
  xpToNext: number;
  tierIndex: number;
} {
  let tierIndex = 0;
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (totalXP >= RANK_TIERS[i].minXP) {
      tierIndex = i;
    }
  }
  const current = RANK_TIERS[tierIndex];
  const next = tierIndex < RANK_TIERS.length - 1 ? RANK_TIERS[tierIndex + 1] : null;

  if (!next) {
    return {
      current,
      next: null,
      progressPercent: 100,
      xpToNext: 0,
      tierIndex,
    };
  }

  const span = next.minXP - current.minXP;
  const gained = totalXP - current.minXP;
  const progressPercent = Math.min(100, Math.max(0, Math.round((gained / span) * 100)));

  return {
    current,
    next,
    progressPercent,
    xpToNext: Math.max(0, next.minXP - totalXP),
    tierIndex,
  };
}

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createInitialState(): AppState {
  const today = getLocalDateKey();
  return {
    schemaVersion: 1,
    onboardingCompleted: false,
    profile: { ...DEFAULT_ANSWERS },
    habits: generateTailoredHabits(DEFAULT_ANSWERS),
    currentDay: 1,
    highestDayReached: 1,
    bestStreakDays: 1,
    completedDays: [],
    frozenDays: [],
    missedDays: [],
    todayCheckedIds: [],
    dayAdvancedToday: false,
    lastActiveDate: today,
    hardMode: false,
    lastHardModeResetDate: null,
    streakFreezeTokens: 0,
    earnedFreezeMilestones: [],
    lastFreezeAutoUsedDate: null,
    bossDamageByWeek: {},
    defeatedBossWeeks: [],
    totalXP: 0,
    dailyXPByDate: {},
    statXP: { ...DEFAULT_STAT_XP },
    pomodorosCompleted: 0,
    urgeBreakersCompleted: 0,
    relapseCount: 0,
    soundEnabled: true,
    history: [],
    pinnedQuoteIds: ['dg-1', 'ma-1', 'jw-1'],
    journalEntries: [],
    mentorMessages: [
      {
        id: 'mentor-welcome',
        sender: 'mentor',
        text: 'Offline Discipline Mentor standing by. Pick a trigger below or describe what you are fighting right now. No fluff, no excuses—just your next move.',
        triggerLabel: 'Briefing',
        timestamp: new Date().toISOString(),
      },
    ],
    gardenArchive: [],
    healthyActivityLogs: [],
    relapseLogs: [],
    urgeLogs: [],
    arcProgress: {},
    completedArcIds: [],
    favoriteTracks: DEFAULT_FAVORITE_TRACKS.map((t) => ({ ...t })),
    startedAt: new Date().toISOString(),
  };
}

function daysBetweenLocalDateKeys(fromKey: string, toKey: string): number {
  const [fy, fm, fd] = fromKey.split('-').map(Number);
  const [ty, tm, td] = toKey.split('-').map(Number);
  if (!fy || !fm || !fd || !ty || !tm || !td) return 1;
  const fromUtc = Date.UTC(fy, fm - 1, fd);
  const toUtc = Date.UTC(ty, tm - 1, td);
  return Math.round((toUtc - fromUtc) / 86_400_000);
}

export function applyMidnightRollover(state: AppState): AppState {
  const today = getLocalDateKey();
  if (!state.lastActiveDate || state.lastActiveDate === today) {
    return state;
  }

  const daysGap = daysBetweenLocalDateKeys(state.lastActiveDate, today);
  const allYesterdayHabitsChecked =
    state.habits.length > 0 &&
    state.habits.every((h) => state.todayCheckedIds.includes(h.id));
  const yesterdayFinished = state.dayAdvancedToday || allYesterdayHabitsChecked;

  // Hard Mode enforcement: if yesterday's habits weren't finished (or >1 day skipped),
  // check if a Streak Freeze token can auto-shield a single missed day before resetting to Day 1
  const missedUnderHardMode =
    state.hardMode &&
    state.onboardingCompleted &&
    (daysGap > 1 || !yesterdayFinished) &&
    (state.currentDay > 1 ||
      state.completedDays.length > 0 ||
      state.todayCheckedIds.length > 0);

  const canAutoFreeze =
    missedUnderHardMode &&
    daysGap === 1 &&
    (state.streakFreezeTokens ?? 0) > 0;

  const shouldHardModeReset = missedUnderHardMode && !canAutoFreeze;

  // Save yesterday's activity snapshot into history if not already recorded for that date
  const alreadyLogged = state.history.some((entry) => entry.date === state.lastActiveDate);
  const nextHistory = [...state.history];

  if (
    !alreadyLogged &&
    (state.todayCheckedIds.length > 0 ||
      state.dayAdvancedToday ||
      shouldHardModeReset ||
      canAutoFreeze)
  ) {
    nextHistory.unshift({
      date: state.lastActiveDate,
      dayNumber: state.dayAdvancedToday ? Math.max(1, state.currentDay - 1) : state.currentDay,
      completedHabitIds: [...state.todayCheckedIds],
      totalHabits: state.habits.length,
      dayCompleted: state.dayAdvancedToday,
      xpEarned: state.todayCheckedIds.length * HABIT_XP,
      relapsed: shouldHardModeReset ? true : undefined,
      frozen: canAutoFreeze ? true : undefined,
    });
  }

  if (canAutoFreeze) {
    const protectedDay = state.currentDay;
    const nextFrozenDays = state.frozenDays.includes(protectedDay)
      ? state.frozenDays
      : [...state.frozenDays, protectedDay];
    return {
      ...state,
      frozenDays: nextFrozenDays,
      streakFreezeTokens: Math.max(0, state.streakFreezeTokens - 1),
      lastFreezeAutoUsedDate: today,
      todayCheckedIds: [],
      dayAdvancedToday: false,
      lastActiveDate: today,
      history: nextHistory.slice(0, 180),
    };
  }

  if (shouldHardModeReset) {
    const endedStreak = Math.max(
      1,
      state.currentDay,
      new Set([...state.completedDays, ...(state.frozenDays ?? [])]).size
    );
    const stage = getPlantStageForDays(endedStreak);
    const nextBestStreak = Math.max(
      state.bestStreakDays ?? 1,
      state.highestDayReached ?? 1,
      endedStreak
    );
    const archivedTree = {
      id: `garden-hm-${Date.now()}`,
      stageId: stage.id,
      stageName: stage.name,
      daysGrown: endedStreak,
      archivedDate: state.lastActiveDate,
      outcome: 'relapse' as const,
      trigger: 'Fatigue' as const,
    };

    return {
      ...state,
      currentDay: 1,
      bestStreakDays: nextBestStreak,
      completedDays: [],
      frozenDays: [],
      missedDays: [],
      todayCheckedIds: [],
      dayAdvancedToday: false,
      lastActiveDate: today,
      lastHardModeResetDate: today,
      relapseCount: state.relapseCount + 1,
      gardenArchive: [archivedTree, ...(state.gardenArchive ?? [])].slice(0, 36),
      bossDamageByWeek: {
        ...state.bossDamageByWeek,
        1: 0,
      },
      history: nextHistory.slice(0, 180),
    };
  }

  return {
    ...state,
    todayCheckedIds: [],
    dayAdvancedToday: false,
    lastActiveDate: today,
    history: nextHistory.slice(0, 180),
  };
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = createInitialState();
    const merged: AppState = {
      ...base,
      ...parsed,
      profile: {
        ...base.profile,
        ...(parsed.profile ?? {}),
      },
      habits: Array.isArray(parsed.habits) && parsed.habits.length > 0 ? parsed.habits : base.habits,
      highestDayReached: Math.max(
        typeof parsed.highestDayReached === 'number' ? parsed.highestDayReached : 1,
        typeof parsed.currentDay === 'number' ? parsed.currentDay : 1,
        ...(Array.isArray(parsed.completedDays) ? parsed.completedDays : [1])
      ),
      bestStreakDays: Math.max(
        typeof parsed.bestStreakDays === 'number' ? parsed.bestStreakDays : 1,
        typeof parsed.highestDayReached === 'number' ? parsed.highestDayReached : 1,
        typeof parsed.currentDay === 'number' ? parsed.currentDay : 1,
        ...(Array.isArray(parsed.completedDays) ? parsed.completedDays : [1]),
        ...(Array.isArray(parsed.gardenArchive)
          ? parsed.gardenArchive.map((g) => (typeof g?.daysGrown === 'number' ? g.daysGrown : 1))
          : [1])
      ),
      completedDays: Array.isArray(parsed.completedDays) ? parsed.completedDays : [],
      frozenDays: Array.isArray(parsed.frozenDays) ? parsed.frozenDays : [],
      missedDays: Array.isArray(parsed.missedDays) ? parsed.missedDays : [],
      todayCheckedIds: Array.isArray(parsed.todayCheckedIds) ? parsed.todayCheckedIds : [],
      hardMode: Boolean(parsed.hardMode),
      lastHardModeResetDate:
        typeof parsed.lastHardModeResetDate === 'string'
          ? parsed.lastHardModeResetDate
          : null,
      streakFreezeTokens:
        typeof parsed.streakFreezeTokens === 'number'
          ? Math.max(0, parsed.streakFreezeTokens)
          : 0,
      earnedFreezeMilestones: Array.isArray(parsed.earnedFreezeMilestones)
        ? parsed.earnedFreezeMilestones
        : [],
      lastFreezeAutoUsedDate:
        typeof parsed.lastFreezeAutoUsedDate === 'string'
          ? parsed.lastFreezeAutoUsedDate
          : null,
      bossDamageByWeek:
        parsed.bossDamageByWeek && typeof parsed.bossDamageByWeek === 'object'
          ? parsed.bossDamageByWeek
          : {},
      defeatedBossWeeks: Array.isArray(parsed.defeatedBossWeeks)
        ? parsed.defeatedBossWeeks
        : [],
      dailyXPByDate:
        parsed.dailyXPByDate && typeof parsed.dailyXPByDate === 'object'
          ? parsed.dailyXPByDate
          : {},
      statXP:
        parsed.statXP && typeof parsed.statXP === 'object'
          ? { ...DEFAULT_STAT_XP, ...parsed.statXP }
          : { ...DEFAULT_STAT_XP },
      pomodorosCompleted:
        typeof parsed.pomodorosCompleted === 'number' ? parsed.pomodorosCompleted : 0,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      pinnedQuoteIds: Array.isArray(parsed.pinnedQuoteIds) ? parsed.pinnedQuoteIds : base.pinnedQuoteIds,
      journalEntries: Array.isArray(parsed.journalEntries) ? parsed.journalEntries : [],
      mentorMessages:
        Array.isArray(parsed.mentorMessages) && parsed.mentorMessages.length > 0
          ? parsed.mentorMessages
          : base.mentorMessages,
      gardenArchive: Array.isArray(parsed.gardenArchive) ? parsed.gardenArchive : [],
      healthyActivityLogs: Array.isArray(parsed.healthyActivityLogs)
        ? parsed.healthyActivityLogs
        : [],
      relapseLogs: Array.isArray(parsed.relapseLogs) ? parsed.relapseLogs : [],
      urgeLogs: Array.isArray(parsed.urgeLogs) ? parsed.urgeLogs : [],
      arcProgress:
        parsed.arcProgress && typeof parsed.arcProgress === 'object'
          ? parsed.arcProgress
          : {},
      completedArcIds: Array.isArray(parsed.completedArcIds)
        ? parsed.completedArcIds
        : [],
      favoriteTracks: Array.isArray(parsed.favoriteTracks)
        ? parsed.favoriteTracks
        : base.favoriteTracks,
    };
    return applyMidnightRollover(merged);
  } catch {
    return createInitialState();
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Handle storage quota gracefully
  }
}

export function validateBackupPayload(rawText: string): {
  valid: boolean;
  data?: AppState;
  error?: string;
} {
  try {
    const parsed = JSON.parse(rawText) as Partial<AppState>;
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'Backup file is not a valid JSON object.' };
    }
    if (
      typeof parsed.currentDay !== 'number' ||
      parsed.currentDay < 1 ||
      parsed.currentDay > TOTAL_RESET_DAYS
    ) {
      return {
        valid: false,
        error: 'Backup is missing a valid currentDay (1–66).',
      };
    }
    if (!Array.isArray(parsed.habits)) {
      return { valid: false, error: 'Backup is missing a valid habits list.' };
    }

    const base = createInitialState();
    const restored: AppState = {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...(parsed.profile ?? {}) },
      habits: parsed.habits,
      highestDayReached: Math.max(
        typeof parsed.highestDayReached === 'number' ? parsed.highestDayReached : 1,
        parsed.currentDay,
        ...(Array.isArray(parsed.completedDays) ? parsed.completedDays : [1])
      ),
      bestStreakDays: Math.max(
        typeof parsed.bestStreakDays === 'number' ? parsed.bestStreakDays : 1,
        typeof parsed.highestDayReached === 'number' ? parsed.highestDayReached : 1,
        parsed.currentDay,
        ...(Array.isArray(parsed.completedDays) ? parsed.completedDays : [1]),
        ...(Array.isArray(parsed.gardenArchive)
          ? parsed.gardenArchive.map((g) => (typeof g?.daysGrown === 'number' ? g.daysGrown : 1))
          : [1])
      ),
      completedDays: Array.isArray(parsed.completedDays) ? parsed.completedDays : [],
      frozenDays: Array.isArray(parsed.frozenDays) ? parsed.frozenDays : [],
      missedDays: Array.isArray(parsed.missedDays) ? parsed.missedDays : [],
      todayCheckedIds: Array.isArray(parsed.todayCheckedIds) ? parsed.todayCheckedIds : [],
      hardMode: Boolean(parsed.hardMode),
      lastHardModeResetDate:
        typeof parsed.lastHardModeResetDate === 'string'
          ? parsed.lastHardModeResetDate
          : null,
      streakFreezeTokens:
        typeof parsed.streakFreezeTokens === 'number'
          ? Math.max(0, parsed.streakFreezeTokens)
          : 0,
      earnedFreezeMilestones: Array.isArray(parsed.earnedFreezeMilestones)
        ? parsed.earnedFreezeMilestones
        : [],
      lastFreezeAutoUsedDate:
        typeof parsed.lastFreezeAutoUsedDate === 'string'
          ? parsed.lastFreezeAutoUsedDate
          : null,
      bossDamageByWeek:
        parsed.bossDamageByWeek && typeof parsed.bossDamageByWeek === 'object'
          ? parsed.bossDamageByWeek
          : {},
      defeatedBossWeeks: Array.isArray(parsed.defeatedBossWeeks)
        ? parsed.defeatedBossWeeks
        : [],
      dailyXPByDate:
        parsed.dailyXPByDate && typeof parsed.dailyXPByDate === 'object'
          ? parsed.dailyXPByDate
          : {},
      statXP:
        parsed.statXP && typeof parsed.statXP === 'object'
          ? { ...DEFAULT_STAT_XP, ...parsed.statXP }
          : { ...DEFAULT_STAT_XP },
      pomodorosCompleted:
        typeof parsed.pomodorosCompleted === 'number' ? parsed.pomodorosCompleted : 0,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      pinnedQuoteIds: Array.isArray(parsed.pinnedQuoteIds) ? parsed.pinnedQuoteIds : [],
      journalEntries: Array.isArray(parsed.journalEntries) ? parsed.journalEntries : [],
      mentorMessages:
        Array.isArray(parsed.mentorMessages) && parsed.mentorMessages.length > 0
          ? parsed.mentorMessages
          : base.mentorMessages,
      gardenArchive: Array.isArray(parsed.gardenArchive) ? parsed.gardenArchive : [],
      healthyActivityLogs: Array.isArray(parsed.healthyActivityLogs)
        ? parsed.healthyActivityLogs
        : [],
      relapseLogs: Array.isArray(parsed.relapseLogs) ? parsed.relapseLogs : [],
      urgeLogs: Array.isArray(parsed.urgeLogs) ? parsed.urgeLogs : [],
      arcProgress:
        parsed.arcProgress && typeof parsed.arcProgress === 'object'
          ? parsed.arcProgress
          : {},
      completedArcIds: Array.isArray(parsed.completedArcIds)
        ? parsed.completedArcIds
        : [],
      favoriteTracks: Array.isArray(parsed.favoriteTracks)
        ? parsed.favoriteTracks
        : base.favoriteTracks,
      lastActiveDate: parsed.lastActiveDate || getLocalDateKey(),
    };

    return { valid: true, data: restored };
  } catch {
    return { valid: false, error: 'Could not parse JSON. Ensure the file is a valid Life Reset backup.' };
  }
}

export interface DailyXPPoint {
  date: string;
  shortDay: string;
  fullLabel: string;
  xp: number;
  isToday: boolean;
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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

export function getLast7DaysXPTrend(state: AppState): DailyXPPoint[] {
  const now = new Date();
  const todayKey = getLocalDateKey(now);

  // Aggregate historical XP by date as fallback for older backups or pre-existing logs
  const historyByDate: Record<string, number> = {};
  for (const entry of state.history) {
    historyByDate[entry.date] = Math.max(
      historyByDate[entry.date] ?? 0,
      entry.xpEarned ?? 0
    );
  }

  const liveTodayHabitXP =
    state.habits.filter((h) => state.todayCheckedIds.includes(h.id)).length *
      HABIT_XP +
    (state.dayAdvancedToday ? ADVANCE_DAY_BONUS_XP : 0);

  const points: DailyXPPoint[] = [];

  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = getLocalDateKey(d);
    const isToday = key === todayKey;

    const trackedXP = state.dailyXPByDate?.[key];
    const historyXP = historyByDate[key] ?? 0;

    let xp = 0;
    if (typeof trackedXP === 'number') {
      xp = isToday ? Math.max(trackedXP, liveTodayHabitXP) : trackedXP;
    } else if (isToday) {
      xp = Math.max(historyXP, liveTodayHabitXP);
    } else {
      xp = historyXP;
    }

    points.push({
      date: key,
      shortDay: isToday ? 'Today' : WEEKDAY_SHORT[d.getDay()],
      fullLabel: `${WEEKDAY_SHORT[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`,
      xp: Math.max(0, xp),
      isToday,
    });
  }

  return points;
}
