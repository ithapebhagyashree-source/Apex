export type ModuleTab =
  | 'progress'
  | 'habits'
  | 'review'
  | 'quotes'
  | 'mentor'
  | 'tools'
  | 'codex'
  | 'journal'
  | 'settings';

export type RpgStatKey =
  | 'discipline'
  | 'strength'
  | 'focus'
  | 'wisdom'
  | 'confidence'
  | 'vitality';

export type RpgStatsMap = Record<RpgStatKey, number>;

export type DisciplineRankName =
  | 'Novice'
  | 'Disciple'
  | 'Warrior'
  | 'Titan'
  | 'Unstoppable';

export interface RankTier {
  name: DisciplineRankName;
  minXP: number;
  maxXP: number | null;
  tagline: string;
}

export interface OnboardingAnswers {
  primaryGoal: string;
  worstDistraction: string;
  wakeTime: string;
  sleepTime: string;
  deepWorkHours: string;
  fitnessTarget: string;
  nutritionTarget: string;
  vulnerabilityWindow: string;
  hardestTrigger: string;
  callsign: string;
}

export type HabitCategory =
  | 'Focus'
  | 'Fitness'
  | 'Nutrition'
  | 'Sleep'
  | 'Mindset'
  | 'Detox';

export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  targetDetail: string;
  xpValue: number;
  createdAt: string;
}

export interface DayHistoryEntry {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  completedHabitIds: string[];
  totalHabits: number;
  dayCompleted: boolean;
  xpEarned: number;
  relapsed?: boolean;
  frozen?: boolean;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  dayNumber: number;
  winToday: string;
  leakTomorrow: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  triggerLabel?: string;
  timestamp: string;
}

export type QuoteSpeaker =
  | 'David Goggins'
  | 'Marcus Aurelius'
  | 'Jocko Willink'
  | 'Miyamoto Musashi';

export interface LegendQuote {
  id: string;
  speaker: QuoteSpeaker;
  text: string;
  context: string;
}

export type MantraCategory =
  | 'Confidence'
  | 'Strength'
  | 'Discipline'
  | 'Wisdom'
  | 'Focus';

export type MantraCardTier = 'Initiate' | 'Forged' | 'Vanguard' | 'Apex';

export interface MantraCard {
  id: string;
  cardNumber: string;
  category: MantraCategory;
  title: string;
  mantra: string;
  directive: string;
  unlockDay: number;
  tier: MantraCardTier;
}

export interface WeeklyBoss {
  week: number;
  name: string;
  title: string;
  maxHp: number;
  taunt: string;
  bountyXP: number;
}

export type PlantStageId =
  | 'seed'
  | 'sprout'
  | 'sapling'
  | 'young_tree'
  | 'flourishing_tree';

export type HealthyActivityId =
  | 'exercise'
  | 'meditation'
  | 'study_coding'
  | 'reading'
  | 'friends'
  | 'cold_water';

export type RelapseTrigger =
  | 'Boredom'
  | 'Stress'
  | 'Late Night'
  | 'Phone/Scroll'
  | 'Fatigue';

export type DangerTimeWindow =
  | 'Morning'
  | 'Afternoon'
  | 'Evening'
  | 'Late Night';

export interface GardenTreeRecord {
  id: string;
  stageId: PlantStageId;
  stageName: string;
  daysGrown: number;
  archivedDate: string; // YYYY-MM-DD
  outcome: 'completed' | 'relapse';
  trigger?: RelapseTrigger;
}

export interface HealthyActivityLog {
  id: string;
  activityId: HealthyActivityId;
  date: string; // YYYY-MM-DD
  timestamp: string;
  hour: number;
}

export interface RelapseLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  hour: number;
  timeWindow: DangerTimeWindow;
  trigger: RelapseTrigger;
  streakEndedAt: number;
  note?: string;
}

export interface UrgeLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  hour: number;
  timeWindow: DangerTimeWindow;
  durationMinutes: 3 | 5 | 10;
  trigger?: RelapseTrigger;
  completed: boolean;
}

export type SeasonalArcId =
  | 'winter-arc'
  | 'summer-arc'
  | 'monsoon-arc'
  | 'spring-arc'
  | 'complete-year-circle'
  | 'monk-mode-30'
  | '75-hard-discipline'
  | 'zero-distraction-sprint';

export interface ArcProgressRecord {
  arcId: SeasonalArcId;
  active: boolean;
  startedDate: string; // YYYY-MM-DD
  completedDays: number;
  lastLoggedDate: string | null;
  completedAt: string | null;
  rewardClaimed: boolean;
}

export type TrackTag = 'Phonk' | 'Workout' | 'Focus' | 'Chill';

export type MusicPlatform = 'youtube-music' | 'youtube';

export interface FavoriteTrack {
  id: string;
  query: string;
  tag: TrackTag;
  createdAt: string;
}

export interface AppState {
  schemaVersion: number;
  onboardingCompleted: boolean;
  profile: OnboardingAnswers;
  habits: Habit[];
  currentDay: number; // 1 to 66
  highestDayReached: number; // Tracks highest day ever reached for card unlocks
  bestStreakDays: number; // All-time best clean streak (never erased on relapse)
  completedDays: number[]; // Day numbers 1..66 completed
  frozenDays: number[]; // Day numbers 1..66 protected via Streak Freeze
  missedDays: number[]; // Day numbers missed or relapsed before reset
  todayCheckedIds: string[];
  dayAdvancedToday: boolean;
  lastActiveDate: string; // YYYY-MM-DD
  hardMode: boolean;
  lastHardModeResetDate: string | null;
  streakFreezeTokens: number;
  earnedFreezeMilestones: number[];
  lastFreezeAutoUsedDate: string | null;
  bossDamageByWeek: Record<number, number>;
  defeatedBossWeeks: number[];
  totalXP: number;
  dailyXPByDate: Record<string, number>;
  statXP: RpgStatsMap;
  pomodorosCompleted: number;
  urgeBreakersCompleted: number;
  relapseCount: number;
  soundEnabled: boolean;
  history: DayHistoryEntry[];
  pinnedQuoteIds: string[];
  journalEntries: JournalEntry[];
  mentorMessages: ChatMessage[];
  gardenArchive: GardenTreeRecord[];
  healthyActivityLogs: HealthyActivityLog[];
  relapseLogs: RelapseLogEntry[];
  urgeLogs: UrgeLogEntry[];
  arcProgress: Partial<Record<SeasonalArcId, ArcProgressRecord>>;
  completedArcIds: SeasonalArcId[];
  favoriteTracks: FavoriteTrack[];
  startedAt: string;
}
