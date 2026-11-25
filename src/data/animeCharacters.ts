import { AppState, Habit, HabitCategory } from '../types';

export type AnimeCharacterId =
  | 'fitness'
  | 'focus'
  | 'mindset'
  | 'detox'
  | 'nutrition'
  | 'sleep'
  | 'urge-slayer'
  | 'night-chronicler'
  | 'boss-slayer'
  | 'day66-sovereign';

export interface AnimeCharacterProfile {
  id: AnimeCharacterId;
  name: string;
  epithet: string;
  kind: 'Habit' | 'Achievement';
  habitCategory: HabitCategory | 'Achievement';
  accentColor: string;
  auraColor: string;
  signatureMove: string;
  bio: string;
  unlockRequirement: string;
}

export const ANIME_CODEX_CHARACTERS: AnimeCharacterProfile[] = [
  {
    id: 'fitness',
    name: 'Kuro',
    epithet: 'Iron Lifter',
    kind: 'Habit',
    habitCategory: 'Fitness',
    accentColor: '#e11d48',
    auraColor: '#f59e0b',
    signatureMove: 'Overhead Crimson Press',
    bio: 'Trains under heavy gravity before excuses can form. Every completed physical session hardens both muscle fiber and nervous system.',
    unlockRequirement: 'Have or complete a Fitness habit',
  },
  {
    id: 'focus',
    name: 'Ren',
    epithet: 'Deep Scholar',
    kind: 'Habit',
    habitCategory: 'Focus',
    accentColor: '#f59e0b',
    auraColor: '#fbbf24',
    signatureMove: 'Luminous Grimoire Lock',
    bio: 'Enters tunnel-vision mastery at the study desk with glowing texts and zero open distractions. Turns quiet hours into rare capability.',
    unlockRequirement: 'Have or complete a Focus / Study habit',
  },
  {
    id: 'mindset',
    name: 'Sora',
    epithet: 'Calm Sage',
    kind: 'Habit',
    habitCategory: 'Mindset',
    accentColor: '#38bdf8',
    auraColor: '#818cf8',
    signatureMove: 'Still Horizon Aura',
    bio: 'Suspends reactive emotion inside a rotating ring of breath and clarity. Commands impulse before it can speak.',
    unlockRequirement: 'Have or complete a Mindset / Mindfulness habit',
  },
  {
    id: 'detox',
    name: 'Vex',
    epithet: 'Signal Breaker',
    kind: 'Habit',
    habitCategory: 'Detox',
    accentColor: '#fb7185',
    auraColor: '#e11d48',
    signatureMove: 'Zero-Feed Slash',
    bio: 'Severs dopamine loops in a single strike, powering down glowing feeds and reclaiming every stolen evening.',
    unlockRequirement: 'Have or complete a Digital Detox habit',
  },
  {
    id: 'nutrition',
    name: 'Aoi',
    epithet: 'Clean Alchemist',
    kind: 'Habit',
    habitCategory: 'Nutrition',
    accentColor: '#10b981',
    auraColor: '#34d399',
    signatureMove: 'Pure Vitality Elixir',
    bio: 'Treats hydration and whole nutrition as combat fuel—eliminating sugar crashes so focus remains steady from dawn to lights out.',
    unlockRequirement: 'Have or complete a Nutrition / Hydration habit',
  },
  {
    id: 'sleep',
    name: 'Haru',
    epithet: 'Dawn Striker',
    kind: 'Habit',
    habitCategory: 'Sleep',
    accentColor: '#f59e0b',
    auraColor: '#fb923c',
    signatureMove: 'First-Light Surge',
    bio: 'Meets the sunrise energized with zero snooze, winning the opening battle of the morning before the world stirs.',
    unlockRequirement: 'Have or complete a Sleep / Wake-Up habit',
  },
  {
    id: 'urge-slayer',
    name: 'Kael',
    epithet: 'Aegis Sentinel',
    kind: 'Achievement',
    habitCategory: 'Achievement',
    accentColor: '#e11d48',
    auraColor: '#38bdf8',
    signatureMove: 'Five-Minute Bulwark',
    bio: 'Stands unmoved behind a crimson-gold shield while cravings crash and dissolve into nothing.',
    unlockRequirement: 'Complete 1+ 5-Minute Urge Breaker Lock',
  },
  {
    id: 'night-chronicler',
    name: 'Mina',
    epithet: 'Night Chronicler',
    kind: 'Achievement',
    habitCategory: 'Achievement',
    accentColor: '#38bdf8',
    auraColor: '#f59e0b',
    signatureMove: 'Accountability Ink Seal',
    bio: 'Audits every evening honestly—capturing one victory and sealing one leak before tomorrow begins.',
    unlockRequirement: 'Log 1+ Night Accountability Journal entry',
  },
  {
    id: 'boss-slayer',
    name: 'Tetsu',
    epithet: 'Vanguard Breaker',
    kind: 'Achievement',
    habitCategory: 'Achievement',
    accentColor: '#f59e0b',
    auraColor: '#e11d48',
    signatureMove: 'Milestone Cleaver',
    bio: 'Forged in sustained weekly combat, shattering milestone bosses through stacked daily discipline.',
    unlockRequirement: 'Defeat 1+ Weekly Milestone Boss',
  },
  {
    id: 'day66-sovereign',
    name: 'Ryujin',
    epithet: 'Ascended Sovereign',
    kind: 'Achievement',
    habitCategory: 'Achievement',
    accentColor: '#f59e0b',
    auraColor: '#10b981',
    signatureMove: '66-Ring Ascension',
    bio: 'The pinnacle form of self-command—unlocked when discipline stops being an effort and becomes permanent identity.',
    unlockRequirement: 'Reach Warrior Rank (1,800 XP) or Day 14+',
  },
];

