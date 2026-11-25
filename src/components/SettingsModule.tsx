import React, { useState } from 'react';
import {
  AlertTriangle,
  Download,
  Flame,
  SlidersHorizontal,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AppState } from '../types';
import { PersonalizedAssessmentCard } from './PersonalizedAssessmentCard';

interface SettingsModuleProps {
  state: AppState;
  onRetakeQuiz: () => void;
  onToggleHardMode: () => void;
  onToggleSound: () => void;
  onExportBackup: () => void;
  onFactoryReset: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  state,
  onRetakeQuiz,
  onToggleHardMode,
  onToggleSound,
  onExportBackup,
  onFactoryReset,
}) => {
  const [confirmWipe, setConfirmWipe] = useState(false);

  const profileRows = [
    { label: 'Callsign', value: state.profile.callsign },
    { label: '#1 Goal', value: state.profile.primaryGoal },
    { label: 'Worst Distraction', value: state.profile.worstDistraction },
    {
      label: 'Wake / Sleep Schedule',
      value: `${state.profile.wakeTime} – ${state.profile.sleepTime}`,
    },
    { label: 'Daily Deep Work', value: state.profile.deepWorkHours },
    { label: 'Fitness Target', value: state.profile.fitnessTarget },
    { label: 'Nutrition Standard', value: state.profile.nutritionTarget },
    { label: 'Vulnerability Window', value: state.profile.vulnerabilityWindow },
    { label: 'Primary Mental Trigger', value: state.profile.hardestTrigger },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs text-zinc-400">
            Personalization Profile &amp; System Preferences
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Setup &amp; Protocol Settings
          </h1>
        </div>

        <button
          type="button"
          onClick={onRetakeQuiz}
          className="min-h-[44px] px-5 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Retake 10-Question Setup</span>
        </button>
      </div>

      <PersonalizedAssessmentCard answers={state.profile} compact />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile Summary */}
        <section className="lg:col-span-7 bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Your 66-Day Personalization Blueprint
            </h2>
            <span className="text-xs font-mono-tabular text-zinc-500">
              {state.habits.length} Active Habits
            </span>
          </div>

          <dl className="divide-y divide-zinc-800/80">
            {profileRows.map((row) => (
              <div
                key={row.label}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm"
              >
                <dt className="text-zinc-400">{row.label}</dt>
                <dd className="text-zinc-100 font-medium sm:text-right">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Preferences & Data Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Hard Mode Toggle Card */}
          <section
            className={`bg-[#111113] border rounded-2xl p-5 sm:p-6 space-y-4 transition-colors ${
              state.hardMode ? 'border-[#e11d48]/55' : 'border-zinc-800/90'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Flame
                    className={`w-4 h-4 shrink-0 ${
                      state.hardMode ? 'text-[#e11d48]' : 'text-zinc-500'
                    }`}
                  />
                  <h2 className="text-base font-semibold text-white">
                    Hard Mode Protocol
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Zero mercy enforcement. If yesterday&apos;s habits are not 100% completed before midnight, your streak automatically resets to Day 1.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={state.hardMode}
                aria-label="Toggle Hard Mode"
                onClick={onToggleHardMode}
                className={`min-h-[44px] px-4 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                  state.hardMode
                    ? 'bg-[#e11d48] border-[#e11d48] text-white'
                    : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <span>{state.hardMode ? 'Hard Mode On' : 'Off'}</span>
              </button>
            </div>

            {state.hardMode && (
              <div className="pt-3 border-t border-zinc-800/80 text-xs text-[#fb7185] space-y-1">
                <div>
                  Active: Complete all {state.habits.length} daily habits before 12:00 AM every night to protect your Day {state.currentDay} streak.
                </div>
                <div className="text-sky-400 font-mono-tabular">
                  {state.streakFreezeTokens > 0
                    ? `${state.streakFreezeTokens} Streak Freeze ${
                        state.streakFreezeTokens === 1 ? 'token' : 'tokens'
                      } ready to auto-shield 1 missed day.`
                    : '0 Streak Freeze tokens held — earn tokens at major XP milestones.'}
                </div>
              </div>
            )}
          </section>

          <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">
              Audio &amp; Storage
            </h2>

            <div className="flex items-center justify-between gap-4 py-2">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-zinc-100">
                  Web Audio Chime Feedback
                </div>
                <div className="text-xs text-zinc-400">
                  Subtle chimes on habit checks, day advances, and Urge Breaker breathing
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleSound}
                aria-pressed={state.soundEnabled}
                className={`min-h-[44px] px-4 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                  state.soundEnabled
                    ? 'bg-[#f59e0b]/15 border-[#f59e0b]/40 text-[#f59e0b]'
                    : 'bg-[#09090b] border-zinc-800 text-zinc-400'
                }`}
              >
                {state.soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Muted</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-zinc-100">
                  Quick JSON Backup
                </div>
                <div className="text-xs text-zinc-400">
                  Download all 66-day progress, habits, and journal entries
                </div>
              </div>
              <button
                type="button"
                onClick={onExportBackup}
                className="min-h-[44px] px-4 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs font-semibold text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
              >
                <Download className="w-4 h-4 text-[#f59e0b]" />
                <span>Export</span>
              </button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-white">
                Complete Data Reset
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Clears local storage completely—including XP, heatmap history, habits, journal entries, and restarts the 10-question onboarding quiz.
              </p>
            </div>

            {!confirmWipe ? (
              <button
                type="button"
                onClick={() => setConfirmWipe(true)}
                className="min-h-[44px] px-4 rounded-xl border border-[#e11d48]/40 text-[#fb7185] hover:bg-[#e11d48]/10 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Erase All Local Data</span>
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-[#09090b] border border-[#e11d48]/40 space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-zinc-200">
                  <AlertTriangle className="w-4 h-4 text-[#e11d48] shrink-0 mt-0.5" />
                  <span>
                    This permanently deletes all browser data. Export a JSON backup first if you want a copy.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmWipe(false);
                      onFactoryReset();
                    }}
                    className="min-h-[44px] px-4 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-semibold"
                  >
                    Yes, Erase Everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmWipe(false)}
                    className="min-h-[44px] px-4 rounded-xl border border-zinc-800 text-zinc-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
