import { Habit, OnboardingAnswers } from '../types';

export interface QuizQuestion {
  id: keyof OnboardingAnswers;
  stepNumber: number;
  title: string;
  subtitle: string;
  type: 'choice' | 'text';
  options?: { value: string; label: string; detail: string }[];
  placeholder?: string;
}

export const ONBOARDING_QUESTIONS: QuizQuestion[] = [
  {
    id: 'primaryGoal',
    stepNumber: 1,
    title: 'What is your #1 Goal for the next 66 days?',
    subtitle: 'Your entire daily protocol locks onto this primary target.',
    type: 'choice',
    options: [
      {
        value: 'Academic & Career Mastery',
        label: 'Academic & Career Mastery',
        detail: 'Deep study blocks, skill execution, and zero wasted evenings',
      },
      {
        value: 'Body Transformation',
        label: 'Body Transformation',
        detail: 'Consistent training, clean nutrition, and lean strength',
      },
      {
        value: 'Build a Business or Project',
        label: 'Build a Business or Project',
        detail: 'Daily shipping output and high-leverage creation',
      },
      {
        value: 'Break Digital Addiction & Reclaim Focus',
        label: 'Break Digital Addiction',
        detail: 'Eliminate mindless scrolling and restore deep attention',
      },
      {
        value: 'Complete Mental & Physical Overhaul',
        label: 'Full Life Overhaul',
        detail: 'Balanced warfare across body, focus, sleep, and mind',
      },
    ],
  },
  {
    id: 'worstDistraction',
    stepNumber: 2,
    title: 'What is your worst daily distraction?',
    subtitle: 'We will engineer a daily non-negotiable specifically to kill this leak.',
    type: 'choice',
    options: [
      {
        value: 'Short-form scrolling & social media',
        label: 'Short-Form Scrolling & Social Media',
        detail: 'Reels, Shorts, TikTok, or endless feed checking',
      },
      {
        value: 'Late-night phone & streaming in bed',
        label: 'Late-Night Phone & Streaming',
        detail: 'Staying up past bedtime on screens',
      },
      {
        value: 'Video games & passive entertainment',
        label: 'Gaming & Passive Entertainment',
        detail: 'Hours disappearing into matches or shows',
      },
      {
        value: 'Notifications & fragmented multitasking',
        label: 'Notifications & Multitasking',
        detail: 'Constant context switching during work or study',
      },
      {
        value: 'Junk food & impulse snacking',
        label: 'Impulse Snacking & Sugar',
        detail: 'Breaking dietary standards under stress or boredom',
      },
    ],
  },
  {
    id: 'wakeTime',
    stepNumber: 3,
    title: 'Lock in your daily wake-up target.',
    subtitle: 'Win the very first battle of the morning without hitting snooze.',
    type: 'choice',
    options: [
      { value: '05:00 AM', label: '05:00 AM', detail: 'Early silence before the world wakes' },
      { value: '05:30 AM', label: '05:30 AM', detail: 'Disciplined pre-dawn routine' },
      { value: '06:00 AM', label: '06:00 AM', detail: 'High-performance standard start' },
      { value: '06:30 AM', label: '06:30 AM', detail: 'Consistent structured morning' },
      { value: '07:00 AM', label: '07:00 AM', detail: 'Steady recovery-aligned wake time' },
    ],
  },
  {
    id: 'sleepTime',
    stepNumber: 4,
    title: 'Lock in your lights-out sleep schedule.',
    subtitle: 'Recovery fuels willpower. Protect 7–8 hours every night.',
    type: 'choice',
    options: [
      { value: '09:30 PM', label: '09:30 PM', detail: 'Pairs with 05:00–05:30 AM wake-up' },
      { value: '10:00 PM', label: '10:00 PM', detail: 'Sharp evening shutdown' },
      { value: '10:30 PM', label: '10:30 PM', detail: 'Balanced evening wind-down' },
      { value: '11:00 PM', label: '11:00 PM', detail: 'Late study/work cutoff' },
      { value: '11:30 PM', label: '11:30 PM', detail: 'Hard midnight boundary' },
    ],
  },
  {
    id: 'deepWorkHours',
    stepNumber: 5,
    title: 'How many daily Deep-Study / Work hours will you commit to?',
    subtitle: 'Phone-free, single-tasked focus blocks toward your #1 Goal.',
    type: 'choice',
    options: [
      { value: '2 Hours', label: '2 Hours Daily', detail: 'Two laser-sharp 60-minute blocks' },
      { value: '3 Hours', label: '3 Hours Daily', detail: 'High-output sustainable pace' },
      { value: '4 Hours', label: '4 Hours Daily', detail: 'Elite deep-work threshold' },
      { value: '5+ Hours', label: '5+ Hours Daily', detail: 'All-in monk mode execution' },
    ],
  },
  {
    id: 'fitnessTarget',
    stepNumber: 6,
    title: 'Choose your daily fitness target.',
    subtitle: 'Physical discipline forges mental resilience.',
    type: 'choice',
    options: [
      {
        value: '45-min Strength Training',
        label: '45-Min Strength Training',
        detail: 'Weights, progressive overload, or structured gym work',
      },
      {
        value: '30-min Run or Conditioning',
        label: '30-Min Run / Conditioning',
        detail: 'Cardio endurance and lung capacity',
      },
      {
        value: 'Calisthenics & 10,000 Steps',
        label: 'Calisthenics & 10k Steps',
        detail: 'Bodyweight training anywhere plus daily walking',
      },
      {
        value: '60-min Hybrid Training',
        label: '60-Min Hybrid Training',
        detail: 'Strength plus conditioning intensity',
      },
    ],
  },
  {
    id: 'nutritionTarget',
    stepNumber: 7,
    title: 'Set your daily nutrition standard.',
    subtitle: 'Fuel your focus cleanly—eliminate energy crashes.',
    type: 'choice',
    options: [
      {
        value: 'Zero Added Sugar & Processed Junk',
        label: 'Zero Sugar & Processed Junk',
        detail: 'Whole ingredients and clean hydration only',
      },
      {
        value: 'High-Protein Whole Foods & 3L Water',
        label: 'High-Protein & 3L Water',
        detail: 'Hit protein target every meal plus hydration',
      },
      {
        value: 'Strict Calorie & Macro Tracking',
        label: 'Track Calories & Macros',
        detail: 'Log every meal with zero untracked bites',
      },
      {
        value: '16:8 Intermittent Fasting & Clean Meals',
        label: '16:8 Fasting & Clean Meals',
        detail: 'Structured eating window with clean fuel',
      },
    ],
  },
  {
    id: 'vulnerabilityWindow',
    stepNumber: 8,
    title: 'When are you most vulnerable to slipping?',
    subtitle: 'Knowing your weak window lets you defend it proactively.',
    type: 'choice',
    options: [
      {
        value: 'First 30 minutes after waking',
        label: 'First 30 Minutes After Waking',
        detail: 'Snooze temptation and morning phone scrolling',
      },
      {
        value: 'Mid-afternoon energy slump',
        label: 'Mid-Afternoon Slump (2–5 PM)',
        detail: 'Fatigue triggers distraction and procrastination',
      },
      {
        value: 'After work or classes finish',
        label: 'Early Evening Transition',
        detail: 'Collapsing on the couch after finishing obligations',
      },
      {
        value: 'Late night before sleep',
        label: 'Late Night (9 PM – Midnight)',
        detail: 'Low willpower, urges, and screen binges',
      },
    ],
  },
  {
    id: 'hardestTrigger',
    stepNumber: 9,
    title: 'Which mental trigger hits you hardest?',
    subtitle: 'Your offline Discipline Mentor will prioritize countering this pattern.',
    type: 'choice',
    options: [
      {
        value: 'Procrastination & Overthinking',
        label: 'Procrastination & Overthinking',
        detail: 'Delaying starts until pressure becomes urgent',
      },
      {
        value: 'Phone Addiction & Dopamine Loops',
        label: 'Phone & Dopamine Loops',
        detail: 'Compulsive checking and losing hours to feeds',
      },
      {
        value: 'Morning Fatigue & Snoozing',
        label: 'Morning Fatigue & Snoozing',
        detail: 'Struggling to launch the day on schedule',
      },
      {
        value: 'Low Energy & Negotiating with Excuses',
        label: 'Low Energy & Excuses',
        detail: 'Rationalizing skipped workouts or missed habits',
      },
    ],
  },
  {
    id: 'callsign',
    stepNumber: 10,
    title: 'Sign your 66-Day Reset Contract.',
    subtitle: 'Enter your name or callsign to personalize your discipline protocol.',
    type: 'text',
    placeholder: 'e.g., Alex, Jordan, or your callsign',
  },
];

