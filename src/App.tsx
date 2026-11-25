import { useCallback, useEffect, useMemo, useState } from 'react';
import { Flame, Sparkles, Wrench } from 'lucide-react';
import { AnimeCodex } from './components/AnimeCodex';
import { BottomNav } from './components/BottomNav';
import { DailyMantraModal } from './components/DailyMantraModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HabitsAndHeatmap } from './components/HabitsAndHeatmap';
import { JournalAndVault } from './components/JournalAndVault';
import { MiniTools } from './components/MiniTools';
import { OnboardingWizard } from './components/OnboardingWizard';
import { PerformanceReview } from './components/PerformanceReview';
import { ProgressDashboard } from './components/ProgressDashboard';
import { QuoteVault } from './components/QuoteVault';
import { RelapseResetPayload } from './components/RelapseCompassionateModal';
import { SettingsModule } from './components/SettingsModule';
import { UrgeAndMentor } from './components/UrgeAndMentor';
import {
  UrgeBreakerModal,
  UrgeCompletionPayload,
  UrgeTimerMinutes,
} from './components/UrgeBreakerModal';
import {
  MANTRA_CARD_DECK,
  getDailySessionMantraCard,
  getUnlockedMantraCards,
} from './data/mantraCards';
import { getOfflineMentorReply } from './data/mentorResponses';
import {
  getHealthyActivityMeta,
  getPlantStageForDays,
  getTimeWindowFromHour,
} from './data/recoveryCompanion';
import { FOUR_SEASON_IDS, getSeasonalArcById } from './data/seasonalArcs';
import {
  ADVANCE_DAY_BOSS_DAMAGE,
  HABIT_BOSS_DAMAGE,
  POMODORO_25_BOSS_DAMAGE,
  POMODORO_50_BOSS_DAMAGE,
  URGE_BREAKER_BOSS_DAMAGE,
  getBossForWeek,
} from './data/weeklyBosses';
import {
  AppState,
  ArcProgressRecord,
  Habit,
  HabitCategory,
  HealthyActivityId,
  MantraCard,
  ModuleTab,
  OnboardingAnswers,
  RelapseTrigger,
  RpgStatKey,
  SeasonalArcId,
  TrackTag,
} from './types';
import {
  playAdvanceDayChime,
  playHabitCheckChime,
  playUrgeCompleteChime,
} from './utils/audio';
import { getCurrentCleanStreakDays } from './utils/recoveryInsights';
import {
  ADVANCE_DAY_BONUS_XP,
  HABIT_CATEGORY_STAT_MAP,
  HABIT_XP,
  TOTAL_RESET_DAYS,
  URGE_BREAKER_XP,
  applyMidnightRollover,
  applyStatDelta,
  createInitialState,
  getLocalDateKey,
  getRankInfo,
  getWeeklyPhaseInfo,
  loadAppState,
  saveAppState,
  syncFreezeMilestones,
} from './utils/storage';

