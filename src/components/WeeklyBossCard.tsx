import React, { useEffect, useState } from 'react';
import { CheckCircle2, Flame, Skull, Swords, Trophy } from 'lucide-react';
import {
  ADVANCE_DAY_BOSS_DAMAGE,
  HABIT_BOSS_DAMAGE,
  URGE_BREAKER_BOSS_DAMAGE,
  WEEKLY_BOSSES,
  getBossForWeek,
} from '../data/weeklyBosses';
import { AppState } from '../types';
import { getWeeklyPhaseInfo } from '../utils/storage';

interface WeeklyBossCardProps {
  state: AppState;
}

export const WeeklyBossCard: React.FC<WeeklyBossCardProps> = ({ state }) => {
  const weeklyPhase = getWeeklyPhaseInfo(state.currentDay);
  const activeWeek = weeklyPhase.week;
  const [inspectWeek, setInspectWeek] = useState<number>(activeWeek);

  useEffect(() => {
    setInspectWeek(activeWeek);
  }, [activeWeek]);

  const boss = getBossForWeek(inspectWeek);
  const damageDealt = Math.max(0, state.bossDamageByWeek?.[boss.week] ?? 0);
  const isDefeated =
    state.defeatedBossWeeks.includes(boss.week) || damageDealt >= boss.maxHp;
  const remainingHp = isDefeated ? 0 : Math.max(0, boss.maxHp - damageDealt);
  const hpPercent = Math.round((remainingHp / boss.maxHp) * 100);
  const isCurrentFight = boss.week === activeWeek;
  const isFutureBoss = boss.week > activeWeek;

  return (
    <section
      aria-label="Weekly Milestone Boss Fight"
      className={`bg-[#111113] border rounded-2xl p-5 sm:p-6 space-y-5 transition-colors ${
        isDefeated
          ? 'border-emerald-500/40'
          : isCurrentFight
          ? 'border-[#e11d48]/40'
          : 'border-zinc-800/90'
      }`}
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
              isDefeated
                ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                : isFutureBoss
                ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
                : 'bg-[#e11d48]/15 border-[#e11d48]/40 text-[#e11d48]'
            }`}
          >
            {isDefeated ? (
              <Trophy className="w-6 h-6" />
            ) : (
              <Skull className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`font-semibold font-mono-tabular ${
                  isDefeated
                    ? 'text-emerald-400'
                    : isCurrentFight
                    ? 'text-[#fb7185]'
                    : 'text-zinc-500'
                }`}
              >
                Week {boss.week} Boss ·{' '}
                {isDefeated
                  ? 'Defeated'
                  : isCurrentFight
                  ? 'Active Encounter'
                  : 'Upcoming'}
              </span>
              <span className="text-zinc-600" aria-hidden="true">
                ·
              </span>
              <span className="text-[#f59e0b] font-mono-tabular font-semibold">
                Bounty +{boss.bountyXP} XP
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {boss.name}
            </h2>
            <p className="text-xs text-zinc-400">
              {boss.title} — “{boss.taunt}”
            </p>
          </div>
        </div>

        {/* Slain Counter */}
        <div className="flex items-center gap-4 text-xs font-mono-tabular shrink-0 sm:text-right">
          <div>
            <div className="text-zinc-500">Bosses Slain</div>
            <div className="text-base font-bold text-white">
              {state.defeatedBossWeeks.length}/{WEEKLY_BOSSES.length}
            </div>
          </div>
          <div>
            <div className="text-zinc-500">Damage Dealt</div>
            <div className="text-base font-bold text-[#f59e0b]">
              {Math.min(damageDealt, boss.maxHp)} DMG
            </div>
          </div>
        </div>
      </div>

      {/* Boss HP Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono-tabular">
          <span className="text-zinc-400 flex items-center gap-1.5">
            {isDefeated ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">
                  Boss Eliminated · Bounty Claimed
                </span>
              </>
            ) : (
              <>
                <Swords className="w-3.5 h-3.5 text-[#e11d48]" />
                <span>Boss Vitality</span>
              </>
            )}
          </span>
          <span className="font-bold text-white">
            {remainingHp} / {boss.maxHp} HP ({hpPercent}%)
          </span>
        </div>

        <div className="h-3.5 w-full bg-[#09090b] border border-zinc-800 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isDefeated
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-[#e11d48] to-[#f59e0b]'
            }`}
            style={{ width: `${isDefeated ? 100 : hpPercent}%` }}
          />
        </div>

        {/* Damage Rules Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-400 font-mono-tabular">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>
              Check Habit: {HABIT_BOSS_DAMAGE} DMG · Urge Lock:{' '}
              {URGE_BREAKER_BOSS_DAMAGE} DMG · Day Clear:{' '}
              {ADVANCE_DAY_BOSS_DAMAGE} DMG
            </span>
          </span>
          {!isCurrentFight && (
            <button
              type="button"
              onClick={() => setInspectWeek(activeWeek)}
              className="text-xs font-sans font-medium text-[#fb7185] hover:text-white transition-colors"
            >
              Return to Week {activeWeek} Boss
            </button>
          )}
        </div>
      </div>

      {/* 10-Week Milestone Boss Selector Trail */}
      <div className="pt-3 border-t border-zinc-800/80">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {WEEKLY_BOSSES.map((b) => {
            const slain = state.defeatedBossWeeks.includes(b.week);
            const current = b.week === activeWeek;
            const selected = b.week === inspectWeek;

            let classes =
              'bg-[#09090b] border-zinc-800/90 text-zinc-500 hover:border-zinc-700';
            if (slain) {
              classes =
                'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold';
            } else if (current) {
              classes =
                'bg-[#e11d48]/15 border-[#e11d48]/50 text-[#fb7185] font-semibold';
            }

            return (
              <button
                key={b.week}
                type="button"
                onClick={() => setInspectWeek(b.week)}
                aria-label={`Inspect Week ${b.week} boss: ${b.name}`}
                className={`min-h-[38px] rounded-lg border font-mono-tabular text-[11px] flex items-center justify-center transition-all ${classes} ${
                  selected ? 'ring-1 ring-white' : ''
                }`}
              >
                W{b.week}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
