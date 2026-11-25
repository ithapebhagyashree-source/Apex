import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  Volume2,
  VolumeX,
  Wind,
  X,
} from 'lucide-react';
import { LEGEND_QUOTES } from '../data/quotes';
import {
  CALM_URGE_REMINDERS,
  RELAPSE_TRIGGERS,
} from '../data/recoveryCompanion';
import { RelapseTrigger } from '../types';
import { playBreathCue, playUrgeCompleteChime } from '../utils/audio';
import { URGE_BREAKER_XP } from '../utils/storage';

export type UrgeTimerMinutes = 3 | 5 | 10;

export interface UrgeCompletionPayload {
  durationMinutes: UrgeTimerMinutes;
  trigger?: RelapseTrigger;
}

interface UrgeBreakerModalProps {
  isOpen: boolean;
  initialDurationMinutes?: UrgeTimerMinutes;
  initialTrigger?: RelapseTrigger;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onComplete: (payload: UrgeCompletionPayload) => void;
  onClose: () => void;
}

const DURATION_OPTIONS: UrgeTimerMinutes[] = [3, 5, 10];
const CYCLE_SECONDS = 14; // 4s inhale, 4s hold, 6s exhale

function getBreathPhase(elapsedSec: number): {
  phase: 'inhale' | 'hold' | 'exhale';
  label: string;
  instruction: string;
  phaseRemaining: number;
  targetScale: number;
  transitionMs: number;
} {
  const pos = elapsedSec % CYCLE_SECONDS;
  if (pos < 4) {
    return {
      phase: 'inhale',
      label: 'Inhale',
      instruction: 'Breathe in slowly through your nose',
      phaseRemaining: 4 - pos,
      targetScale: 1.16,
      transitionMs: 4000,
    };
  }
  if (pos < 8) {
    return {
      phase: 'hold',
      label: 'Hold',
      instruction: 'Soften your shoulders and stay steady',
      phaseRemaining: 8 - pos,
      targetScale: 1.16,
      transitionMs: 400,
    };
  }
  return {
    phase: 'exhale',
    label: 'Exhale',
    instruction: 'Let the craving soften as you breathe out',
    phaseRemaining: 14 - pos,
    targetScale: 0.68,
    transitionMs: 6000,
  };
}

