import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Flame,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Send,
  Trash2,
  Wind,
} from 'lucide-react';
import { MENTOR_TRIGGERS } from '../data/mentorResponses';
import {
  CALM_URGE_REMINDERS,
  RELAPSE_TRIGGERS,
} from '../data/recoveryCompanion';
import { ChatMessage, RelapseTrigger } from '../types';
import { URGE_BREAKER_XP } from '../utils/storage';
import { UrgeTimerMinutes } from './UrgeBreakerModal';

interface UrgeAndMentorProps {
  urgeBreakersCompleted: number;
  hardestTrigger: string;
  messages: ChatMessage[];
  onLaunchUrgeBreaker: (
    durationMinutes?: UrgeTimerMinutes,
    trigger?: RelapseTrigger
  ) => void;
  onCompleteInlineUrge: (payload: {
    durationMinutes: UrgeTimerMinutes;
    trigger?: RelapseTrigger;
  }) => void;
  onSendMessage: (text: string, explicitTriggerId?: string) => void;
  onClearChat: () => void;
}

const DURATION_OPTIONS: UrgeTimerMinutes[] = [3, 5, 10];
const CYCLE_SECONDS = 14; // 4s Inhale • 4s Hold • 6s Exhale

interface ExcuseCounterItem {
  id: string;
  excuse: string;
  counter: string;
}

const EXCUSE_DESTROYERS: ExcuseCounterItem[] = [
  {
    id: 'tomorrow',
    excuse: '“I’ll start tomorrow.”',
    counter:
      'Tomorrow is the favorite lie of the version of you that stays stuck. Execute 5 minutes right now.',
  },
  {
    id: 'tired',
    excuse: '“I’m too tired today.”',
    counter:
      'You are never too tired to scroll for an hour. Move first—energy follows action, not comfort.',
  },
  {
    id: 'five-mins',
    excuse: '“Just 5 more minutes.”',
    counter:
      'Five minutes is never five minutes. It is a trapdoor straight into an hour of regret.',
  },
  {
    id: 'motivation',
    excuse: '“I don’t feel motivated.”',
    counter:
      'Amateurs wait for a mood. Disciplined people keep the promise when motivation is at zero.',
  },
  {
    id: 'just-once',
    excuse: '“One slip won’t matter.”',
    counter:
      'Every broken streak began with “just once.” Protect the chain—zero negotiations with urges.',
  },
  {
    id: 'too-busy',
    excuse: '“I’m too busy right now.”',
    counter:
      'Check your screen time. You do not lack hours—you are donating them to cheap distractions.',
  },
];

function getInlineBreathState(elapsedSec: number): {
  phase: 'inhale' | 'hold' | 'exhale';
  label: string;
  phaseRemaining: number;
  scale: number;
  transitionMs: number;
} {
  const pos = elapsedSec % CYCLE_SECONDS;
  if (pos < 4) {
    return {
      phase: 'inhale',
      label: 'Inhale',
      phaseRemaining: 4 - pos,
      scale: 1.15,
      transitionMs: 4000,
    };
  }
  if (pos < 8) {
    return {
      phase: 'hold',
      label: 'Hold',
      phaseRemaining: 8 - pos,
      scale: 1.15,
      transitionMs: 400,
    };
  }
  return {
    phase: 'exhale',
    label: 'Exhale',
    phaseRemaining: 14 - pos,
    scale: 0.68,
    transitionMs: 6000,
  };
}