export function resolveHabitCharacterId(habit: Pick<Habit, 'title' | 'category'>): AnimeCharacterId {
  const title = habit.title.toLowerCase();

  // Smart title keyword detection first so custom habits match their visual activity accurately
  if (
    /(gym|lift|weight|strength|workout|run|cardio|pushup|calisthen|step|train|fitness|exercise|squat|plank)/.test(
      title
    )
  ) {
    return 'fitness';
  }
  if (
    /(study|deep work|code|coding|program|write|read|book|learn|exam|project|ship|focus|essay|math)/.test(
      title
    )
  ) {
    return 'focus';
  }
  if (
    /(meditat|mindful|breath|calm|journal|pray|stretch|yoga|analog|quiet|gratitude)/.test(
      title
    )
  ) {
    return 'mindset';
  }
  if (
    /(phone|scroll|reel|short|tiktok|instagram|screen|social|gaming|game|detox|notification|dnd|distract)/.test(
      title
    )
  ) {
    return 'detox';
  }
  if (
    /(water|hydrat|protein|eat|meal|food|diet|sugar|calorie|macro|fasting|fast|nutrition|veggie|clean)/.test(
      title
    )
  ) {
    return 'nutrition';
  }
  if (
    /(wake|sleep|bed|snooze|alarm|morning|sunrise|dawn|lights out|rest)/.test(title)
  ) {
    return 'sleep';
  }

  // Fallback directly by category
  const byCategory: Record<HabitCategory, AnimeCharacterId> = {
    Fitness: 'fitness',
    Focus: 'focus',
    Mindset: 'mindset',
    Detox: 'detox',
    Nutrition: 'nutrition',
    Sleep: 'sleep',
  };

  return byCategory[habit.category] ?? 'focus';
}

export function getCharacterProfileById(
  id: AnimeCharacterId
): AnimeCharacterProfile {
  return (
    ANIME_CODEX_CHARACTERS.find((c) => c.id === id) ?? ANIME_CODEX_CHARACTERS[0]
  );
}

export function isCharacterUnlocked(
  character: AnimeCharacterProfile,
  state: AppState
): boolean {
  if (character.kind === 'Habit') {
    // Unlocked if the user has any active habit mapped to this character OR has earned stat XP in its category
    const hasMatchingHabit = state.habits.some(
      (h) => resolveHabitCharacterId(h) === character.id
    );
    if (hasMatchingHabit) return true;

    const categoryStatCheck: Partial<Record<AnimeCharacterId, number>> = {
      fitness: state.statXP?.strength ?? 0,
      focus: state.statXP?.focus ?? 0,
      mindset: state.statXP?.wisdom ?? 0,
      detox: state.statXP?.discipline ?? 0,
      nutrition: state.statXP?.vitality ?? 0,
      sleep: state.statXP?.vitality ?? 0,
    };
    return (categoryStatCheck[character.id] ?? 0) > 0;
  }

  switch (character.id) {
    case 'urge-slayer':
      return state.urgeBreakersCompleted >= 1;
    case 'night-chronicler':
      return state.journalEntries.length >= 1;
    case 'boss-slayer':
      return state.defeatedBossWeeks.length >= 1;
    case 'day66-sovereign':
      return state.totalXP >= 1800 || state.highestDayReached >= 14;
    default:
      return false;
  }
}
