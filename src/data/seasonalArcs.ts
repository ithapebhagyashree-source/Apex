import { RpgStatKey, SeasonalArcId } from '../types';

export interface SeasonalArcDefinition {
  id: SeasonalArcId;
  name: string;
  subtitle: string;
  category: 'seasonal' | 'challenge' | 'master';
  durationDays: number;
  bonusXP: number;
  accentHex: string;
  accentBgClass: string;
  accentBorderClass: string;
  accentTextClass: string;
  description: string;
  pillars: string[];
  statBonus: Partial<Record<RpgStatKey, number>>;
}

export const FOUR_SEASON_IDS: SeasonalArcId[] = [
  'winter-arc',
  'summer-arc',
  'monsoon-arc',
  'spring-arc',
];

export const SEASONAL_ARCS: SeasonalArcDefinition[] = [
  {
    id: 'winter-arc',
    name: 'Winter Arc',
    subtitle: 'Ruthless Discipline & Cold Focus',
    category: 'seasonal',
    durationDays: 30,
    bonusXP: 450,
    accentHex: '#38bdf8',
    accentBgClass: 'bg-sky-500/12',
    accentBorderClass: 'border-sky-400/45',
    accentTextClass: 'text-sky-300',
    description:
      'Train in silence before dawn, embrace cold discomfort, and lock in zero-excuse execution while everyone else slows down.',
    pillars: ['Early wake-up & cold focus', 'Zero skipped workouts', 'Locked evening routine'],
    statBonus: { discipline: 60, confidence: 40 },
  },
  {
    id: 'summer-arc',
    name: 'Summer Arc',
    subtitle: 'Peak Physical Conditioning & Strength',
    category: 'seasonal',
    durationDays: 30,
    bonusXP: 450,
    accentHex: '#f59e0b',
    accentBgClass: 'bg-amber-500/12',
    accentBorderClass: 'border-amber-400/45',
    accentTextClass: 'text-amber-300',
    description:
      'Build peak athletic output, progressive strength, clean hydration, and high-energy physical momentum every single day.',
    pillars: ['Daily strength or conditioning', 'Clean fuel & hydration', 'Active recovery'],
    statBonus: { strength: 60, vitality: 40 },
  },
  {
    id: 'monsoon-arc',
    name: 'Monsoon Arc',
    subtitle: 'Deep Study, Indoor Mastery & Resilience',
    category: 'seasonal',
    durationDays: 30,
    bonusXP: 450,
    accentHex: '#818cf8',
    accentBgClass: 'bg-indigo-500/12',
    accentBorderClass: 'border-indigo-400/45',
    accentTextClass: 'text-indigo-300',
    description:
      'Turn rainy indoor hours into uninterrupted deep study, skill forging, reading, and calm mental resilience against gloom.',
    pillars: ['Deep study / coding blocks', 'Daily reading & reflection', 'Calm nervous system'],
    statBonus: { focus: 60, wisdom: 40 },
  },
  {
    id: 'spring-arc',
    name: 'Spring Arc',
    subtitle: 'Fresh Habits & Energy Renewal',
    category: 'seasonal',
    durationDays: 30,
    bonusXP: 450,
    accentHex: '#10b981',
    accentBgClass: 'bg-emerald-500/12',
    accentBorderClass: 'border-emerald-400/45',
    accentTextClass: 'text-emerald-300',
    description:
      'Clear stale habits, restore sleep quality, and cultivate sustainable daily vitality that carries into every season.',
    pillars: ['Consistent sleep window', 'Daily movement & sunlight', 'Clean habit reset'],
    statBonus: { vitality: 60, wisdom: 40 },
  },
  {
    id: 'complete-year-circle',
    name: 'Complete Year Circle',
    subtitle: 'Master All 4 Seasonal Arcs',
    category: 'master',
    durationDays: 4,
    bonusXP: 1500,
    accentHex: '#fbbf24',
    accentBgClass: 'bg-amber-500/15',
    accentBorderClass: 'border-amber-400/55',
    accentTextClass: 'text-[#fbbf24]',
    description:
      'Complete Winter, Summer, Monsoon, and Spring Arcs to forge an unbroken four-season discipline mastery circle.',
    pillars: ['Winter Arc mastered', 'Summer & Monsoon mastered', 'Spring Arc mastered'],
    statBonus: { discipline: 80, strength: 60, focus: 60, wisdom: 60, confidence: 80, vitality: 60 },
  },
  {
    id: 'monk-mode-30',
    name: 'Monk Mode (30 Days)',
    subtitle: 'Solitude, Deep Work & Zero Cheap Dopamine',
    category: 'challenge',
    durationDays: 30,
    bonusXP: 600,
    accentHex: '#e11d48',
    accentBgClass: 'bg-rose-500/12',
    accentBorderClass: 'border-rose-500/45',
    accentTextClass: 'text-rose-300',
    description:
      'Eliminate passive scrolling, dedicate daily blocks to your #1 mission, meditate, and reclaim complete mental clarity.',
    pillars: ['Daily meditation / breathwork', 'Zero mindless feeds', 'Focused output block'],
    statBonus: { focus: 60, discipline: 60 },
  },
  {
    id: '75-hard-discipline',
    name: '75 Hard Discipline',
    subtitle: 'Uncompromising 75-Day Mental Toughness',
    category: 'challenge',
    durationDays: 75,
    bonusXP: 1200,
    accentHex: '#f97316',
    accentBgClass: 'bg-orange-500/12',
    accentBorderClass: 'border-orange-400/45',
    accentTextClass: 'text-orange-300',
    description:
      '75 days of relentless daily execution—training, clean nutrition, hydration, reading, and zero negotiation with comfort.',
    pillars: ['Daily training & clean fuel', '10+ pages non-fiction', 'Full daily checklist'],
    statBonus: { discipline: 90, strength: 80, confidence: 70 },
  },
  {
    id: 'zero-distraction-sprint',
    name: 'Zero-Distraction Sprint',
    subtitle: '14-Day Digital Detox & Laser Focus',
    category: 'challenge',
    durationDays: 14,
    bonusXP: 300,
    accentHex: '#22d3ee',
    accentBgClass: 'bg-cyan-500/12',
    accentBorderClass: 'border-cyan-400/45',
    accentTextClass: 'text-cyan-300',
    description:
      'A high-intensity 14-day sprint cutting short-form video, muting non-essential alerts, and protecting deep work windows.',
    pillars: ['No short-form feeds', 'Phone parked during work', 'Screen-free pre-sleep'],
    statBonus: { focus: 45, discipline: 45 },
  },
];

export function getSeasonalArcById(id: SeasonalArcId): SeasonalArcDefinition {
  return SEASONAL_ARCS.find((a) => a.id === id) ?? SEASONAL_ARCS[0];
}