export const UrgeAndMentor: React.FC<UrgeAndMentorProps> = ({
  urgeBreakersCompleted,
  hardestTrigger,
  messages,
  onLaunchUrgeBreaker,
  onCompleteInlineUrge,
  onSendMessage,
  onClearChat,
}) => {
  const [draft, setDraft] = useState('');
  const [selectedMinutes, setSelectedMinutes] = useState<UrgeTimerMinutes>(5);
  const [selectedTrigger, setSelectedTrigger] = useState<
    RelapseTrigger | undefined
  >(undefined);
  const [inlineRunning, setInlineRunning] = useState(false);
  const [inlineSecondsLeft, setInlineSecondsLeft] = useState(5 * 60);
  const [reminderIndex, setReminderIndex] = useState(0);
  const [flippedExcuses, setFlippedExcuses] = useState<Record<string, boolean>>({});

  const flippedCount = Object.values(flippedExcuses).filter(Boolean).length;

  const toggleExcuseFlip = (id: string) => {
    setFlippedExcuses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const totalInlineSeconds = selectedMinutes * 60;

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  // Inline gentle timer tick
  useEffect(() => {
    if (!inlineRunning) return;
    const id = window.setInterval(() => {
      setInlineSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setInlineRunning(false);
          onCompleteInlineUrge({
            durationMinutes: selectedMinutes,
            trigger: selectedTrigger,
          });
          return selectedMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [inlineRunning, selectedMinutes, selectedTrigger, onCompleteInlineUrge]);

  const inlineElapsed = Math.max(0, totalInlineSeconds - inlineSecondsLeft);
  const breath = useMemo(
    () => getInlineBreathState(inlineElapsed),
    [inlineElapsed]
  );

  useEffect(() => {
    if (inlineRunning && inlineElapsed > 0 && inlineElapsed % 14 === 0) {
      setReminderIndex((prev) => (prev + 1) % CALM_URGE_REMINDERS.length);
    }
  }, [inlineRunning, inlineElapsed]);

  const handleSelectMinutes = (mins: UrgeTimerMinutes) => {
    setSelectedMinutes(mins);
    setInlineRunning(false);
    setInlineSecondsLeft(mins * 60);
  };

  const handleResetInline = () => {
    setInlineRunning(false);
    setInlineSecondsLeft(selectedMinutes * 60);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draft.trim();
    if (!cleaned) return;
    onSendMessage(cleaned);
    setDraft('');
  };

  const minsStr = String(Math.floor(inlineSecondsLeft / 60)).padStart(2, '0');
  const secsStr = String(inlineSecondsLeft % 60).padStart(2, '0');
  const activeReminder = CALM_URGE_REMINDERS[reminderIndex];
  const circleScale = inlineRunning ? breath.scale : 0.78;
  const circleTransitionMs = inlineRunning ? breath.transitionMs : 500;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-xs text-zinc-400">
          100% Offline Support · Primary Trigger: {hardestTrigger}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Urge Breaker &amp; Discipline Mentor
        </h1>
      </div>

      {/* Compact Excuse Destroyer Strip */}
      <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Flame className="w-4 h-4 text-[#e11d48] shrink-0" />
            <h2 className="text-sm font-semibold text-white">
              Excuse Destroyer
            </h2>
            <span className="text-xs text-zinc-400 hidden sm:inline">
              · Tap any excuse to flip it into a brutal counter-argument
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono-tabular text-zinc-500">
              {flippedCount}/6 destroyed
            </span>
            {flippedCount > 0 && (
              <button
                type="button"
                onClick={() => setFlippedExcuses({})}
                className="min-h-[34px] px-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {EXCUSE_DESTROYERS.map((item) => {
            const flipped = Boolean(flippedExcuses[item.id]);
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={flipped}
                onClick={() => toggleExcuseFlip(item.id)}
                className={`min-h-[76px] w-full p-3.5 rounded-xl border text-left transition-all duration-150 active:scale-[0.99] flex flex-col justify-between gap-1.5 ${
                  flipped
                    ? 'bg-[#e11d48]/12 border-[#e11d48]/60 text-white'
                    : 'bg-[#09090b] border-zinc-800/90 hover:border-zinc-700 text-zinc-200 hover:text-white'
                }`}
              >
                {flipped ? (
                  <>
                    <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                      <span className="text-[#fb7185] truncate">
                        Destroyed · {item.excuse}
                      </span>
                      <span className="text-zinc-400 font-normal whitespace-nowrap shrink-0">
                        Flip back
                      </span>
                    </div>
                    <p className="text-xs sm:text-[13px] font-medium text-zinc-100 leading-snug">
                      {item.counter}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                      <span>Common Excuse</span>
                      <span className="text-[#f59e0b] font-medium whitespace-nowrap">
                        Destroy →
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-zinc-100">
                      {item.excuse}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Upgraded Gentle Craving Urge Timer & Breath Guide */}
        <section className="lg:col-span-5 bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                <Wind className="w-4 h-4" />
                <span>Gentle Craving Timer &amp; Breath Guide</span>
              </span>
              <span className="font-mono-tabular text-zinc-400">
                {urgeBreakersCompleted} defeated
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Breathe Through the Wave
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Cravings crest and dissolve when you stay calm. Pick 3, 5, or 10 minutes and follow the breathing circle until the wave settles.
            </p>
          </div>

          {/* 3 min / 5 min / 10 min Segmented Selector */}
          <div
            role="group"
            aria-label="Select craving timer length"
            className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#09090b] border border-zinc-800"
          >
            {DURATION_OPTIONS.map((mins) => {
              const active = selectedMinutes === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleSelectMinutes(mins)}
                  aria-pressed={active}
                  className={`min-h-[42px] rounded-lg text-xs sm:text-sm font-semibold font-mono-tabular transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {mins} min
                </button>
              );
            })}
          </div>

          {/* Interactive Expanding/Shrinking Breathing Circle */}
          <div className="flex flex-col items-center justify-center py-3 space-y-3">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute w-36 h-36 rounded-full bg-emerald-500/12 border border-emerald-400/25 transition-transform ease-in-out will-change-transform"
                style={{
                  transform: `scale(${circleScale})`,
                  transitionDuration: `${circleTransitionMs}ms`,
                }}
              />
              <div
                aria-hidden="true"
                className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500/25 via-teal-500/15 to-sky-500/20 border border-emerald-300/30 transition-transform ease-in-out will-change-transform"
                style={{
                  transform: `scale(${circleScale * 0.92})`,
                  transitionDuration: `${circleTransitionMs}ms`,
                }}
              />

              <div className="relative z-10 text-center flex flex-col items-center">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-300">
                  {inlineRunning
                    ? `${breath.label} · ${breath.phaseRemaining}s`
                    : 'Ready'}
                </span>
                <span className="font-mono-tabular text-4xl font-bold text-white mt-0.5">
                  {minsStr}:{secsStr}
                </span>
                <span className="text-[11px] font-mono-tabular text-zinc-400 mt-1">
                  4s In · 4s Hold · 6s Out
                </span>
              </div>
            </div>

            {/* Calm Supportive Reminder */}
            <div className="text-center max-w-sm space-y-1 px-2">
              <div className="text-xs font-semibold text-zinc-100">
                {activeReminder.headline}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {activeReminder.body}
              </p>
            </div>
          </div>

          {/* Optional Trigger Tag */}
          <div className="space-y-2 pt-3 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>Optional: tag trigger for Pattern Insights</span>
              <span className="font-mono-tabular text-[#f59e0b]">
                +{URGE_BREAKER_XP} XP on finish
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {RELAPSE_TRIGGERS.map((trigger) => {
                const active = selectedTrigger === trigger.id;
                return (
                  <button
                    key={trigger.id}
                    type="button"
                    onClick={() =>
                      setSelectedTrigger(active ? undefined : trigger.id)
                    }
                    aria-pressed={active}
                    className={`min-h-[36px] px-2.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                        : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {trigger.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls: Inline Breathe + Full-Screen Craving Lock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInlineRunning((r) => !r)}
                className="flex-1 min-h-[48px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                {inlineRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Breath</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleResetInline}
                aria-label="Reset craving timer"
                className="min-h-[48px] min-w-[48px] rounded-xl bg-[#09090b] border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setInlineRunning(false);
                onLaunchUrgeBreaker(selectedMinutes, selectedTrigger);
              }}
              className="min-h-[48px] px-4 rounded-xl bg-[#e11d48] hover:bg-[#be123c] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#e11d48]/20 transition-all whitespace-nowrap"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Full-Screen Lock</span>
            </button>
          </div>
        </section>

        {/* Right: Offline Discipline Mentor Chat */}
        <section className="lg:col-span-7 bg-[#111113] border border-zinc-800/90 rounded-2xl flex flex-col overflow-hidden min-h-[520px] max-h-[680px]">
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">
                Offline Discipline Mentor
              </h2>
              <p className="text-xs text-zinc-400">
                44 pre-programmed responses · Instant zero-API counsel
              </p>
            </div>
            <button
              type="button"
              onClick={onClearChat}
              aria-label="Reset mentor conversation"
              className="min-h-[40px] px-3 rounded-xl border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          {/* Quick-Trigger Action Strip */}
          <div className="px-5 py-3 border-b border-zinc-800/60 bg-[#0d0d0f]">
            <div className="text-[11px] text-zinc-500 mb-2">
              Tap a trigger for an immediate counter-strike:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MENTOR_TRIGGERS.map((trigger) => (
                <button
                  key={trigger.id}
                  type="button"
                  onClick={() =>
                    onSendMessage(
                      `I am dealing with ${trigger.label.toLowerCase()} right now.`,
                      trigger.id
                    )
                  }
                  className="min-h-[36px] px-3 rounded-lg bg-[#111113] border border-zinc-800 hover:border-[#f59e0b]/60 hover:text-white text-xs font-medium text-zinc-300 transition-colors whitespace-nowrap"
                >
                  {trigger.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#e11d48] text-white'
                        : 'bg-[#18181b] border border-zinc-800 text-zinc-100'
                    }`}
                  >
                    {!isUser && msg.triggerLabel && (
                      <div className="text-[11px] font-semibold text-[#f59e0b] mb-1">
                        Mentor · {msg.triggerLabel}
                      </div>
                    )}
                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="p-3.5 border-t border-zinc-800/80 bg-[#0d0d0f] flex items-center gap-2"
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your trigger (e.g., procrastinating, tired, scrolling)..."
              className="flex-1 min-h-[46px] px-4 rounded-xl bg-[#111113] border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#e11d48] transition-colors"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send message to Mentor"
              className="min-h-[46px] min-w-[46px] px-4 rounded-xl bg-[#e11d48] hover:bg-[#be123c] disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
