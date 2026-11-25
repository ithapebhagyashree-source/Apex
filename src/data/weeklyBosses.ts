import { WeeklyBoss } from '../types';

export const HABIT_BOSS_DAMAGE = 50;
export const ADVANCE_DAY_BOSS_DAMAGE = 100;
export const URGE_BREAKER_BOSS_DAMAGE = 75;
export const POMODORO_25_BOSS_DAMAGE = 60;
export const POMODORO_50_BOSS_DAMAGE = 110;

export const WEEKLY_BOSSES: WeeklyBoss[] = [
  {
    week: 1,
    name: 'The Snooze Phantom',
    title: 'Warden of Morning Inertia',
    maxHp: 300,
    taunt: 'Five more minutes will not cost you anything. Stay under the covers.',
    bountyXP: 150,
  },
  {
    week: 2,
    name: 'The Scroll Hydra',
    title: 'Devourer of Attention',
    maxHp: 450,
    taunt: 'Cut one distracting app and two feeds take its place. Just check once.',
    bountyXP: 175,
  },
  {
    week: 3,
    name: 'The Excuse Architect',
    title: 'Master of Tomorrow',
    maxHp: 550,
    taunt: 'Today was stressful. Push the hard work to tomorrow morning.',
    bountyXP: 200,
  },
  {
    week: 4,
    name: 'The Burnout Specter',
    title: 'Hollower of Momentum',
    maxHp: 650,
    taunt: 'You already proved your point for three weeks. Coast for a few days.',
    bountyXP: 225,
  },
  {
    week: 5,
    name: 'The Comfort Golem',
    title: 'Colossus of Complacency',
    maxHp: 750,
    taunt: 'Ordinary is safe and warm. Why keep bleeding for a standard nobody sees?',
    bountyXP: 250,
  },
  {
    week: 6,
    name: 'The Halfway Mirage',
    title: 'Illusion of Arrival',
    maxHp: 850,
    taunt: 'Past Day 33—surely one cheat evening will not erase everything.',
    bountyXP: 275,
  },
  {
    week: 7,
    name: 'The Fatigue Titan',
    title: 'Weight of Repetition',
    maxHp: 900,
    taunt: 'Every day feels the same now. Drop the checklist and chase novelty.',
    bountyXP: 300,
  },
  {
    week: 8,
    name: 'The Ego Warden',
    title: 'Trap of Overconfidence',
    maxHp: 950,
    taunt: 'You think the old habits are dead. Lower your guard and watch them return.',
    bountyXP: 325,
  },
  {
    week: 9,
    name: 'The Shadow Self',
    title: 'Echo of Your Old Identity',
    maxHp: 1000,
    taunt: 'I built your past routines for years. You cannot outrun who you used to be.',
    bountyXP: 350,
  },
  {
    week: 10,
    name: 'The Day 66 Sovereign',
    title: 'Final Crucible Boss',
    maxHp: 550,
    taunt: 'Only three days remain. Finish unbroken and claim total self-command.',
    bountyXP: 500,
  },
];

export function getBossForWeek(week: number): WeeklyBoss {
  const clamped = Math.min(WEEKLY_BOSSES.length, Math.max(1, week));
  return WEEKLY_BOSSES[clamped - 1];
}
