export interface MentorTriggerGroup {
  id: string;
  label: string;
  keywords: string[];
  responses: string[];
}

export const MENTOR_TRIGGERS: MentorTriggerGroup[] = [
  {
    id: 'procrastination',
    label: 'Procrastination',
    keywords: [
      'procrastinat',
      'later',
      'delay',
      'put off',
      'cant start',
      "can't start",
      'avoid',
      'stalling',
      'waiting',
    ],
    responses: [
      'Procrastination is fear wearing a disguise. Cut the task down to a 5-minute entry point and start the timer right now. Action destroys anxiety—thinking feeds it.',
      'You are waiting to feel ready, and ready never arrives. Close every extra tab, put your phone in another room, and execute the first ugly 10 minutes immediately.',
      'Every hour you stall is a vote for your old identity. Stop drafting the perfect plan and complete the hardest 15 minutes of your #1 task before checking anything else.',
      'Discipline is starting before the mood arrives. Count down 5-4-3-2-1, sit at your desk, and touch the work. Momentum only exists after the first strike.',
    ],
  },
  {
    id: 'laziness',
    label: 'Laziness',
    keywords: [
      'lazy',
      'laziness',
      'couch',
      'comfort',
      'dont feel like',
      "don't feel like",
      'unmotivated',
      'sloth',
      'weak',
    ],
    responses: [
      'Comfort is a slow debt with brutal interest. Stand up right now, drink a full glass of water, do 20 pushups, and get to work. Do not negotiate with the soft voice in your head.',
      'Your body always votes for conservation; your standards must overrule it. Treat today’s checklist like a contract signed in ink, not a suggestion based on mood.',
      'You did not start a 66-day reset to keep acting like the person you were yesterday. Do the exact habit you are resisting most—first.',
      'Laziness thrives in ambiguity. Pick one unchecked habit from your list, commit to finishing it in the next 30 minutes, and report back when it is checked off.',
    ],
  },
  {
    id: 'phone_addiction',
    label: 'Phone Addiction',
    keywords: [
      'phone',
      'scroll',
      'tiktok',
      'instagram',
      'reels',
      'shorts',
      'youtube',
      'social media',
      'dopamine',
      'screen',
      'distract',
    ],
    responses: [
      'Every swipe trades your ambition for someone else’s ad revenue. Put the phone in airplane mode and place it physically out of arm’s reach for the next 90 minutes.',
      'Your brain is craving cheap novelty because deep work feels quiet. Switch your display to grayscale, silence notifications, and reclaim control of your attention span.',
      'Scrolling numbs stress for 3 minutes and amplifies regret for 3 hours. Launch the 5-Minute Urge Breaker right now and break the thumb loop before it owns your evening.',
      'You cannot build an extraordinary 66-day streak while feeding a 15-second attention span. Plug your phone in across the room—no screens in bed, no exceptions.',
    ],
  },
  {
    id: 'morning_fatigue',
    label: 'Morning Fatigue',
    keywords: [
      'morning',
      'tired',
      'sleepy',
      'snooze',
      'wake',
      'bed',
      'exhausted',
      'fatigue',
      'groggy',
    ],
    responses: [
      'The first victory of the day happens when your feet hit the floor. Cold water on your face, 500ml hydration, natural light in your eyes—zero snooze button.',
      'Feeling heavy in the first 10 minutes after waking is normal biology, not a reason to quit. Move your body for 5 minutes and your nervous system will wake up.',
      'If you hit snooze, you start the day by breaking your very first promise to yourself. Protect tonight’s lights-out time so tomorrow morning is fought with a full tank.',
      'Marcus Aurelius fought the warm blankets two thousand years ago too. Remind yourself why you chose this 66-day reset, stand up, and win the first hour.',
    ],
  },
  {
    id: 'urges_cravings',
    label: 'Urges & Cravings',
    keywords: [
      'urge',
      'craving',
      'relapse',
      'tempt',
      'sugar',
      'junk',
      'binge',
      'impulse',
      'addict',
      'slip',
    ],
    responses: [
      'An urge peaks and fades like a wave in under 15 minutes if you refuse to feed it. Hit the 5-Minute Urge Breaker above right now and ride the crest with breath.',
      'Fast-forward the tape 20 minutes: imagine the hollow regret after giving in versus the iron pride of walking past it. Never trade a 66-day standard for 5 minutes of dopamine.',
      'Change your physical state immediately. Leave the room, take a brisk 5-minute walk, splash cold water on your wrists, and starve the trigger of isolation.',
      'Cravings scream loudest right before an old wiring pathway starts to die. Feeling the pull means the rewiring is working—hold the line.',
    ],
  },
  {
    id: 'self_doubt',
    label: 'Self-Doubt & Fear',
    keywords: [
      'doubt',
      'fear',
      'scared',
      'fail',
      'impossible',
      'hard',
      'quit',
      'give up',
      'worthless',
      'anxious',
    ],
    responses: [
      'Self-doubt shrinks in direct proportion to kept promises. You do not need to conquer Day 66 today—you only need to execute today’s checklist cleanly.',
      'Confidence is not an affirmation; it is a receipt built from stacked days of proof. Keep one non-negotiable promise in the next hour and collect evidence.',
      'Every person you admire had mornings where quitting felt logical. Let fear sit in the passenger seat, but never hand it the steering wheel.',
      'Failure is not falling behind—failure is surrendering the standard. Narrow your vision to the next single action and execute with calm precision.',
    ],
  },
  {
    id: 'low_motivation',
    label: 'Low Motivation',
    keywords: [
      'motivat',
      'bored',
      'boring',
      'flat',
      'numb',
      'pointless',
      'why bother',
      'burned out',
      'burnout',
    ],
    responses: [
      'Motivation is for Day 1. Systems and identity are for Day 18, Day 37, and Day 66. Show up especially on the gray, unglamorous days—that is where separation happens.',
      'Boredom is the tax required for mastery. Amateurs chase excitement; professionals fall in love with repeating the fundamentals until they become unstoppable.',
      'Stop auditing your feelings before acting. Audit your calendar and your non-negotiables instead. Execute the plan even at 70% energy.',
      'If you feel drained, check the fundamentals first: sleep hours, hydration, clean fuel, and screen overload. Fix the inputs before questioning the mission.',
    ],
  },
  {
    id: 'missed_slip',
    label: 'Missed a Habit',
    keywords: [
      'missed',
      'broke',
      'messed up',
      'failed',
      'guilt',
      'behind',
      'streak',
      'ruined',
    ],
    responses: [
      'Own the miss completely—no excuses, no drama. Look at what caused the leak, write it in tonight’s Night Accountability Journal, and never miss twice.',
      'One stumble is data; turning one stumble into a three-day spiral is a choice. Draw the line right now at this exact hour and finish the rest of today clean.',
      'Good. A slip exposed a weak seam in your environment. Tighten the boundary, remove the trigger, and come back harder tomorrow.',
      'Guilt without correction is wasted energy. Convert regret into a concrete structural fix for tomorrow morning.',
    ],
  },
  {
    id: 'focus_deep_work',
    label: 'Deep Focus',
    keywords: [
      'focus',
      'study',
      'work',
      'concentrat',
      'adhd',
      'scatter',
      'overwhelm',
      'too much',
    ],
    responses: [
      'Overwhelm comes from trying to solve five battles at once. Pick one single high-impact target, set a 45-minute uninterrupted block, and ignore everything else until the bell rings.',
      'Clear your desk down to one tool and one objective. Multitasking slices your IQ and stretches a 2-hour block into a miserable 6-hour drag.',
      'Write the single deliverable for this session on a piece of paper. Do not leave your chair until that exact deliverable exists.',
      'Protect your deep-work block like a locked vault. Turn off badges, close messaging apps, and honor the craft.',
    ],
  },
  {
    id: 'night_discipline',
    label: 'Late-Night Trap',
    keywords: [
      'night',
      'late',
      'midnight',
      'insomnia',
      'cant sleep',
      "can't sleep",
      'evening',
      'bored at night',
    ],
    responses: [
      'Nothing good for your 66-day mission happens after your lights-out time with a glowing screen. Complete your Night Accountability Journal now and dock your phone outside the bedroom.',
      'Tomorrow’s discipline is won tonight at bedtime. Staying up for one more video steals tomorrow morning’s focus and willpower.',
      'Dim the lights, log your 1 Win and 1 Leak, set out your morning gear, and shut the system down. Warriors respect recovery.',
      'Late-night willpower is always depleted—do not rely on grit at 11 PM, rely on a hard shutdown cutoff.',
    ],
  },
];