export const DEFAULT_ANSWERS: OnboardingAnswers = {
  primaryGoal: 'Complete Mental & Physical Overhaul',
  worstDistraction: 'Short-form scrolling & social media',
  wakeTime: '06:00 AM',
  sleepTime: '10:30 PM',
  deepWorkHours: '3 Hours',
  fitnessTarget: '45-min Strength Training',
  nutritionTarget: 'Zero Added Sugar & Processed Junk',
  vulnerabilityWindow: 'Late night before sleep',
  hardestTrigger: 'Procrastination & Overthinking',
  callsign: 'Challenger',
};

export function generateTailoredHabits(answers: OnboardingAnswers): Habit[] {
  const now = new Date().toISOString();

  const distractionHabitMap: Record<string, { title: string; detail: string }> = {
    'Short-form scrolling & social media': {
      title: 'Zero Short-Form Scrolling',
      detail: 'No Reels, Shorts, or mindless feeds all day',
    },
    'Late-night phone & streaming in bed': {
      title: 'Phone Parked Outside Bedroom',
      detail: `Screens off 45 mins before ${answers.sleepTime}`,
    },
    'Video games & passive entertainment': {
      title: 'Zero Unplanned Gaming or Binging',
      detail: 'Creation and discipline before entertainment',
    },
    'Notifications & fragmented multitasking': {
      title: 'Do Not Disturb Focus Shield',
      detail: 'All non-essential notifications silenced during work',
    },
    'Junk food & impulse snacking': {
      title: 'Zero Impulse Snacking',
      detail: 'Stick strictly to planned clean meals only',
    },
  };

  const goalMindsetMap: Record<string, { title: string; detail: string }> = {
    'Academic & Career Mastery': {
      title: 'Daily Skill Review & Reading',
      detail: '20 pages non-fiction or active recall synthesis',
    },
    'Body Transformation': {
      title: 'Mobility & Recovery Protocol',
      detail: '15 mins stretching, posture work, and 3L water',
    },
    'Build a Business or Project': {
      title: 'Ship One Measurable Output',
      detail: 'Publish, code, write, or close one key milestone',
    },
    'Break Digital Addiction & Reclaim Focus': {
      title: '20-Min Analog Quiet Time',
      detail: 'Read physical book, walk phone-free, or meditate',
    },
    'Complete Mental & Physical Overhaul': {
      title: '10-Min Mindfulness & Reading',
      detail: '10 pages reading plus 5 mins breathwork clarity',
    },
  };

  const detoxChoice =
    distractionHabitMap[answers.worstDistraction] ??
    distractionHabitMap['Short-form scrolling & social media'];

  const mindsetChoice =
    goalMindsetMap[answers.primaryGoal] ??
    goalMindsetMap['Complete Mental & Physical Overhaul'];

  return [
    {
      id: `hab-wake-${Date.now()}-1`,
      title: `Wake Up at ${answers.wakeTime} (Zero Snooze)`,
      category: 'Sleep',
      targetDetail: `Feet on the floor on first alarm · Lights out by ${answers.sleepTime}`,
      xpValue: 30,
      createdAt: now,
    },
    {
      id: `hab-work-${Date.now()}-2`,
      title: `${answers.deepWorkHours} Deep Work / Study`,
      category: 'Focus',
      targetDetail: `Phone-free focus locked on ${answers.primaryGoal}`,
      xpValue: 30,
      createdAt: now,
    },
    {
      id: `hab-fit-${Date.now()}-3`,
      title: answers.fitnessTarget,
      category: 'Fitness',
      targetDetail: 'Non-negotiable physical training session',
      xpValue: 30,
      createdAt: now,
    },
    {
      id: `hab-nut-${Date.now()}-4`,
      title: answers.nutritionTarget,
      category: 'Nutrition',
      targetDetail: 'Clean fuel with zero dietary compromises',
      xpValue: 30,
      createdAt: now,
    },
    {
      id: `hab-detox-${Date.now()}-5`,
      title: detoxChoice.title,
      category: 'Detox',
      targetDetail: detoxChoice.detail,
      xpValue: 30,
      createdAt: now,
    },
    {
      id: `hab-mind-${Date.now()}-6`,
      title: mindsetChoice.title,
      category: 'Mindset',
      targetDetail: mindsetChoice.detail,
      xpValue: 30,
      createdAt: now,
    },
  ];
}