const SESSION_MANTRA_KEY = 'life_reset_daily_mantra_shown_v1';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<ModuleTab>('progress');
  const [quotesSubView, setQuotesSubView] = useState<'quotes' | 'deck'>('quotes');
  const [isRetakingQuiz, setIsRetakingQuiz] = useState(false);
  const [urgeModalOpen, setUrgeModalOpen] = useState(false);
  const [urgeModalDuration, setUrgeModalDuration] =
    useState<UrgeTimerMinutes>(5);
  const [urgeModalTrigger, setUrgeModalTrigger] = useState<
    RelapseTrigger | undefined
  >(undefined);

  const handleOpenUrgeBreaker = useCallback(
    (durationMinutes: UrgeTimerMinutes = 5, trigger?: RelapseTrigger) => {
      setUrgeModalDuration(durationMinutes);
      setUrgeModalTrigger(trigger);
      setUrgeModalOpen(true);
    },
    []
  );
  const [mantraModalOpen, setMantraModalOpen] = useState<boolean>(() => {
    try {
      const initial = loadAppState();
      if (!initial.onboardingCompleted) return false;
      return !sessionStorage.getItem(SESSION_MANTRA_KEY);
    } catch {
      return false;
    }
  });
  const [activeMantraCard, setActiveMantraCard] = useState<MantraCard>(() =>
    getDailySessionMantraCard(loadAppState().highestDayReached, getLocalDateKey())
  );
  const [toast, setToast] = useState<string | null>(null);

  const unlockedMantraCards = useMemo(
    () => getUnlockedMantraCards(state.highestDayReached),
    [state.highestDayReached]
  );

  const handleCloseMantraModal = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_MANTRA_KEY, '1');
    } catch {
      // Ignore storage restriction
    }
    setMantraModalOpen(false);
  }, []);

  const handleOpenDailyMantra = useCallback(
    (specificCard?: MantraCard) => {
      if (specificCard) {
        setActiveMantraCard(specificCard);
      } else {
        setActiveMantraCard(
          getDailySessionMantraCard(state.highestDayReached, getLocalDateKey())
        );
      }
      setMantraModalOpen(true);
    },
    [state.highestDayReached]
  );

  const handleDrawAnotherMantra = useCallback(() => {
    if (unlockedMantraCards.length <= 1) return;
    const candidates = unlockedMantraCards.filter(
      (c) => c.id !== activeMantraCard.id
    );
    const next =
      candidates[Math.floor(Math.random() * candidates.length)] ??
      unlockedMantraCards[0];
    setActiveMantraCard(next);
  }, [unlockedMantraCards, activeMantraCard.id]);

  const handleOpenCardDeckFromModal = useCallback(() => {
    handleCloseMantraModal();
    setQuotesSubView('deck');
    setActiveTab('quotes');
  }, [handleCloseMantraModal]);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Persist every state change automatically to localStorage
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Automatically award Streak Freeze tokens whenever totalXP crosses a major milestone
  useEffect(() => {
    const { nextState, newlyEarned } = syncFreezeMilestones(state);
    if (newlyEarned > 0) {
      setState(nextState);
      showToast(
        `Milestone reached! Earned +${newlyEarned} Streak Freeze ${
          newlyEarned === 1 ? 'Token' : 'Tokens'
        }.`
      );
    }
  }, [state.totalXP]);

  // Watch for midnight date rollover while app stays open
  useEffect(() => {
    const checkMidnight = () => {
      setState((prev) => {
        const next = applyMidnightRollover(prev);
        return next === prev ? prev : next;
      });
    };
    const interval = window.setInterval(checkMidnight, 30_000);
    window.addEventListener('focus', checkMidnight);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', checkMidnight);
    };
  }, []);

  const handleCompleteOnboarding = (
    answers: OnboardingAnswers,
    generatedHabits: Habit[]
  ) => {
    setState((prev) => ({
      ...prev,
      onboardingCompleted: true,
      profile: answers,
      habits: generatedHabits,
      todayCheckedIds: isRetakingQuiz
        ? []
        : prev.todayCheckedIds,
    }));
    const wasRetake = isRetakingQuiz;
    setIsRetakingQuiz(false);
    setActiveTab('progress');
    if (!wasRetake) {
      setActiveMantraCard(
        getDailySessionMantraCard(state.highestDayReached, getLocalDateKey())
      );
      setMantraModalOpen(true);
    }
    showToast(
      wasRetake
        ? 'Protocol updated with 6 tailored non-negotiables.'
        : 'Day 1 locked in. Execute your habits.'
    );
  };

  const applyBossCombatDelta = (
    prev: AppState,
    damageDelta: number
  ): {
    bossDamageByWeek: Record<number, number>;
    defeatedBossWeeks: number[];
    bountyXP: number;
    defeatedBossName: string | null;
  } => {
    const activeWeek = getWeeklyPhaseInfo(prev.currentDay).week;
    const boss = getBossForWeek(activeWeek);
    const alreadyDefeated = prev.defeatedBossWeeks.includes(activeWeek);
    const currentDmg = prev.bossDamageByWeek?.[activeWeek] ?? 0;

    if (alreadyDefeated) {
      return {
        bossDamageByWeek: prev.bossDamageByWeek,
        defeatedBossWeeks: prev.defeatedBossWeeks,
        bountyXP: 0,
        defeatedBossName: null,
      };
    }

    const nextDmg = Math.min(boss.maxHp, Math.max(0, currentDmg + damageDelta));
    const newlyDefeated = nextDmg >= boss.maxHp;

    return {
      bossDamageByWeek: {
        ...prev.bossDamageByWeek,
        [activeWeek]: nextDmg,
      },
      defeatedBossWeeks: newlyDefeated
        ? [...prev.defeatedBossWeeks, activeWeek]
        : prev.defeatedBossWeeks,
      bountyXP: newlyDefeated ? boss.bountyXP : 0,
      defeatedBossName: newlyDefeated ? boss.name : null,
    };
  };

  const handleToggleHabit = (habitId: string) => {
    let slainBossToast: string | null = null;
    setState((prev) => {
      const isChecked = prev.todayCheckedIds.includes(habitId);
      const nextCheckedIds = isChecked
        ? prev.todayCheckedIds.filter((id) => id !== habitId)
        : [...prev.todayCheckedIds, habitId];

      const deltaXP = isChecked ? -HABIT_XP : HABIT_XP;
      if (!isChecked) {
        playHabitCheckChime(prev.soundEnabled);
      }

      const todayKey = getLocalDateKey();
      const prevTodayXP =
        prev.dailyXPByDate?.[todayKey] ??
        prev.todayCheckedIds.length * HABIT_XP;

      const toggledHabit = prev.habits.find((h) => h.id === habitId);
      const categoryDeltas = toggledHabit
        ? HABIT_CATEGORY_STAT_MAP[toggledHabit.category]
        : { discipline: 20 };

      const signedStatDeltas: Partial<Record<RpgStatKey, number>> = {};
      for (const key of Object.keys(categoryDeltas) as RpgStatKey[]) {
        const val = categoryDeltas[key] ?? 0;
        signedStatDeltas[key] = isChecked ? -val : val;
      }

      const bossResult = applyBossCombatDelta(
        prev,
        isChecked ? -HABIT_BOSS_DAMAGE : HABIT_BOSS_DAMAGE
      );
      if (bossResult.defeatedBossName) {
        playUrgeCompleteChime(prev.soundEnabled);
        slainBossToast = `Boss Defeated: ${bossResult.defeatedBossName}! +${bossResult.bountyXP} XP Bounty`;
      }

      const extraStatBonus: Partial<Record<RpgStatKey, number>> =
        bossResult.bountyXP > 0 ? { strength: 40, discipline: 40 } : {};
      const nextStatXP = applyStatDelta(
        applyStatDelta(prev.statXP, signedStatDeltas),
        extraStatBonus
      );

      return {
        ...prev,
        todayCheckedIds: nextCheckedIds,
        totalXP: Math.max(0, prev.totalXP + deltaXP + bossResult.bountyXP),
        dailyXPByDate: {
          ...prev.dailyXPByDate,
          [todayKey]: Math.max(0, prevTodayXP + deltaXP + bossResult.bountyXP),
        },
        statXP: nextStatXP,
        bossDamageByWeek: bossResult.bossDamageByWeek,
        defeatedBossWeeks: bossResult.defeatedBossWeeks,
      };
    });
    if (slainBossToast) {
      showToast(slainBossToast);
    }
  };

  const handleAddHabit = (
    habitInput: Omit<Habit, 'id' | 'createdAt' | 'xpValue'>
  ) => {
    const newHabit: Habit = {
      ...habitInput,
      id: `hab-custom-${Date.now()}`,
      xpValue: HABIT_XP,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      habits: [...prev.habits, newHabit],
    }));
    showToast(`Added "${newHabit.title}" (+${HABIT_XP} XP daily)`);
  };

  const handleUpdateHabit = (
    id: string,
    updates: { title: string; category: HabitCategory; targetDetail: string }
  ) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
    showToast('Habit updated.');
  };

  const handleDeleteHabit = (id: string) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== id),
      todayCheckedIds: prev.todayCheckedIds.filter((cid) => cid !== id),
    }));
    showToast('Habit removed.');
  };

  const handleAdvanceDay = () => {
    setState((prev) => {
      if (prev.dayAdvancedToday || prev.completedDays.length >= TOTAL_RESET_DAYS) {
        return prev;
      }
      const allDone =
        prev.habits.length > 0 &&
        prev.habits.every((h) => prev.todayCheckedIds.includes(h.id));
      if (!allDone) return prev;

      playAdvanceDayChime(prev.soundEnabled);

      const completedDayNum = prev.currentDay;
      const nextCompletedDays = prev.completedDays.includes(completedDayNum)
        ? prev.completedDays
        : [...prev.completedDays, completedDayNum];

      const nextDay = Math.min(TOTAL_RESET_DAYS, completedDayNum + 1);
      const nextHighestDay = Math.max(prev.highestDayReached, nextDay);
      const nextBestStreak = Math.max(
        prev.bestStreakDays ?? 1,
        nextHighestDay,
        nextCompletedDays.length
      );
      const todayKey = getLocalDateKey();

      const historyEntry = {
        date: todayKey,
        dayNumber: completedDayNum,
        completedHabitIds: [...prev.todayCheckedIds],
        totalHabits: prev.habits.length,
        dayCompleted: true,
        xpEarned: prev.todayCheckedIds.length * HABIT_XP + ADVANCE_DAY_BONUS_XP,
      };

      const filteredHistory = prev.history.filter(
        (h) => !(h.date === todayKey && h.dayNumber === completedDayNum)
      );

      const prevTodayXP =
        prev.dailyXPByDate?.[todayKey] ??
        prev.todayCheckedIds.length * HABIT_XP;

      const bossResult = applyBossCombatDelta(prev, ADVANCE_DAY_BOSS_DAMAGE);

      // Auto-advance any currently active seasonal arcs / challenges that haven't been logged today
      const activeArcIds = (
        Object.keys(prev.arcProgress ?? {}) as SeasonalArcId[]
      ).filter((id) => {
        const rec = prev.arcProgress?.[id];
        return (
          id !== 'complete-year-circle' &&
          rec?.active &&
          rec.lastLoggedDate !== todayKey &&
          rec.completedDays < getSeasonalArcById(id).durationDays
        );
      });

      const arcStep = applyArcDayProgress(prev, activeArcIds, todayKey);
      const totalBonus =
        ADVANCE_DAY_BONUS_XP + bossResult.bountyXP + arcStep.bonusXP;

      // If conquering Day 66, archive the Flourishing Tree into My Garden
      let nextGardenArchive = prev.gardenArchive ?? [];
      if (completedDayNum >= TOTAL_RESET_DAYS) {
        const finalStage = getPlantStageForDays(TOTAL_RESET_DAYS);
        nextGardenArchive = [
          {
            id: `garden-66-${Date.now()}`,
            stageId: finalStage.id,
            stageName: finalStage.name,
            daysGrown: TOTAL_RESET_DAYS,
            archivedDate: todayKey,
            outcome: 'completed' as const,
          },
          ...nextGardenArchive,
        ].slice(0, 36);
      }

      return {
        ...prev,
        completedDays: nextCompletedDays,
        missedDays: prev.missedDays.filter((d) => d !== completedDayNum),
        currentDay: nextDay,
        highestDayReached: nextHighestDay,
        bestStreakDays: nextBestStreak,
        gardenArchive: nextGardenArchive,
        arcProgress: arcStep.arcProgress,
        completedArcIds: arcStep.completedArcIds,
        dayAdvancedToday: true,
        totalXP: prev.totalXP + totalBonus,
        dailyXPByDate: {
          ...prev.dailyXPByDate,
          [todayKey]: prevTodayXP + totalBonus,
        },
        statXP: applyStatDelta(
          applyStatDelta(prev.statXP, {
            discipline: 20 + (bossResult.bountyXP > 0 ? 40 : 0),
            confidence: 20,
            strength: bossResult.bountyXP > 0 ? 40 : 0,
          }),
          arcStep.statDeltas
        ),
        bossDamageByWeek: bossResult.bossDamageByWeek,
        defeatedBossWeeks: bossResult.defeatedBossWeeks,
        history: [historyEntry, ...filteredHistory].slice(0, 180),
      };
    });

    const projectedNextDay = Math.min(TOTAL_RESET_DAYS, state.currentDay + 1);
    const newlyUnlockedCard = MANTRA_CARD_DECK.find(
      (c) => c.unlockDay === projectedNextDay && projectedNextDay > state.highestDayReached
    );
    if (newlyUnlockedCard) {
      showToast(
        `Day conquered (+${ADVANCE_DAY_BONUS_XP} XP) · Unlocked Mantra Card: ${newlyUnlockedCard.title}`
      );
    } else {
      showToast(`Day conquered! +${ADVANCE_DAY_BONUS_XP} XP bonus awarded.`);
    }
  };

  const handleUseStreakFreeze = () => {
    setState((prev) => {
      if (
        prev.streakFreezeTokens <= 0 ||
        prev.dayAdvancedToday ||
        new Set([...prev.completedDays, ...(prev.frozenDays ?? [])]).size >=
          TOTAL_RESET_DAYS
      ) {
        return prev;
      }

      playHabitCheckChime(prev.soundEnabled);

      const frozenDayNum = prev.currentDay;
      const nextFrozenDays = (prev.frozenDays ?? []).includes(frozenDayNum)
        ? prev.frozenDays
        : [...(prev.frozenDays ?? []), frozenDayNum];
      const nextDay = Math.min(TOTAL_RESET_DAYS, frozenDayNum + 1);
      const nextHighestDay = Math.max(prev.highestDayReached, nextDay);
      const todayKey = getLocalDateKey();

      const freezeEntry = {
        date: todayKey,
        dayNumber: frozenDayNum,
        completedHabitIds: [...prev.todayCheckedIds],
        totalHabits: prev.habits.length,
        dayCompleted: false,
        xpEarned: prev.todayCheckedIds.length * HABIT_XP,
        frozen: true,
      };

      const filteredHistory = prev.history.filter(
        (h) => !(h.date === todayKey && h.dayNumber === frozenDayNum)
      );

      return {
        ...prev,
        streakFreezeTokens: Math.max(0, prev.streakFreezeTokens - 1),
        frozenDays: nextFrozenDays,
        missedDays: prev.missedDays.filter((d) => d !== frozenDayNum),
        currentDay: nextDay,
        highestDayReached: nextHighestDay,
        bestStreakDays: Math.max(prev.bestStreakDays ?? 1, nextHighestDay),
        dayAdvancedToday: true,
        history: [freezeEntry, ...filteredHistory].slice(0, 180),
      };
    });
    showToast('Streak Freeze deployed! Day protected without breaking your streak.');
  };

  const handleToggleHealthyActivity = (activityId: HealthyActivityId) => {
    const todayKey = getLocalDateKey();
    const now = new Date();
    const meta = getHealthyActivityMeta(activityId);
    const alreadyLoggedToday = (state.healthyActivityLogs ?? []).some(
      (l) => l.date === todayKey && l.activityId === activityId
    );

    if (!alreadyLoggedToday) {
      playHabitCheckChime(state.soundEnabled);
    }

    setState((prev) => {
      const logs = prev.healthyActivityLogs ?? [];
      const existingToday = logs.some(
        (l) => l.date === todayKey && l.activityId === activityId
      );

      if (existingToday) {
        return {
          ...prev,
          healthyActivityLogs: logs.filter(
            (l) => !(l.date === todayKey && l.activityId === activityId)
          ),
        };
      }

      const newLog = {
        id: `act-${Date.now()}-${activityId}`,
        activityId,
        date: todayKey,
        timestamp: now.toISOString(),
        hour: now.getHours(),
      };

      return {
        ...prev,
        healthyActivityLogs: [newLog, ...logs].slice(0, 500),
      };
    });

    showToast(
      alreadyLoggedToday
        ? `Removed ${meta.label} from today's log.`
        : `Logged ${meta.label} · Nurturing your clean streak.`
    );
  };

  const applyArcDayProgress = (
    prev: AppState,
    arcIdsToAdvance: SeasonalArcId[],
    todayKey: string
  ): {
    arcProgress: Partial<Record<SeasonalArcId, ArcProgressRecord>>;
    completedArcIds: SeasonalArcId[];
    bonusXP: number;
    statDeltas: Partial<Record<RpgStatKey, number>>;
    newlyCompletedNames: string[];
  } => {
    const nextProgress: Partial<Record<SeasonalArcId, ArcProgressRecord>> = {
      ...(prev.arcProgress ?? {}),
    };
    const completedSet = new Set<SeasonalArcId>(prev.completedArcIds ?? []);
    let bonusXP = 0;
    const statDeltas: Partial<Record<RpgStatKey, number>> = {};
    const newlyCompletedNames: string[] = [];

    const mergeStatBonus = (bonus: Partial<Record<RpgStatKey, number>>) => {
      for (const k of Object.keys(bonus) as RpgStatKey[]) {
        statDeltas[k] = (statDeltas[k] ?? 0) + (bonus[k] ?? 0);
      }
    };

    for (const arcId of arcIdsToAdvance) {
      if (arcId === 'complete-year-circle') continue;
      const def = getSeasonalArcById(arcId);
      const existing = nextProgress[arcId];
      if (!existing || existing.lastLoggedDate === todayKey) continue;
      if (existing.completedDays >= def.durationDays) continue;

      const nextDays = Math.min(def.durationDays, existing.completedDays + 1);
      const finishedNow = nextDays >= def.durationDays;

      nextProgress[arcId] = {
        ...existing,
        active: finishedNow ? false : existing.active,
        completedDays: nextDays,
        lastLoggedDate: todayKey,
        completedAt: finishedNow ? todayKey : existing.completedAt,
        rewardClaimed: finishedNow ? true : existing.rewardClaimed,
      };

      if (finishedNow) {
        completedSet.add(arcId);
        if (!existing.rewardClaimed) {
          bonusXP += def.bonusXP;
          mergeStatBonus(def.statBonus);
        }
        newlyCompletedNames.push(`${def.name} (+${def.bonusXP} XP)`);
      }
    }

    // Check Complete Year Circle meta-arc unlock (all 4 seasons mastered)
    const allFourSeasonsDone = FOUR_SEASON_IDS.every((id) =>
      completedSet.has(id)
    );
    if (allFourSeasonsDone && !completedSet.has('complete-year-circle')) {
      const masterDef = getSeasonalArcById('complete-year-circle');
      completedSet.add('complete-year-circle');
      nextProgress['complete-year-circle'] = {
        arcId: 'complete-year-circle',
        active: false,
        startedDate: todayKey,
        completedDays: 4,
        lastLoggedDate: todayKey,
        completedAt: todayKey,
        rewardClaimed: true,
      };
      bonusXP += masterDef.bonusXP;
      mergeStatBonus(masterDef.statBonus);
      newlyCompletedNames.push(
        `${masterDef.name} (+${masterDef.bonusXP.toLocaleString()} XP)`
      );
    }

    return {
      arcProgress: nextProgress,
      completedArcIds: Array.from(completedSet),
      bonusXP,
      statDeltas,
      newlyCompletedNames,
    };
  };

  const handleToggleArcActive = (arcId: SeasonalArcId) => {
    const def = getSeasonalArcById(arcId);
    const todayKey = getLocalDateKey();
    const currentlyActive = Boolean(state.arcProgress?.[arcId]?.active);

    setState((prev) => {
      const existing = prev.arcProgress?.[arcId];
      const nextRecord: ArcProgressRecord = existing
        ? { ...existing, active: !existing.active }
        : {
            arcId,
            active: true,
            startedDate: todayKey,
            completedDays: 0,
            lastLoggedDate: null,
            completedAt: null,
            rewardClaimed: false,
          };

      return {
        ...prev,
        arcProgress: {
          ...(prev.arcProgress ?? {}),
          [arcId]: nextRecord,
        },
      };
    });

    showToast(
      currentlyActive
        ? `${def.name} paused. Your progress is saved.`
        : `${def.name} activated! Target: ${def.durationDays} days (+${def.bonusXP} XP).`
    );
  };

  const handleLogArcDay = (arcId: SeasonalArcId) => {
    const def = getSeasonalArcById(arcId);
    const todayKey = getLocalDateKey();
    const existing = state.arcProgress?.[arcId];
    if (!existing || !existing.active || existing.lastLoggedDate === todayKey) {
      return;
    }

    const willFinish = existing.completedDays + 1 >= def.durationDays;
    if (willFinish) {
      playUrgeCompleteChime(state.soundEnabled);
    } else {
      playHabitCheckChime(state.soundEnabled);
    }

    setState((prev) => {
      const result = applyArcDayProgress(prev, [arcId], todayKey);
      const prevTodayXP =
        prev.dailyXPByDate?.[todayKey] ??
        prev.todayCheckedIds.length * HABIT_XP;

      return {
        ...prev,
        arcProgress: result.arcProgress,
        completedArcIds: result.completedArcIds,
        totalXP: prev.totalXP + result.bonusXP,
        dailyXPByDate:
          result.bonusXP > 0
            ? {
                ...prev.dailyXPByDate,
                [todayKey]: prevTodayXP + result.bonusXP,
              }
            : prev.dailyXPByDate,
        statXP: applyStatDelta(prev.statXP, result.statDeltas),
      };
    });

    if (willFinish) {
      showToast(
        `${def.name} Mastered! +${def.bonusXP.toLocaleString()} Bonus XP awarded.`
      );
    } else {
      showToast(
        `${def.name}: Day ${existing.completedDays + 1}/${def.durationDays} logged.`
      );
    }
  };

  const handleRestartArc = (arcId: SeasonalArcId) => {
    const def = getSeasonalArcById(arcId);
    const todayKey = getLocalDateKey();
    setState((prev) => ({
      ...prev,
      arcProgress: {
        ...(prev.arcProgress ?? {}),
        [arcId]: {
          arcId,
          active: true,
          startedDate: todayKey,
          completedDays: 0,
          lastLoggedDate: null,
          completedAt: null,
          rewardClaimed: true,
        },
      },
    }));
    showToast(`Started a fresh ${def.name} run!`);
  };

  const handleRelapseReset = (payload: RelapseResetPayload) => {
    const now = new Date();
    const todayKey = getLocalDateKey(now);
    const endedStreakSnapshot = getCurrentCleanStreakDays(state);
    const endedStageSnapshot = getPlantStageForDays(endedStreakSnapshot);

    setState((prev) => {
      const endedStreak = getCurrentCleanStreakDays(prev);
      const stage = getPlantStageForDays(endedStreak);
      const preservedBest = Math.max(
        prev.bestStreakDays ?? 1,
        prev.highestDayReached ?? 1,
        endedStreak
      );

      const relapseEntry = {
        date: todayKey,
        dayNumber: prev.currentDay,
        completedHabitIds: [...prev.todayCheckedIds],
        totalHabits: prev.habits.length,
        dayCompleted: false,
        xpEarned: 0,
        relapsed: true,
      };

      const archivedTree = {
        id: `garden-${Date.now()}`,
        stageId: stage.id,
        stageName: stage.name,
        daysGrown: endedStreak,
        archivedDate: todayKey,
        outcome: 'relapse' as const,
        trigger: payload.trigger,
      };

      const relapseLog = {
        id: `relapse-${Date.now()}`,
        date: todayKey,
        timestamp: now.toISOString(),
        hour: now.getHours(),
        timeWindow: payload.timeWindow,
        trigger: payload.trigger,
        streakEndedAt: endedStreak,
        note: payload.note,
      };

      return {
        ...prev,
        currentDay: 1,
        bestStreakDays: preservedBest,
        completedDays: [],
        frozenDays: [],
        missedDays: [],
        todayCheckedIds: [],
        dayAdvancedToday: false,
        relapseCount: prev.relapseCount + 1,
        gardenArchive: [archivedTree, ...(prev.gardenArchive ?? [])].slice(0, 36),
        relapseLogs: [relapseLog, ...(prev.relapseLogs ?? [])].slice(0, 180),
        history: [relapseEntry, ...prev.history].slice(0, 180),
      };
    });

    showToast(
      `Fresh seed planted for Day 1. Your ${endedStageSnapshot.name} (${endedStreakSnapshot}d) is saved in My Garden.`
    );
  };

  const handleTogglePinQuote = (quoteId: string) => {
    setState((prev) => {
      const pinned = prev.pinnedQuoteIds.includes(quoteId);
      return {
        ...prev,
        pinnedQuoteIds: pinned
          ? prev.pinnedQuoteIds.filter((id) => id !== quoteId)
          : [quoteId, ...prev.pinnedQuoteIds],
      };
    });
  };

  const handleUrgeBreakerComplete = useCallback(
    (payload: UrgeCompletionPayload) => {
      const now = new Date();
      const todayKey = getLocalDateKey(now);

      setState((prev) => {
        const prevTodayXP =
          prev.dailyXPByDate?.[todayKey] ??
          prev.todayCheckedIds.length * HABIT_XP;

        const bossResult = applyBossCombatDelta(prev, URGE_BREAKER_BOSS_DAMAGE);
        const gain = URGE_BREAKER_XP + bossResult.bountyXP;

        const urgeLog = {
          id: `urge-${Date.now()}`,
          date: todayKey,
          timestamp: now.toISOString(),
          hour: now.getHours(),
          timeWindow: getTimeWindowFromHour(now.getHours()),
          durationMinutes: payload.durationMinutes,
          trigger: payload.trigger,
          completed: true,
        };

        return {
          ...prev,
          totalXP: prev.totalXP + gain,
          dailyXPByDate: {
            ...prev.dailyXPByDate,
            [todayKey]: prevTodayXP + gain,
          },
          statXP: applyStatDelta(prev.statXP, {
            confidence: 25,
            discipline: 25 + (bossResult.bountyXP > 0 ? 40 : 0),
            strength: bossResult.bountyXP > 0 ? 40 : 0,
          }),
          bossDamageByWeek: bossResult.bossDamageByWeek,
          defeatedBossWeeks: bossResult.defeatedBossWeeks,
          urgeBreakersCompleted: prev.urgeBreakersCompleted + 1,
          urgeLogs: [urgeLog, ...(prev.urgeLogs ?? [])].slice(0, 200),
        };
      });
      showToast(
        `${payload.durationMinutes}-min wave cleared! +${URGE_BREAKER_XP} XP & ${URGE_BREAKER_BOSS_DAMAGE} Boss DMG.`
      );
    },
    [showToast]
  );

  const handlePomodoroComplete = useCallback(
    (minutes: 25 | 50, xpAwarded: number) => {
      const bossDmg =
        minutes === 50 ? POMODORO_50_BOSS_DAMAGE : POMODORO_25_BOSS_DAMAGE;
      setState((prev) => {
        const todayKey = getLocalDateKey();
        const prevTodayXP =
          prev.dailyXPByDate?.[todayKey] ??
          prev.todayCheckedIds.length * HABIT_XP;

        const focusGain = minutes === 50 ? 60 : 35;
        const disciplineGain = minutes === 50 ? 25 : 15;
        const bossResult = applyBossCombatDelta(prev, bossDmg);
        const totalGain = xpAwarded + bossResult.bountyXP;

        return {
          ...prev,
          totalXP: prev.totalXP + totalGain,
          dailyXPByDate: {
            ...prev.dailyXPByDate,
            [todayKey]: prevTodayXP + totalGain,
          },
          statXP: applyStatDelta(prev.statXP, {
            focus: focusGain,
            discipline: disciplineGain + (bossResult.bountyXP > 0 ? 40 : 0),
            strength: bossResult.bountyXP > 0 ? 40 : 0,
          }),
          bossDamageByWeek: bossResult.bossDamageByWeek,
          defeatedBossWeeks: bossResult.defeatedBossWeeks,
          pomodorosCompleted: prev.pomodorosCompleted + 1,
        };
      });
      showToast(
        `${minutes}-min Focus Block complete! +${xpAwarded} XP & ${bossDmg} Boss DMG.`
      );
    },
    [showToast]
  );

  const handleSendMentorMessage = (
    text: string,
    explicitTriggerId?: string
  ) => {
    setState((prev) => {
      const usedTexts = new Set(
        prev.mentorMessages
          .filter((m) => m.sender === 'mentor')
          .map((m) => m.text)
      );
      const reply = getOfflineMentorReply(text, usedTexts, explicitTriggerId);
      const now = new Date().toISOString();

      const nextMessages: AppState['mentorMessages'] = [
        ...prev.mentorMessages,
        {
          id: `msg-u-${Date.now()}`,
          sender: 'user',
          text,
          timestamp: now,
        },
        {
          id: `msg-m-${Date.now() + 1}`,
          sender: 'mentor',
          text: reply.text,
          triggerLabel: reply.triggerLabel,
          timestamp: now,
        },
      ];

      return {
        ...prev,
        mentorMessages: nextMessages.slice(-80),
      };
    });
  };

  const handleClearMentorChat = () => {
    setState((prev) => ({
      ...prev,
      mentorMessages: [
        {
          id: `mentor-reset-${Date.now()}`,
          sender: 'mentor',
          text: 'Slate cleared. Pick a trigger or state your obstacle—let us solve it in one move.',
          triggerLabel: 'Ready',
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  };

  const handleAddJournalEntry = (winToday: string, leakTomorrow: string) => {
    const newEntry = {
      id: `jrnl-${Date.now()}`,
      date: getLocalDateKey(),
      dayNumber: state.currentDay,
      winToday,
      leakTomorrow,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      journalEntries: [newEntry, ...prev.journalEntries],
      statXP: applyStatDelta(prev.statXP, { wisdom: 25 }),
    }));
    showToast('Night accountability reflection saved.');
  };

  const handleDeleteJournalEntry = (id: string) => {
    setState((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.filter((entry) => entry.id !== id),
    }));
  };

  const handleAddFavoriteTrack = (query: string, tag: TrackTag) => {
    const cleaned = query.trim();
    if (!cleaned) return;
    const newTrack = {
      id: `trk-${Date.now()}`,
      query: cleaned,
      tag,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      favoriteTracks: [newTrack, ...(prev.favoriteTracks ?? [])].slice(0, 60),
    }));
    showToast(`Saved "${cleaned}" (${tag})`);
  };

  const handleDeleteFavoriteTrack = (id: string) => {
    setState((prev) => ({
      ...prev,
      favoriteTracks: (prev.favoriteTracks ?? []).filter((t) => t.id !== id),
    }));
  };

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `life-reset-66-backup-${getLocalDateKey()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('JSON backup exported.');
  };

  const handleImportBackup = (restored: AppState) => {
    setState(applyMidnightRollover(restored));
    showToast('Backup restored successfully.');
  };

  const handleToggleSound = () => {
    setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleToggleHardMode = () => {
    setState((prev) => {
      const next = !prev.hardMode;
      showToast(
        next
          ? 'Hard Mode enabled: Unfinished days auto-reset to Day 1 at midnight.'
          : 'Hard Mode disabled.'
      );
      return { ...prev, hardMode: next };
    });
  };

  const handleDismissHardModeBanner = () => {
    setState((prev) => ({ ...prev, lastHardModeResetDate: null }));
  };

  const handleDismissFreezeBanner = () => {
    setState((prev) => ({ ...prev, lastFreezeAutoUsedDate: null }));
  };

  const handleFactoryReset = () => {
    const fresh = createInitialState();
    setState(fresh);
    setActiveTab('progress');
    showToast('All local data erased.');
  };

  // First-launch onboarding or retake flow
  if (!state.onboardingCompleted || isRetakingQuiz) {
    return (
      <OnboardingWizard
        initialAnswers={state.profile}
        isRetake={isRetakingQuiz}
        onComplete={handleCompleteOnboarding}
        onCancel={isRetakingQuiz ? () => setIsRetakingQuiz(false) : undefined}
      />
    );
  }

  const rankInfo = getRankInfo(state.totalXP);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
      {/* Compact Non-Sticky Top Bar (keeps mobile sticky cap strictly <= bottom nav) */}
      <header className="w-full border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#e11d48]/15 border border-[#e11d48]/35 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-[#e11d48]" />
            </div>
            <span className="font-display text-xl font-bold tracking-wide text-white whitespace-nowrap truncate">
              Life Reset: 66 Days
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('codex')}
              aria-current={activeTab === 'codex' ? 'page' : undefined}
              className={`min-h-[36px] px-2.5 sm:px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'codex'
                  ? 'bg-[#e11d48] border-[#e11d48] text-white'
                  : 'bg-[#111113] border-zinc-800 text-zinc-300 hover:text-white hover:border-[#f59e0b]/60'
              }`}
            >
              <Sparkles
                className={`w-3.5 h-3.5 ${
                  activeTab === 'codex' ? 'text-white' : 'text-[#f59e0b]'
                }`}
              />
              <span className="sm:hidden">Codex</span>
              <span className="hidden sm:inline">Anime Codex</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tools')}
              aria-current={activeTab === 'tools' ? 'page' : undefined}
              className={`min-h-[36px] px-2.5 sm:px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'tools'
                  ? 'bg-[#e11d48] border-[#e11d48] text-white'
                  : 'bg-[#111113] border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span className="sm:hidden">Tools</span>
              <span className="hidden sm:inline">Mini Tools</span>
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs font-mono-tabular text-zinc-400">
              <span className="text-[#f59e0b] font-semibold">
                {rankInfo.current.name}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-zinc-200">
                Day {state.currentDay}/{TOTAL_RESET_DAYS}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-zinc-300">
                {state.totalXP.toLocaleString()} XP
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-24">
        {activeTab === 'progress' && (
          <ProgressDashboard
            state={state}
            onToggleHabit={handleToggleHabit}
            onToggleHealthyActivity={handleToggleHealthyActivity}
            onAdvanceDay={handleAdvanceDay}
            onUseStreakFreeze={handleUseStreakFreeze}
            onRelapseReset={handleRelapseReset}
            onLaunchUrgeBreaker={() => handleOpenUrgeBreaker(5)}
            onDismissHardModeBanner={handleDismissHardModeBanner}
            onDismissFreezeBanner={handleDismissFreezeBanner}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'habits' && (
          <HabitsAndHeatmap
            state={state}
            onToggleHabit={handleToggleHabit}
            onAddHabit={handleAddHabit}
            onUpdateHabit={handleUpdateHabit}
            onDeleteHabit={handleDeleteHabit}
            onToggleArcActive={handleToggleArcActive}
            onLogArcDay={handleLogArcDay}
            onRestartArc={handleRestartArc}
            onOpenCodex={() => setActiveTab('codex')}
          />
        )}

        {activeTab === 'review' && (
          <ErrorBoundary
            title="Performance Review ran into a display error"
            fallbackMessage="Your habits, XP, and 66-day history are safely stored on this device. Tap Try Again to reload the Review report or return to your Progress dashboard."
            onNavigateHome={() => setActiveTab('progress')}
          >
            <PerformanceReview
              state={state}
              onNavigate={setActiveTab}
              onNotify={showToast}
            />
          </ErrorBoundary>
        )}

        {activeTab === 'codex' && <AnimeCodex state={state} />}

        {activeTab === 'quotes' && (
          <QuoteVault
            pinnedQuoteIds={state.pinnedQuoteIds}
            highestDayReached={state.highestDayReached}
            initialSubView={quotesSubView}
            onTogglePin={handleTogglePinQuote}
            onOpenDailyMantra={handleOpenDailyMantra}
          />
        )}

        {activeTab === 'mentor' && (
          <UrgeAndMentor
            urgeBreakersCompleted={state.urgeBreakersCompleted}
            hardestTrigger={state.profile.hardestTrigger}
            messages={state.mentorMessages}
            onLaunchUrgeBreaker={handleOpenUrgeBreaker}
            onCompleteInlineUrge={handleUrgeBreakerComplete}
            onSendMessage={handleSendMentorMessage}
            onClearChat={handleClearMentorChat}
          />
        )}

        {activeTab === 'tools' && (
          <MiniTools
            pomodorosCompleted={state.pomodorosCompleted}
            soundEnabled={state.soundEnabled}
            onToggleSound={handleToggleSound}
            onPomodoroComplete={handlePomodoroComplete}
          />
        )}

        {activeTab === 'journal' && (
          <JournalAndVault
            state={state}
            onAddJournalEntry={handleAddJournalEntry}
            onDeleteJournalEntry={handleDeleteJournalEntry}
            onAddFavoriteTrack={handleAddFavoriteTrack}
            onDeleteFavoriteTrack={handleDeleteFavoriteTrack}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModule
            state={state}
            onRetakeQuiz={() => setIsRetakingQuiz(true)}
            onToggleHardMode={handleToggleHardMode}
            onToggleSound={handleToggleSound}
            onExportBackup={handleExportBackup}
            onFactoryReset={handleFactoryReset}
          />
        )}
      </main>

      {/* Transient Feedback Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs sm:text-sm font-medium text-white shadow-xl whitespace-nowrap max-w-[92vw] truncate"
        >
          {toast}
        </div>
      )}

      {/* Fixed 6-Module Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Global Gentle Craving Urge Timer & Breath Guide Overlay */}
      <UrgeBreakerModal
        isOpen={urgeModalOpen}
        initialDurationMinutes={urgeModalDuration}
        initialTrigger={urgeModalTrigger}
        soundEnabled={state.soundEnabled}
        onToggleSound={handleToggleSound}
        onComplete={handleUrgeBreakerComplete}
        onClose={() => setUrgeModalOpen(false)}
      />

      {/* Daily Session Mantra Card Popup */}
      <DailyMantraModal
        isOpen={mantraModalOpen}
        card={activeMantraCard}
        currentDay={state.currentDay}
        unlockedCount={unlockedMantraCards.length}
        onAccept={handleCloseMantraModal}
        onDrawAnother={handleDrawAnotherMantra}
        onOpenDeck={handleOpenCardDeckFromModal}
      />
    </div>
  );
}
