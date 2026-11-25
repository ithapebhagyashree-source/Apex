import React, { useMemo } from 'react';
import { AlertTriangle, Compass, Flame, ShieldCheck } from 'lucide-react';
import { generatePersonalizedAssessment } from '../data/onboardingQuestions';
import { OnboardingAnswers } from '../types';

interface PersonalizedAssessmentCardProps {
  answers: OnboardingAnswers;
  compact?: boolean;
}

export const PersonalizedAssessmentCard: React.FC<
  PersonalizedAssessmentCardProps
> = ({ answers, compact = false }) => {
  const assessment = useMemo(
    () => generatePersonalizedAssessment(answers),
    [answers]
  );

  return (
    <section
      aria-label="Personalized 66-Day Discipline Assessment"
      className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-5"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Compass className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>
              Personalized Assessment · {answers.callsign || 'Challenger'}
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Profile: {assessment.archetype}
          </h2>
        </div>

        {/* Projected 66-Day Quantitative Strip */}
        <div className="flex items-center gap-5 text-xs font-mono-tabular shrink-0">
          <div>
            <div className="text-zinc-500">66-Day Focus</div>
            <div className="text-sm font-bold text-white">
              {assessment.projectedDay66.deepWorkTotalHours}
            </div>
          </div>
          <div>
            <div className="text-zinc-500">Training</div>
            <div className="text-sm font-bold text-emerald-400">
              {assessment.projectedDay66.trainingSessions}
            </div>
          </div>
          <div>
            <div className="text-zinc-500">Day 66 Rank</div>
            <div className="text-sm font-bold text-[#f59e0b]">
              {assessment.projectedDay66.projectedRank}
            </div>
          </div>
        </div>
      </div>

      {/* 3-Part Diagnostic Grid: #1 Strength, #1 Blind Spot, Projected Day 66 Transformation */}
      <div
        className={`grid grid-cols-1 ${
          compact ? 'lg:grid-cols-3' : 'md:grid-cols-3'
        } gap-4`}
      >
        {/* #1 Strength */}
        <div className="rounded-xl bg-[#09090b] border border-zinc-800/90 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>#1 Strength</span>
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
            {assessment.topStrength.title}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {assessment.topStrength.detail}
          </p>
        </div>

        {/* #1 Blind Spot */}
        <div className="rounded-xl bg-[#09090b] border border-zinc-800/90 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#fb7185]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#e11d48]" />
            <span>#1 Blind Spot</span>
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
            {assessment.topBlindSpot.title}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {assessment.topBlindSpot.detail}
          </p>
          <p className="text-xs text-zinc-300 pt-2 border-t border-zinc-800/80 leading-relaxed">
            <span className="font-semibold text-zinc-200">Fix:</span>{' '}
            {assessment.topBlindSpot.countermeasure}
          </p>
        </div>

        {/* Projected Day 66 Transformation */}
        <div className="rounded-xl bg-[#09090b] border border-zinc-800/90 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#f59e0b]">
            <Flame className="w-4 h-4 shrink-0" />
            <span>Projected Day 66</span>
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
            {assessment.projectedDay66.headline}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {assessment.projectedDay66.summary}
          </p>
        </div>
      </div>
    </section>
  );
};
