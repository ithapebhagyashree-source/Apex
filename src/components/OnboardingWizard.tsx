import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  ShieldAlert,
  Target,
  X,
} from 'lucide-react';
import {
  DEFAULT_ANSWERS,
  ONBOARDING_QUESTIONS,
  generateTailoredHabits,
} from '../data/onboardingQuestions';
import { Habit, OnboardingAnswers } from '../types';
import { PersonalizedAssessmentCard } from './PersonalizedAssessmentCard';

interface OnboardingWizardProps {
  initialAnswers: OnboardingAnswers;
  isRetake?: boolean;
  onComplete: (answers: OnboardingAnswers, generatedHabits: Habit[]) => void;
  onCancel?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialAnswers,
  isRetake = false,
  onComplete,
  onCancel,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    ...DEFAULT_ANSWERS,
    ...initialAnswers,
  });
  const [showReview, setShowReview] = useState(false);
  const [previewHabits, setPreviewHabits] = useState<Habit[]>([]);

  const totalSteps = ONBOARDING_QUESTIONS.length;
  const currentQuestion = ONBOARDING_QUESTIONS[stepIndex];
  const currentValue = answers[currentQuestion.id];

  const handleSelectOption = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      const cleanedAnswers: OnboardingAnswers = {
        ...answers,
        callsign: answers.callsign.trim() || 'Challenger',
      };
      setAnswers(cleanedAnswers);
      setPreviewHabits(generateTailoredHabits(cleanedAnswers));
      setShowReview(true);
    }
  };

  const handleBack = () => {
    if (showReview) {
      setShowReview(false);
      return;
    }
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  const handleSkipWithDefaults = () => {
    const defaultHabits = generateTailoredHabits(DEFAULT_ANSWERS);
    onComplete(DEFAULT_ANSWERS, defaultHabits);
  };

  const progressPct = showReview
    ? 100
    : Math.round(((stepIndex + 1) / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
      {/* Compact Header */}
      <header className="w-full max-w-3xl mx-auto px-5 pt-6 pb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#e11d48]/15 border border-[#e11d48]/30 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-[#e11d48]" />
          </div>
          <span className="font-display text-xl font-bold tracking-wide text-white whitespace-nowrap truncate">
            Life Reset: 66 Days
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!isRetake && !showReview && (
            <button
              type="button"
              onClick={handleSkipWithDefaults}
              className="min-h-[44px] px-3 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors whitespace-nowrap"
            >
              Use Default Protocol
            </button>
          )}
          {isRetake && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close setup"
              className="min-h-[44px] min-w-[44px] rounded-xl border border-zinc-800 bg-[#111113] flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Progress Track */}
      <div className="w-full max-w-3xl mx-auto px-5">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span>
            {showReview
              ? 'Protocol Generated · Ready to Lock In'
              : `Question ${currentQuestion.stepNumber} of ${totalSteps}`}
          </span>
          <span className="font-mono-tabular text-zinc-300">{progressPct}%</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e11d48] transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Body */}
      <main
        className={`flex-1 w-full mx-auto px-5 py-8 flex flex-col justify-between ${
          showReview ? 'max-w-5xl' : 'max-w-3xl'
        }`}
      >
        {!showReview ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
                {currentQuestion.title}
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
                {currentQuestion.subtitle}
              </p>
            </div>

            {currentQuestion.type === 'choice' && currentQuestion.options ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentQuestion.options.map((opt) => {
                  const selected = currentValue === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectOption(opt.value)}
                      className={`text-left p-4 rounded-xl border transition-all min-h-[64px] flex items-start justify-between gap-3 ${
                        selected
                          ? 'bg-[#e11d48]/10 border-[#e11d48] text-white'
                          : 'bg-[#111113] border-zinc-800/90 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900/80'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="text-sm sm:text-base font-semibold text-white">
                          {opt.label}
                        </div>
                        <div className="text-xs text-zinc-400 leading-snug">
                          {opt.detail}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          selected
                            ? 'bg-[#e11d48] border-[#e11d48] text-white'
                            : 'border-zinc-700'
                        }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#111113] border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-zinc-300">
                    Your Name or Callsign
                  </span>
                  <input
                    type="text"
                    value={answers.callsign}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, callsign: e.target.value }))
                    }
                    placeholder={currentQuestion.placeholder}
                    maxLength={32}
                    className="w-full min-h-[48px] px-4 rounded-xl bg-[#09090b] border border-zinc-800 text-base text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#e11d48] transition-colors"
                  />
                </label>

                <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-400">
                  <div>
                    <span className="text-zinc-500">Primary Target:</span>{' '}
                    <span className="text-zinc-200 font-medium">{answers.primaryGoal}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Schedule:</span>{' '}
                    <span className="text-zinc-200 font-medium font-mono-tabular">
                      {answers.wakeTime} – {answers.sleepTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Deep Work:</span>{' '}
                    <span className="text-zinc-200 font-medium">{answers.deepWorkHours}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Training:</span>{' '}
                    <span className="text-zinc-200 font-medium">{answers.fitnessTarget}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#f59e0b] font-medium">
                <Target className="w-4 h-4" />
                <span>10-Question Briefing Complete · Custom 66-Day Protocol</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
                {answers.callsign}, your 66-Day Assessment &amp; Non-Negotiables
              </h1>
              <p className="text-sm text-zinc-400">
                Review your personalized diagnostic and your 6 tailored daily habits (+30 XP each) before locking in Day 1.
              </p>
            </div>

            <PersonalizedAssessmentCard answers={answers} />

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold text-zinc-200">
                  Generated Daily Non-Negotiable Habits (6)
                </span>
                <span>Editable anytime in the Habits tab</span>
              </div>
              <div className="bg-[#111113] border border-zinc-800 rounded-2xl divide-y divide-zinc-800/80">
              {previewHabits.map((habit, idx) => (
                <div
                  key={habit.id}
                  className="p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span className="font-mono-tabular text-xs font-semibold text-zinc-500 pt-1 shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-sm sm:text-base font-semibold text-white">
                        {habit.title}
                      </div>
                      <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-1.5">
                        <span className="text-[#f59e0b]">{habit.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{habit.targetDetail}</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-mono-tabular text-xs font-semibold text-emerald-400 shrink-0 pt-0.5">
                    +{habit.xpValue} XP
                  </span>
                </div>
              ))}
              </div>
            </div>

            {isRetake && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-xs text-zinc-200">
                <ShieldAlert className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                <span>
                  Locking in this protocol updates your profile and replaces your active habit list with these 6 tailored habits. Your current Day count, XP, heatmap, and journal entries remain preserved.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Sticky-feel Footer Action Row */}
        <div className="pt-8 mt-6 border-t border-zinc-900 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={stepIndex === 0 && !showReview}
            className="min-h-[48px] px-4 rounded-xl border border-zinc-800 bg-[#111113] text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-700 disabled:opacity-35 disabled:pointer-events-none flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {!showReview ? (
            <button
              type="button"
              onClick={handleNext}
              className="min-h-[48px] px-6 rounded-xl bg-[#e11d48] hover:bg-[#be123c] active:scale-[0.98] text-sm font-semibold text-white flex items-center gap-2 transition-all whitespace-nowrap"
            >
              <span>
                {stepIndex === totalSteps - 1
                  ? 'View Assessment & Protocol'
                  : 'Continue'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onComplete(answers, previewHabits)}
              className="min-h-[48px] px-6 rounded-xl bg-[#e11d48] hover:bg-[#be123c] active:scale-[0.98] text-sm font-semibold text-white flex items-center gap-2 transition-all whitespace-nowrap"
            >
              <Check className="w-4 h-4" />
              <span>{isRetake ? 'Apply New Protocol' : 'Begin Day 1 of 66'}</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
