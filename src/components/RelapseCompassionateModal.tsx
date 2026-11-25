import React, { useEffect, useState } from 'react';
import { HeartHandshake, Snowflake, Sprout, X } from 'lucide-react';
import {
  DANGER_TIME_WINDOWS,
  RELAPSE_TRIGGERS,
  getPlantStageForDays,
  getTimeWindowFromHour,
} from '../data/recoveryCompanion';
import { DangerTimeWindow, RelapseTrigger } from '../types';

export interface RelapseResetPayload {
  trigger: RelapseTrigger;
  timeWindow: DangerTimeWindow;
  note?: string;
}

interface RelapseCompassionateModalProps {
  isOpen: boolean;
  currentStreakDays: number;
  bestStreakDays: number;
  canUseFreezeToday: boolean;
  onConfirmReset: (payload: RelapseResetPayload) => void;
  onUseFreezeInstead: () => void;
  onClose: () => void;
}

export const RelapseCompassionateModal: React.FC<
  RelapseCompassionateModalProps
> = ({
  isOpen,
  currentStreakDays,
  bestStreakDays,
  canUseFreezeToday,
  onConfirmReset,
  onUseFreezeInstead,
  onClose,
}) => {
  const [selectedTrigger, setSelectedTrigger] =
    useState<RelapseTrigger>('Phone/Scroll');
  const [selectedWindow, setSelectedWindow] = useState<DangerTimeWindow>(() =>
    getTimeWindowFromHour(new Date().getHours())
  );
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedWindow(getTimeWindowFromHour(new Date().getHours()));
      setNote('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStage = getPlantStageForDays(currentStreakDays);
  const preservedBest = Math.max(bestStreakDays, currentStreakDays);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReset({
      trigger: selectedTrigger,
      timeWindow: selectedWindow,
      note: note.trim() || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compassionate Reset and Trigger Log"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-[#111113] border border-zinc-800 rounded-2xl p-6 space-y-5 my-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/12 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">
                Pause, breathe, and reset gently
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                A slip is useful pattern data—never a failure. Every honest reset makes your next streak steadier.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close reset dialog"
            className="min-h-[44px] min-w-[44px] -mt-1 -mr-1 rounded-xl text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Protection Summary */}
        <div className="py-3 border-y border-zinc-800/80 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-300">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
            <Sprout className="w-3.5 h-3.5 shrink-0" />
            <span>
              Day {currentStreakDays} {currentStage.name} saved to My Garden
            </span>
          </span>
          <span aria-hidden="true" className="text-zinc-600">
            ·
          </span>
          <span className="font-mono-tabular text-zinc-300">
            All-Time Best stays{' '}
            <strong className="text-[#f59e0b]">{preservedBest}d</strong>
          </span>
        </div>

        {/* Trigger Selector */}
        <div className="space-y-2.5">
          <div className="text-xs font-medium text-zinc-300">
            What triggered this moment? (Helps spot your #1 pattern)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {RELAPSE_TRIGGERS.map((item) => {
              const active = selectedTrigger === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedTrigger(item.id)}
                  aria-pressed={active}
                  className={`min-h-[44px] px-3 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#f59e0b]/15 border-[#f59e0b] text-[#fde68a]'
                      : 'bg-[#09090b] border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Window Selector */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-300">
            When did it happen?
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DANGER_TIME_WINDOWS.map((win) => {
              const active = selectedWindow === win.id;
              return (
                <button
                  key={win.id}
                  type="button"
                  onClick={() => setSelectedWindow(win.id)}
                  aria-pressed={active}
                  className={`min-h-[44px] px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors flex flex-col items-center justify-center ${
                    active
                      ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                      : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span className="font-semibold whitespace-nowrap">{win.label}</span>
                  <span className="text-[10px] font-mono-tabular opacity-80">
                    {win.rangeLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Gentle Reflection */}
        <div className="space-y-1.5">
          <label
            htmlFor="relapse-gentle-note"
            className="block text-xs font-medium text-zinc-400"
          >
            Optional note: one small thing to try next time
          </label>
          <input
            id="relapse-gentle-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={140}
            placeholder="e.g., Leave phone charging in the hallway after 10 PM"
            className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#09090b] border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/70 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-zinc-800/80">
          {canUseFreezeToday && (
            <button
              type="button"
              onClick={onUseFreezeInstead}
              className="min-h-[44px] px-3.5 rounded-xl bg-sky-500/15 border border-sky-400/40 hover:bg-sky-500/25 text-xs sm:text-sm font-semibold text-sky-300 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Snowflake className="w-4 h-4" />
              <span>Use Freeze Instead</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-sm font-medium text-zinc-200 transition-colors whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-[44px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold transition-colors whitespace-nowrap"
          >
            Log Pattern &amp; Plant Fresh Seed
          </button>
        </div>
      </form>
    </div>
  );
};