export interface PersonalizedAssessment {
  archetype: string;
  topStrength: {
    title: string;
    detail: string;
  };
  topBlindSpot: {
    title: string;
    detail: string;
    countermeasure: string;
  };
  projectedDay66: {
    headline: string;
    summary: string;
    deepWorkTotalHours: string;
    trainingSessions: string;
    projectedRank: string;
  };
}

function parseClockMinutes(timeLabel: string): number {
  const match = timeLabel.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + mins;
}

function estimateSleepHours(sleepTime: string, wakeTime: string): number {
  const sleepMins = parseClockMinutes(sleepTime);
  const wakeMins = parseClockMinutes(wakeTime);
  const diff = (wakeMins - sleepMins + 1440) % 1440;
  return Number((diff / 60).toFixed(1));
}

function parseDeepWorkHours(label: string): number {
  const match = label.match(/\d+/);
  return match ? parseInt(match[0], 10) : 3;
}

export function generatePersonalizedAssessment(
  answers: OnboardingAnswers
): PersonalizedAssessment {
  const deepHoursPerDay = parseDeepWorkHours(answers.deepWorkHours);
  const totalDeepHours66 = deepHoursPerDay * 66;
  const sleepHours = estimateSleepHours(answers.sleepTime, answers.wakeTime);
  const isEarlyRiser =
    answers.wakeTime === '05:00 AM' || answers.wakeTime === '05:30 AM';

  // Archetype from primary goal + intensity
  const archetypeByGoal: Record<string, string> = {
    'Academic & Career Mastery':
      deepHoursPerDay >= 4 ? 'Deep-Focus Strategist' : 'Disciplined Scholar',
    'Body Transformation':
      isEarlyRiser ? 'Dawn Iron Athlete' : 'Physical Rebuilder',
    'Build a Business or Project':
      deepHoursPerDay >= 4 ? 'Relentless Builder' : 'Focused Operator',
    'Break Digital Addiction & Reclaim Focus': 'Attention Sovereign',
    'Complete Mental & Physical Overhaul': isEarlyRiser
      ? 'Pre-Dawn Commander'
      : 'Full-Spectrum Warrior',
  };
  const archetype =
    archetypeByGoal[answers.primaryGoal] ?? 'Full-Spectrum Warrior';

  // #1 Strength synthesis
  let topStrength: PersonalizedAssessment['topStrength'];
  if (deepHoursPerDay >= 4) {
    topStrength = {
      title: `Elite Deep-Work Commitment (${answers.deepWorkHours}/day)`,
      detail: `Locking in ${answers.deepWorkHours} of distraction-free execution daily puts you in the top tier of consistent output—compounding into ${totalDeepHours66}+ focused hours before Day 66.`,
    };
  } else if (isEarlyRiser) {
    topStrength = {
      title: `Pre-Dawn Launch Advantage (${answers.wakeTime})`,
      detail: `Waking at ${answers.wakeTime} with zero snooze secures your sharpest mental hours before notifications, requests, or social noise can hijack your day.`,
    };
  } else if (
    answers.fitnessTarget === '60-min Hybrid Training' ||
    answers.fitnessTarget === '45-min Strength Training'
  ) {
    topStrength = {
      title: `Physical Discipline Anchor (${answers.fitnessTarget})`,
      detail: `Anchoring every day with ${answers.fitnessTarget} builds stress resilience and neurochemical momentum that directly protects your ${answers.deepWorkHours} focus blocks.`,
    };
  } else {
    topStrength = {
      title: `Balanced, Sustainable Rhythm (${answers.wakeTime}–${answers.sleepTime})`,
      detail: `Pairing ${answers.deepWorkHours} of focused work with ${answers.fitnessTarget} and ${answers.nutritionTarget.toLowerCase()} creates a repeatable loop you can actually sustain across all 66 days.`,
    };
  }

  // #1 Blind Spot synthesis (prioritizes genuine sleep-debt risk if < 6.5h, otherwise combines worst distraction + vulnerability window)
  let topBlindSpot: PersonalizedAssessment['topBlindSpot'];
  if (sleepHours < 6.5) {
    topBlindSpot = {
      title: `Recovery Deficit (${sleepHours}h Sleep Window)`,
      detail: `Sleeping at ${answers.sleepTime} and waking at ${answers.wakeTime} leaves only ${sleepHours} hours of rest. Sleep debt weakens impulse control around Day 10–14, amplifying ${answers.worstDistraction.toLowerCase()}.`,
      countermeasure: `Protect a strict lights-out wind-down 30 minutes before ${answers.sleepTime} and use the 5-Minute Urge Breaker whenever ${answers.hardestTrigger.toLowerCase()} surfaces.`,
    };
  } else {
    topBlindSpot = {
      title: `${answers.vulnerabilityWindow} · ${answers.worstDistraction}`,
      detail: `Your highest streak-breaking risk occurs during "${answers.vulnerabilityWindow.toLowerCase()}" when willpower dips and ${answers.hardestTrigger.toLowerCase()} opens the door to ${answers.worstDistraction.toLowerCase()}.`,
      countermeasure: `Pre-commit your environment before that window starts and fire the 5-Minute Urge Breaker the instant you feel the first pull.`,
    };
  }

  // Projected Day 66 Transformation
  const goalProjectionMap: Record<string, { headline: string; outcome: string }> = {
    'Academic & Career Mastery': {
      headline: `${totalDeepHours66}+ Hours of Mastery Compounded`,
      outcome: `By Day 66, ${totalDeepHours66}+ phone-free study/work hours combined with ${answers.nutritionTarget.toLowerCase()} will separate your skill level from peers who rely on sporadic cramming.`,
    },
    'Body Transformation': {
      headline: '66 Straight Sessions of Physical Recomposition',
      outcome: `By Day 66, 66 consecutive sessions of ${answers.fitnessTarget.toLowerCase()} backed by ${answers.nutritionTarget.toLowerCase()} will visibly reshape your physique, energy baseline, and posture.`,
    },
    'Build a Business or Project': {
      headline: `${totalDeepHours66}+ Hours of Shipped Output`,
      outcome: `By Day 66, ${totalDeepHours66}+ hours of uninterrupted execution will turn an abstract ambition into a tangible, battle-tested asset built through daily shipping.`,
    },
    'Break Digital Addiction & Reclaim Focus': {
      headline: 'Rewired Dopamine Baseline & Calm Attention',
      outcome: `By Day 66, eliminating ${answers.worstDistraction.toLowerCase()} and banking ${totalDeepHours66}+ deep-work hours restores sustained concentration and ends compulsive checking.`,
    },
    'Complete Mental & Physical Overhaul': {
      headline: 'Unrecognizable Standard Across Mind & Body',
      outcome: `By Day 66, 66 ${answers.wakeTime} wake-ups, 66 training sessions, and ${totalDeepHours66}+ focused hours will convert discipline from daily effort into automatic identity.`,
    },
  };

  const goalProj =
    goalProjectionMap[answers.primaryGoal] ??
    goalProjectionMap['Complete Mental & Physical Overhaul'];

  return {
    archetype,
    topStrength,
    topBlindSpot,
    projectedDay66: {
      headline: goalProj.headline,
      summary: goalProj.outcome,
      deepWorkTotalHours: `${totalDeepHours66}${answers.deepWorkHours.includes('+') ? '+' : ''} hrs`,
      trainingSessions: '66 sessions',
      projectedRank: 'Unstoppable',
    },
  };
}

