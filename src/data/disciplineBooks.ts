export interface DisciplineBookSummary {
  id: string;
  title: string;
  author: string;
  readTime: string;
  coreFocus: string;
  thesis: string;
  actionRules: string[];
  immediateAction: string;
}

export const CLASSIC_DISCIPLINE_BOOKS: DisciplineBookSummary[] = [
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    readTime: '1 min read',
    coreFocus: 'Systems & Identity',
    thesis:
      'You do not rise to the level of your goals; you fall to the level of your systems. Tiny daily votes compound into an irreversible identity shift.',
    actionRules: [
      'Design your environment so good habits are obvious and bad habits require friction (phone in another room, workout gear laid out).',
      'Use the Two-Minute Rule to start any resisted habit—showing up matters more than perfection.',
      'Apply the Never Miss Twice rule: one slip is an accident, two in a row starts a new bad habit.',
    ],
    immediateAction:
      'Remove one friction point from tomorrow’s hardest habit before going to sleep tonight.',
  },
  {
    id: 'cant-hurt-me',
    title: "Can't Hurt Me",
    author: 'David Goggins',
    readTime: '1 min read',
    coreFocus: 'Mental Callusing',
    thesis:
      'Most people quit at 40% of their real capacity because their mind pulls the emergency brake early to protect comfort.',
    actionRules: [
      'Use the Accountability Mirror: write down raw, unvarnished truths about your leaks and face them daily.',
      'Build a Cookie Jar of past hard moments you survived, and pull from it when fatigue tells you to stop.',
      'Voluntarily do something uncomfortable every single day so your mind learns to obey commands under pressure.',
    ],
    immediateAction:
      'When your next workout or deep-work block feels finished, push an extra 10% before stopping.',
  },
  {
    id: 'extreme-ownership',
    title: 'Extreme Ownership',
    author: 'Jocko Willink & Leif Babin',
    readTime: '1 min read',
    coreFocus: 'Total Responsibility',
    thesis:
      'Blaming circumstances, bad luck, or other people surrenders your power to fix the problem. Own every outcome in your life without exception.',
    actionRules: [
      'Eliminate excuses immediately—ask "What did I fail to prepare or enforce?" after any setback.',
      'Prioritize and Execute: when overwhelmed, detach, identify the single highest-priority problem, and attack it alone.',
      'Remember Discipline Equals Freedom: rigid schedules and standards buy you genuine autonomy later.',
    ],
    immediateAction:
      'Take 100% ownership of your biggest recent slip in tonight’s Night Accountability Journal with zero blame.',
  },
  {
    id: 'meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    readTime: '1 min read',
    coreFocus: 'Stoic Self-Command',
    thesis:
      'External events cannot break your discipline—only your judgment of them can. Guard your inner citadel with clarity and restraint.',
    actionRules: [
      'Separate every stressor into two buckets: what you control (actions, choices) and what you do not (others, delays).',
      'Turn obstacles into raw material: frustration, fatigue, and setbacks are the exact training ground for virtue.',
      'Rehearse resistance at dawn so distractions and difficult people never catch your mind off guard.',
    ],
    immediateAction:
      'Write down one annoying obstacle you face today and decide how to use it to practice patience or focus.',
  },
  {
    id: 'deep-work',
    title: 'Deep Work',
    author: 'Cal Newport',
    readTime: '1 min read',
    coreFocus: 'Distraction-Free Output',
    thesis:
      'The ability to focus without distraction on cognitively demanding work is rare—and therefore exponentially valuable.',
    actionRules: [
      'Schedule fixed, phone-free 50-minute deep blocks on your calendar rather than hoping motivation strikes.',
      'Embrace boredom between tasks: checking your phone in idle 30-second gaps rewires your brain against sustained concentration.',
      'End every workday with a strict Shutdown Ritual so your brain fully recovers for tomorrow’s deep session.',
    ],
    immediateAction:
      'Launch one 50-minute Pomodoro Deep Block right now with all messaging tabs closed.',
  },
];
