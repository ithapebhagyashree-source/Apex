import {
  DangerTimeWindow,
  HealthyActivityId,
  PlantStageId,
  RelapseTrigger,
} from '../types';

export interface PlantStageMeta {
  id: PlantStageId;
  name: string;
  minDay: number;
  maxDay: number;
  dayRangeLabel: string;
  caption: string;
  accentHex: string;
}

export const PLANT_STAGES: PlantStageMeta[] = [
  {
    id: 'seed',
    name: 'Seed',
    minDay: 1,
    maxDay: 3,
    dayRangeLabel: 'Days 1–3',
    caption: 'Quietly taking root beneath the surface. Every steady hour counts.',
    accentHex: '#d97706',
  },
  {
    id: 'sprout',
    name: 'Sprout',
    minDay: 4,
    maxDay: 10,
    dayRangeLabel: 'Days 4–10',
    caption: 'Breaking through the soil. Early momentum is turning into real growth.',
    accentHex: '#34d399',
  },
  {
    id: 'sapling',
    name: 'Sapling',
    minDay: 11,
    maxDay: 21,
    dayRangeLabel: 'Days 11–21',
    caption: 'Growing tall with deeper roots. Your routines are holding shape.',
    accentHex: '#10b981',
  },
  {
    id: 'young_tree',
    name: 'Young Tree',
    minDay: 22,
    maxDay: 45,
    dayRangeLabel: 'Days 22–45',
    caption: 'Strong trunk and widening canopy. Cravings pass through like wind.',
    accentHex: '#059669',
  },
  {
    id: 'flourishing_tree',
    name: 'Flourishing Tree',
    minDay: 46,
    maxDay: 66,
    dayRangeLabel: 'Days 46–66',
    caption: 'Full golden bloom. Calm self-command has become your living habitat.',
    accentHex: '#f59e0b',
  },
];

export function getPlantStageForDays(streakDays: number): PlantStageMeta {
  const days = Math.max(1, streakDays);
  for (let i = PLANT_STAGES.length - 1; i >= 0; i--) {
    if (days >= PLANT_STAGES[i].minDay) {
      return PLANT_STAGES[i];
    }
  }
  return PLANT_STAGES[0];
}

export function getNextPlantStageInfo(streakDays: number): {
  current: PlantStageMeta;
  next: PlantStageMeta | null;
  daysToNext: number;
  stageProgressPct: number;
  stageIndex: number;
} {
  const days = Math.max(1, streakDays);
  const current = getPlantStageForDays(days);
  const stageIndex = PLANT_STAGES.findIndex((s) => s.id === current.id);
  const next =
    stageIndex < PLANT_STAGES.length - 1 ? PLANT_STAGES[stageIndex + 1] : null;

  if (!next) {
    const span = Math.max(1, current.maxDay - current.minDay);
    const pct = Math.min(
      100,
      Math.max(15, Math.round(((days - current.minDay) / span) * 100))
    );
    return {
      current,
      next: null,
      daysToNext: 0,
      stageProgressPct: pct,
      stageIndex,
    };
  }

  const span = Math.max(1, next.minDay - current.minDay);
  const gained = Math.max(0, days - current.minDay);
  const stageProgressPct = Math.min(
    100,
    Math.max(8, Math.round((gained / span) * 100))
  );

  return {
    current,
    next,
    daysToNext: Math.max(1, next.minDay - days),
    stageProgressPct,
    stageIndex,
  };
}

export interface HealthyActivityMeta {
  id: HealthyActivityId;
  label: string;
  shortNote: string;
}

export const HEALTHY_ACTIVITIES: HealthyActivityMeta[] = [
  {
    id: 'exercise',
    label: 'Exercise',
    shortNote: 'Move energy through your body',
  },
  {
    id: 'meditation',
    label: 'Meditation',
    shortNote: 'Steady breath and quiet mind',
  },
  {
    id: 'study_coding',
    label: 'Study/Coding',
    shortNote: 'Channel focus into skill building',
  },
  {
    id: 'reading',
    label: 'Reading',
    shortNote: 'Slow down with a real book',
  },
  {
    id: 'friends',
    label: 'Time with Friends',
    shortNote: 'Real human connection',
  },
  {
    id: 'cold_water',
    label: 'Cold Water',
    shortNote: 'Instant nervous-system reset',
  },
];

