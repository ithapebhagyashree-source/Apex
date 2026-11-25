import { MantraCard, MantraCategory } from '../types';

export const MANTRA_CATEGORIES: MantraCategory[] = [
  'Confidence',
  'Strength',
  'Discipline',
  'Wisdom',
  'Focus',
];

export const MANTRA_CARD_DECK: MantraCard[] = [
  // Tier 1: Initiate (Day 1 — 1 starter card per category)
  {
    id: 'mc-01',
    cardNumber: '01',
    category: 'Discipline',
    title: 'Zero Negotiation',
    mantra:
      'I do not debate with my calendar or bargain with comfort. When the clock strikes, I execute.',
    directive: 'Complete your first unchecked habit before opening any entertainment app.',
    unlockDay: 1,
    tier: 'Initiate',
  },
  {
    id: 'mc-02',
    cardNumber: '02',
    category: 'Focus',
    title: 'Single Target',
    mantra:
      'Fragmented attention produces average results. One objective, one timer, zero background noise.',
    directive: 'Close every unnecessary tab and silence notifications for your next focus block.',
    unlockDay: 1,
    tier: 'Initiate',
  },
  {
    id: 'mc-03',
    cardNumber: '03',
    category: 'Strength',
    title: 'First Friction',
    mantra:
      'My body learns obedience through effort. Discomfort is not a stop sign—it is the forge.',
    directive: 'Show up to today’s physical session even if energy starts at 50%.',
    unlockDay: 1,
    tier: 'Initiate',
  },
  {
    id: 'mc-04',
    cardNumber: '04',
    category: 'Confidence',
    title: 'Proof Over Mood',
    mantra:
      'Confidence is not a feeling I wait for; it is a receipt earned from promises kept in private.',
    directive: 'Stack one undeniable kept promise in the next 60 minutes.',
    unlockDay: 1,
    tier: 'Initiate',
  },
  {
    id: 'mc-05',
    cardNumber: '05',
    category: 'Wisdom',
    title: 'Control the Controllable',
    mantra:
      'Outside friction cannot disturb my standard. I own my breath, my choices, and my next action.',
    directive: 'Pause for three slow breaths before reacting to any frustration today.',
    unlockDay: 1,
    tier: 'Initiate',
  },

  // Tier 2: Forged (Days 4 – 18)
  {
    id: 'mc-06',
    cardNumber: '06',
    category: 'Discipline',
    title: 'Win the First Hour',
    mantra:
      'How I command the first sixty minutes decides who controls the rest of the day.',
    directive: 'Hit your wake-up target with zero snooze and hydrate immediately.',
    unlockDay: 4,
    tier: 'Forged',
  },
  {
    id: 'mc-07',
    cardNumber: '07',
    category: 'Focus',
    title: 'Starve the Shallows',
    mantra:
      'Every cheap swipe steals voltage from my real mission. I guard my attention like capital.',
    directive: 'Keep your phone physically out of arm’s reach during deep work.',
    unlockDay: 7,
    tier: 'Forged',
  },
  {
    id: 'mc-08',
    cardNumber: '08',
    category: 'Strength',
    title: 'Past the 40% Wall',
    mantra:
      'When my mind whispers that I have done enough, I am barely crossing the threshold of real growth.',
    directive: 'Add one clean extra set, five more minutes, or higher form precision today.',
    unlockDay: 10,
    tier: 'Forged',
  },
  {
    id: 'mc-09',
    cardNumber: '09',
    category: 'Wisdom',
    title: 'Audit the Leak',
    mantra:
      'A mistake hidden repeats itself; a leak documented in ink gets sealed permanently.',
    directive: 'Log one honest weakness and tomorrow’s structural fix in tonight’s journal.',
    unlockDay: 14,
    tier: 'Forged',
  },
  {
    id: 'mc-10',
    cardNumber: '10',
    category: 'Confidence',
    title: 'Quiet Certainty',
    mantra:
      'I do not need applause to keep moving. My silent consistency speaks louder than declarations.',
    directive: 'Execute your entire checklist today without announcing it to anyone.',
    unlockDay: 18,
    tier: 'Forged',
  },

  // Tier 3: Vanguard (Days 21 – 45)
  {
    id: 'mc-11',
    cardNumber: '11',
    category: 'Discipline',
    title: 'Never Miss Twice',
    mantra:
      'Imperfection never breaks a warrior—abandoning the standard does. I hold the line every 24 hours.',
    directive: 'Protect your weakest daily habit first before evening fatigue arrives.',
    unlockDay: 21,
    tier: 'Vanguard',
  },
  {
    id: 'mc-12',
    cardNumber: '12',
    category: 'Focus',
    title: 'Monk Mode Depth',
    mantra:
      'I embrace stillness and boredom because deep mastery only grows where distraction cannot survive.',
    directive: 'Complete a full 50-minute uninterrupted focus block in Mini Tools.',
    unlockDay: 28,
    tier: 'Vanguard',
  },
  {
    id: 'mc-13',
    cardNumber: '13',
    category: 'Strength',
    title: 'Iron Recovery',
    mantra:
      'True strength trains hard and recovers with equal ruthlessness. Clean fuel and sleep are weapons.',
    directive: 'Honor your exact nutrition standard and lights-out time without compromise.',
    unlockDay: 33,
    tier: 'Vanguard',
  },
  {
    id: 'mc-14',
    cardNumber: '14',
    category: 'Confidence',
    title: 'Command the Urge',
    mantra:
      'Impulses pass like weather; my identity stays bolted to bedrock. I outlast every craving.',
    directive: 'If an urge surfaces today, fire the 5-Minute Urge Breaker immediately.',
    unlockDay: 40,
    tier: 'Vanguard',
  },
  {
    id: 'mc-15',
    cardNumber: '15',
    category: 'Wisdom',
    title: 'Obstacle as Fuel',
    mantra:
      'Whatever blocks my path today is the exact stone meant to sharpen my edge.',
    directive: 'Reframe today’s biggest annoyance into deliberate patience training.',
    unlockDay: 45,
    tier: 'Vanguard',
  },

  // Tier 4: Apex (Days 50 – 66)
  {
    id: 'mc-16',
    cardNumber: '16',
    category: 'Discipline',
    title: 'Default Standard',
    mantra:
      'Discipline is no longer a fight I have to win—it has become the air I breathe.',
    directive: 'Finish today’s habits cleanly and prepare tomorrow’s environment tonight.',
    unlockDay: 50,
    tier: 'Apex',
  },
  {
    id: 'mc-17',
    cardNumber: '17',
    category: 'Strength',
    title: 'Unbreakable Frame',
    mantra:
      'Fifty-five days of kept physical vows have forged a body and nervous system built for pressure.',
    directive: 'Bring maximum intent and posture to every rep and every step today.',
    unlockDay: 55,
    tier: 'Apex',
  },
  {
    id: 'mc-18',
    cardNumber: '18',
    category: 'Focus',
    title: 'Razor Precision',
    mantra:
      'My attention goes where I point it and stays until the mission is complete.',
    directive: 'Eliminate one recurring low-value task permanently from your week.',
    unlockDay: 60,
    tier: 'Apex',
  },
  {
    id: 'mc-19',
    cardNumber: '19',
    category: 'Wisdom',
    title: 'The Long Horizon',
    mantra:
      'I trade instant gratification for decades of freedom, clarity, and self-respect.',
    directive: 'Review your earliest Night Accountability entry and measure how far you have climbed.',
    unlockDay: 63,
    tier: 'Apex',
  },
  {
    id: 'mc-20',
    cardNumber: '20',
    category: 'Confidence',
    title: 'Day 66 Sovereign',
    mantra:
      'I kept my word across sixty-six days. No future obstacle can convince me that I am not in command.',
    directive: 'Set your next 66-day horizon and carry this standard forward without breaking stride.',
    unlockDay: 66,
    tier: 'Apex',
  },
];

export function getUnlockedMantraCards(highestDayReached: number): MantraCard[] {
  return MANTRA_CARD_DECK.filter((card) => highestDayReached >= card.unlockDay);
}

export function getNextLockedMantraCard(
  highestDayReached: number
): MantraCard | null {
  const locked = MANTRA_CARD_DECK.filter(
    (card) => highestDayReached < card.unlockDay
  ).sort((a, b) => a.unlockDay - b.unlockDay);
  return locked[0] ?? null;
}

export function getDailySessionMantraCard(
  highestDayReached: number,
  dateKey: string
): MantraCard {
  const unlocked = getUnlockedMantraCards(highestDayReached);
  const pool = unlocked.length > 0 ? unlocked : [MANTRA_CARD_DECK[0]];

  // If a card unlocked on this exact milestone day, showcase it first!
  const newlyUnlocked = pool.find((card) => card.unlockDay === highestDayReached && highestDayReached > 1);
  if (newlyUnlocked) return newlyUnlocked;

  // Deterministic daily hash based on local calendar date + unlocked count
  let hash = 0;
  const seed = `${dateKey}-${pool.length}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}