export const GENERAL_MENTOR_FALLBACKS: string[] = [
  'Cut the noise and return to fundamentals: check your remaining non-negotiable habits for today, pick the hardest one, and execute it without debate.',
  'Discipline is built in quiet moments when no one is applauding. What is the single most important action you can complete in the next 20 minutes?',
  'Do not negotiate with excuses. Review your #1 goal, silence every distraction within arm’s reach, and earn your +30 XP through action.',
  'Control the controllable: your breath, your attention, your next physical action. Stand tall, execute one habit at a time, and close the day undefeated.',
];

// Total pre-programmed responses: 10 groups * 4 = 40 + 4 general = 44 offline responses.
export function getOfflineMentorReply(
  input: string,
  usedTexts: Set<string>,
  explicitTriggerId?: string
): { text: string; triggerLabel: string } {
  const normalized = input.toLowerCase().trim();

  let matchedGroup: MentorTriggerGroup | undefined;

  if (explicitTriggerId) {
    matchedGroup = MENTOR_TRIGGERS.find((g) => g.id === explicitTriggerId);
  }

  if (!matchedGroup && normalized) {
    let bestScore = 0;
    for (const group of MENTOR_TRIGGERS) {
      let score = 0;
      for (const kw of group.keywords) {
        if (normalized.includes(kw)) {
          score += kw.length;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        matchedGroup = group;
      }
    }
  }

  const pool = matchedGroup ? matchedGroup.responses : GENERAL_MENTOR_FALLBACKS;
  const label = matchedGroup ? matchedGroup.label : 'Tactical Reset';

  const unseen = pool.filter((r) => !usedTexts.has(r));
  const candidates = unseen.length > 0 ? unseen : pool;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];

  return { text: pick, triggerLabel: label };
}