export const UrgeBreakerModal: React.FC<UrgeBreakerModalProps> = ({
  isOpen,
  initialDurationMinutes = 5,
  initialTrigger,
  soundEnabled,
  onToggleSound,
  onComplete,
  onClose,
}) => {
  const [durationMinutes, setDurationMinutes] = useState<UrgeTimerMinutes>(
    initialDurationMinutes
  );
  const totalSeconds = durationMinutes * 60;

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [breathArmed, setBreathArmed] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<
    RelapseTrigger | undefined
  >(initialTrigger);
  const [messageMode, setMessageMode] = useState<'calm' | 'quotes'>('calm');
  const [reminderIdx, setReminderIdx] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(() =>
    Math.floor(Math.random() * LEGEND_QUOTES.length)
  );
  const [confirmExit, setConfirmExit] = useState(false);
  const [completed, setCompleted] = useState(false);

  const lastPhaseRef = useRef<'inhale' | 'hold' | 'exhale' | null>(null);
  const hasRewardedRef = useRef(false);

  // Sync duration & trigger whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const startDuration = initialDurationMinutes;
      setDurationMinutes(startDuration);
      setSecondsLeft(startDuration * 60);
      setSelectedTrigger(initialTrigger);
      setCompleted(false);
      setConfirmExit(false);
      setBreathArmed(false);
      hasRewardedRef.current = false;
      lastPhaseRef.current = null;
      setReminderIdx(Math.floor(Math.random() * CALM_URGE_REMINDERS.length));
      setQuoteIdx(Math.floor(Math.random() * LEGEND_QUOTES.length));
      playBreathCue('inhale', soundEnabled);

      const raf = window.requestAnimationFrame(() => {
        setBreathArmed(true);
      });
      return () => window.cancelAnimationFrame(raf);
    }
  }, [isOpen, initialDurationMinutes, initialTrigger]);

  // Handle changing duration cleanly
  const handleSelectDuration = (mins: UrgeTimerMinutes) => {
    if (completed || mins === durationMinutes) return;
    setDurationMinutes(mins);
    setSecondsLeft(mins * 60);
    setBreathArmed(false);
    lastPhaseRef.current = null;
    window.requestAnimationFrame(() => setBreathArmed(true));
  };

  // Countdown tick
  useEffect(() => {
    if (!isOpen || completed) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isOpen, completed, durationMinutes]);

  const elapsed = Math.max(0, totalSeconds - secondsLeft);
  const breath = useMemo(() => getBreathPhase(elapsed), [elapsed]);

  // Trigger breath cues & gently rotate calm reminders / quotes every 18 seconds
  useEffect(() => {
    if (!isOpen || completed) return;

    if (lastPhaseRef.current && lastPhaseRef.current !== breath.phase) {
      playBreathCue(breath.phase, soundEnabled);
    }
    lastPhaseRef.current = breath.phase;

    if (elapsed > 0 && elapsed % 18 === 0) {
      setReminderIdx((prev) => (prev + 1) % CALM_URGE_REMINDERS.length);
      setQuoteIdx((prev) => (prev + 1) % LEGEND_QUOTES.length);
    }
  }, [elapsed, breath.phase, isOpen, completed, soundEnabled]);

  // Handle 00:00 completion
  useEffect(() => {
    if (isOpen && secondsLeft === 0 && !hasRewardedRef.current) {
      hasRewardedRef.current = true;
      setCompleted(true);
      playUrgeCompleteChime(soundEnabled);
      onComplete({
        durationMinutes,
        trigger: selectedTrigger,
      });
    }
  }, [
    isOpen,
    secondsLeft,
    soundEnabled,
    onComplete,
    durationMinutes,
    selectedTrigger,
  ]);

  if (!isOpen) return null;

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;
  const radius = 106;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - progress);
  const currentReminder = CALM_URGE_REMINDERS[reminderIdx];
  const currentQuote = LEGEND_QUOTES[quoteIdx];
  const circleScale = breathArmed ? breath.targetScale : 0.68;

  const phaseAccentText =
    breath.phase === 'inhale'
      ? 'text-emerald-300'
      : breath.phase === 'hold'
      ? 'text-[#f59e0b]'
      : 'text-sky-300';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gentle Craving Urge Timer and Breath Guide"
      className="fixed inset-0 z-50 bg-[#09090b]/98 backdrop-blur-md flex flex-col justify-between p-5 sm:p-8 overflow-y-auto"
    >
      {/* Top Controls */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-white min-w-0">
          <Wind className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="truncate">Gentle Craving Timer</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* 3 min / 5 min / 10 min Segmented Control */}
          {!completed && (
            <div
              role="group"
              aria-label="Craving timer duration"
              className="flex items-center p-1 rounded-xl bg-[#111113] border border-zinc-800"
            >
              {DURATION_OPTIONS.map((m) => {
                const active = durationMinutes === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectDuration(m)}
                    aria-pressed={active}
                    className={`min-h-[34px] px-2.5 rounded-lg text-xs font-semibold font-mono-tabular transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {m}m
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute chime cues' : 'Enable chime cues'}
            className="min-h-[44px] min-w-[44px] rounded-xl border border-zinc-800 bg-[#111113] flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#f59e0b]" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => (completed ? onClose() : setConfirmExit(true))}
            aria-label="Close Urge Timer"
            className="min-h-[44px] min-w-[44px] rounded-xl border border-zinc-800 bg-[#111113] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Lock Focus */}
      <div className="w-full max-w-xl mx-auto my-auto py-5 flex flex-col items-center text-center space-y-6">
        {!completed ? (
          <>
            {/* Smooth Expanding/Shrinking Breathing Circle + Countdown Ring */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Outer soft aura expanding smoothly */}
              <div
                aria-hidden="true"
                className="absolute w-44 h-44 rounded-full bg-emerald-500/12 border border-emerald-400/25 transition-transform ease-in-out will-change-transform"
                style={{
                  transform: `scale(${circleScale})`,
                  transitionDuration: `${breath.transitionMs}ms`,
                }}
              />
              {/* Inner luminous breathing sphere */}
              <div
                aria-hidden="true"
                className="absolute w-36 h-36 rounded-full bg-gradient-to-br from-emerald-500/25 via-teal-500/15 to-sky-500/20 border border-emerald-300/30 transition-transform ease-in-out will-change-transform"
                style={{
                  transform: `scale(${circleScale * 0.94})`,
                  transitionDuration: `${breath.transitionMs}ms`,
                }}
              />

              {/* Outer Timer Progress Arc */}
              <svg
                className="w-64 h-64 sm:w-72 sm:h-72 -rotate-90 relative z-10"
                viewBox="0 0 240 240"
              >
                <defs>
                  <linearGradient id="urgeCalmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  fill="none"
                  stroke="#18181b"
                  strokeWidth="6"
                />
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  fill="none"
                  stroke="url(#urgeCalmGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  className="transition-[stroke-dashoffset] duration-700 ease-linear"
                />
              </svg>

              {/* Center Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6">
                <span
                  className={`text-xs font-semibold uppercase tracking-widest ${phaseAccentText}`}
                >
                  {breath.label} · {breath.phaseRemaining}s
                </span>
                <span className="font-mono-tabular text-5xl font-bold tracking-tight text-white mt-1">
                  {mins}:{secs}
                </span>
                <span className="mt-1.5 text-xs text-zinc-300 max-w-[175px] leading-snug">
                  {breath.instruction}
                </span>
              </div>
            </div>

            {/* Cadence Line */}
            <div className="text-xs font-mono-tabular text-zinc-400">
              4s Inhale · 4s Hold · 6s Exhale
            </div>

            {/* Supportive Reminders / Legends Quotes Card */}
            <div className="w-full bg-[#111113] border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-3.5 text-left">
              <div className="flex items-center justify-between gap-2">
                <div
                  role="tablist"
                  aria-label="Guidance mode"
                  className="flex items-center p-1 rounded-lg bg-[#09090b] border border-zinc-800"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={messageMode === 'calm'}
                    onClick={() => setMessageMode('calm')}
                    className={`min-h-[32px] px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      messageMode === 'calm'
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Calm Wave
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={messageMode === 'quotes'}
                    onClick={() => setMessageMode('quotes')}
                    className={`min-h-[32px] px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      messageMode === 'quotes'
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Legends Quotes
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (messageMode === 'calm') {
                      setReminderIdx(
                        (prev) => (prev + 1) % CALM_URGE_REMINDERS.length
                      );
                    } else {
                      setQuoteIdx((prev) => (prev + 1) % LEGEND_QUOTES.length);
                    }
                  }}
                  className="min-h-[36px] px-2.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Next</span>
                </button>
              </div>

              {messageMode === 'calm' ? (
                <div className="space-y-1.5">
                  <div className="text-base font-semibold text-white">
                    {currentReminder.headline}
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {currentReminder.body}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-base font-medium text-zinc-100 leading-relaxed">
                    “{currentQuote.text}”
                  </p>
                  <div className="text-xs text-zinc-400">
                    {currentQuote.speaker} · {currentQuote.context}
                  </div>
                </div>
              )}

              {/* Optional 1-Tap Trigger Tagging for Pattern Insights */}
              <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                <div className="text-[11px] text-zinc-500">
                  Optional: tag what sparked this wave (updates Pattern Insights)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {RELAPSE_TRIGGERS.map((t) => {
                    const active = selectedTrigger === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          setSelectedTrigger(active ? undefined : t.id)
                        }
                        aria-pressed={active}
                        className={`min-h-[34px] px-2.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                          active
                            ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                            : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400 max-w-md">
              Breathe through the wave until 00:00 to let the craving pass and earn{' '}
              <span className="text-[#f59e0b] font-semibold">
                +{URGE_BREAKER_XP} XP
              </span>
              .
            </p>
          </>
        ) : (
          <div className="w-full bg-[#111113] border border-emerald-500/30 rounded-2xl p-8 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-bold text-white">
                The Wave Has Passed
              </h2>
              <p className="text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed">
                You stayed calm and breathed through all {durationMinutes} minutes. Every wave you surf makes the next one quieter.
              </p>
            </div>
            <div className="font-mono-tabular text-2xl font-bold text-[#f59e0b]">
              +{URGE_BREAKER_XP} XP Awarded
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[48px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Exit Confirmation Footer */}
      <div className="w-full max-w-xl mx-auto">
        {confirmExit && !completed ? (
          <div className="bg-[#111113] border border-zinc-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-left">
              <ShieldAlert className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-white">
                  Step out of the craving timer early?
                </div>
                <div className="text-xs text-zinc-400">
                  Stay a little longer if the wave still feels loud—you are doing well.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmExit(false)}
                className="min-h-[44px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold whitespace-nowrap"
              >
                Keep Breathing
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium whitespace-nowrap"
              >
                Exit Timer
              </button>
            </div>
          </div>
        ) : (
          <div className="h-6" />
        )}
      </div>
    </div>
  );
};