export function getHealthyActivityMeta(
  id: HealthyActivityId
): HealthyActivityMeta {
  return (
    HEALTHY_ACTIVITIES.find((a) => a.id === id) ?? HEALTHY_ACTIVITIES[0]
  );
}

export interface RelapseTriggerMeta {
  id: RelapseTrigger;
  label: string;
  preventionTip: string;
}

export const RELAPSE_TRIGGERS: RelapseTriggerMeta[] = [
  {
    id: 'Boredom',
    label: 'Boredom',
    preventionTip: 'Keep a 5-minute starter task or book within reach before idle time hits.',
  },
  {
    id: 'Stress',
    label: 'Stress',
    preventionTip: 'Use 3 rounds of 4-4-6 breathing or cold water before reaching for escape.',
  },
  {
    id: 'Late Night',
    label: 'Late Night',
    preventionTip: 'Park your phone outside the bedroom 30 minutes before sleep.',
  },
  {
    id: 'Phone/Scroll',
    label: 'Phone/Scroll',
    preventionTip: 'Switch rooms or stand up the moment you notice mindless scrolling.',
  },
  {
    id: 'Fatigue',
    label: 'Fatigue',
    preventionTip: 'Low energy lowers willpower—prioritize an early rest or short walk instead of screens.',
  },
];

export const DANGER_TIME_WINDOWS: {
  id: DangerTimeWindow;
  label: string;
  rangeLabel: string;
}[] = [
  { id: 'Morning', label: 'Morning', rangeLabel: '06:00–12:00' },
  { id: 'Afternoon', label: 'Afternoon', rangeLabel: '12:00–17:00' },
  { id: 'Evening', label: 'Evening', rangeLabel: '17:00–22:00' },
  { id: 'Late Night', label: 'Late Night', rangeLabel: '22:00–06:00' },
];

export function getTimeWindowFromHour(hour: number): DangerTimeWindow {
  if (hour >= 6 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 22) return 'Evening';
  return 'Late Night';
}

export function getTimeWindowRangeLabel(window: DangerTimeWindow): string {
  return (
    DANGER_TIME_WINDOWS.find((w) => w.id === window)?.rangeLabel ?? '22:00–06:00'
  );
}

export const CALM_URGE_REMINDERS: {
  headline: string;
  body: string;
}[] = [
  {
    headline: 'Ride the wave without fighting it',
    body: 'A craving peaks like an ocean wave and naturally recedes when you stay present and breathe.',
  },
  {
    headline: 'Notice the urge, do not obey it',
    body: 'Feeling an impulse is normal wiring. Letting it pass without acting is how your brain rewires.',
  },
  {
    headline: 'Soften your shoulders on the exhale',
    body: 'A 6-second exhale tells your nervous system you are safe, lowering urgency within a few cycles.',
  },
  {
    headline: 'You only need to stay steady right now',
    body: 'Do not worry about next week. Simply breathe through these few minutes—one calm breath at a time.',
  },
  {
    headline: 'Discomfort is temporary, self-trust stays',
    body: 'Five minutes from now this craving will be quieter, and you will feel lighter for having held steady.',
  },
  {
    headline: 'Step back and observe the thought',
    body: 'Name it quietly: "This is just a passing craving." Watching it creates space between urge and action.',
  },
  {
    headline: 'Your future self is cheering for this pause',
    body: 'Every pause you take waters the roots of the person you are becoming over these 66 days.',
  },
  {
    headline: 'Unclench your jaw and let go',
    body: 'Release tension from your hands and forehead as you breathe out. Calmness beats willpower.',
  },
];
