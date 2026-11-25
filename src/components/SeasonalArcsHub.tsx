import React, { useMemo, useState } from 'react';
import {
  Award,
  Check,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  FOUR_SEASON_IDS,
  SEASONAL_ARCS,
  SeasonalArcDefinition,
  getSeasonalArcById,
} from '../data/seasonalArcs';
import { AppState, SeasonalArcId } from '../types';
import { getLocalDateKey } from '../utils/storage';

interface SeasonalArcsHubProps {
  state: AppState;
  onToggleArcActive: (arcId: SeasonalArcId) => void;
  onLogArcDay: (arcId: SeasonalArcId) => void;
  onRestartArc: (arcId: SeasonalArcId) => void;
}

type HubFilter = 'all' | 'seasonal' | 'challenge' | 'active';

/* Lightweight custom inline SVG crest badges for each Seasonal Arc & Special Challenge */
const ArcBadgeSvg: React.FC<{
  arcId: SeasonalArcId;
  accentHex: string;
  completedSeasons?: Set<SeasonalArcId>;
}> = ({ arcId, accentHex, completedSeasons }) => (
  <svg
    viewBox="0 0 48 48"
    aria-hidden="true"
    className="w-11 h-11 shrink-0 select-none"
  >
    {/* Shared dark obsidian hexagonal crest backdrop */}
    <polygon
      points="24,3 42,13 42,35 24,45 6,35 6,13"
      fill="#09090b"
      stroke={accentHex}
      strokeWidth="1.8"
    />
    <polygon
      points="24,7 38,15 38,33 24,41 10,33 10,15"
      fill={accentHex}
      fillOpacity="0.12"
    />

    {arcId === 'winter-arc' && (
      <g stroke={accentHex} strokeWidth="2" strokeLinecap="round">
        <line x1="24" y1="12" x2="24" y2="36" />
        <line x1="13.5" y1="18" x2="34.5" y2="30" />
        <line x1="34.5" y1="18" x2="13.5" y2="30" />
        <polygon points="24,18 28,24 24,30 20,24" fill="#e0f2fe" stroke="none" />
      </g>
    )}

    {arcId === 'summer-arc' && (
      <g>
        <circle cx="24" cy="24" r="7" fill={accentHex} />
        <circle cx="24" cy="24" r="3.5" fill="#fef08a" />
        <g stroke={accentHex} strokeWidth="2" strokeLinecap="round">
          <line x1="24" y1="11" x2="24" y2="14" />
          <line x1="24" y1="34" x2="24" y2="37" />
          <line x1="11" y1="24" x2="14" y2="24" />
          <line x1="34" y1="24" x2="37" y2="24" />
          <line x1="15" y1="15" x2="17" y2="17" />
          <line x1="31" y1="31" x2="33" y2="33" />
          <line x1="33" y1="15" x2="31" y2="17" />
          <line x1="17" y1="31" x2="15" y2="33" />
        </g>
      </g>
    )}

    {arcId === 'monsoon-arc' && (
      <g>
        <path
          d="M15 24 C15 19 19 16 24 16 C29 16 33 19 33 24 Z"
          fill={accentHex}
          fillOpacity="0.85"
        />
        <polygon points="25,21 20,29 24.5,29 22.5,37 29.5,27 25,27" fill="#fef08a" />
        <line x1="17" y1="28" x2="15.5" y2="33" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="32" y1="28" x2="30.5" y2="33" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    )}

    {arcId === 'spring-arc' && (
      <g>
        <path
          d="M24 35 C24 25 24 17 24 14"
          stroke={accentHex}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M24 26 C15 24 13 17 16 14 C21 15 24 20 24 26 Z"
          fill="#34d399"
        />
        <path
          d="M24 24 C33 22 35 15 32 12 C27 13 24 18 24 24 Z"
          fill={accentHex}
        />
        <circle cx="24" cy="14" r="2.2" fill="#fef08a" />
      </g>
    )}

    {arcId === 'complete-year-circle' && (
      <g>
        {/* Four seasonal quadrants lighting up as mastered */}
        <path
          d="M24 11 A13 13 0 0 1 37 24"
          fill="none"
          stroke={completedSeasons?.has('winter-arc') ? '#38bdf8' : '#3f3f46'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M37 24 A13 13 0 0 1 24 37"
          fill="none"
          stroke={completedSeasons?.has('summer-arc') ? '#f59e0b' : '#3f3f46'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M24 37 A13 13 0 0 1 11 24"
          fill="none"
          stroke={completedSeasons?.has('monsoon-arc') ? '#818cf8' : '#3f3f46'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M11 24 A13 13 0 0 1 24 11"
          fill="none"
          stroke={completedSeasons?.has('spring-arc') ? '#10b981' : '#3f3f46'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <polygon points="24,17 28,24 24,31 20,24" fill="#fbbf24" />
      </g>
    )}

    {arcId === 'monk-mode-30' && (
      <g>
        <path
          d="M24 12 C29 18 31 24 24 32 C17 24 19 18 24 12 Z"
          fill={accentHex}
        />
        <path
          d="M24 18 C27 22 27 26 24 30 C21 26 21 22 24 18 Z"
          fill="#fef08a"
        />
        <path
          d="M14 33 Q24 38 34 33"
          fill="none"
          stroke="#fb7185"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    )}

    {arcId === '75-hard-discipline' && (
      <g fill="none" stroke={accentHex} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15,21 24,13 33,21" />
        <polyline points="15,29 24,21 33,29" />
        <line x1="17" y1="35" x2="31" y2="35" stroke="#fef08a" strokeWidth="2" />
      </g>
    )}

    {arcId === 'zero-distraction-sprint' && (
      <g>
        <polygon points="26,11 16,25 23,25 21,37 32,22 25,22" fill={accentHex} />
        <line x1="14" y1="34" x2="34" y2="14" stroke="#fef08a" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    )}
  </svg>
);

export const SeasonalArcsHub: React.FC<SeasonalArcsHubProps> = ({
  state,
  onToggleArcActive,
  onLogArcDay,
  onRestartArc,
}) => {
  const [filter, setFilter] = useState<HubFilter>('all');
  const todayKey = getLocalDateKey();

  const arcProgressMap = state.arcProgress ?? {};
  const completedSet = useMemo(
    () => new Set<SeasonalArcId>(state.completedArcIds ?? []),
    [state.completedArcIds]
  );

  const seasonsMasteredCount = useMemo(
    () => FOUR_SEASON_IDS.filter((id) => completedSet.has(id)).length,
    [completedSet]
  );

  const yearCircleDef = getSeasonalArcById('complete-year-circle');
  const yearCirclePct = Math.round((seasonsMasteredCount / 4) * 100);
  const yearCircleComplete = completedSet.has('complete-year-circle');

  const playableArcs = useMemo(
    () => SEASONAL_ARCS.filter((a) => a.category !== 'master'),
    []
  );

  const activeCount = useMemo(
    () =>
      playableArcs.filter((a) => Boolean(arcProgressMap[a.id]?.active)).length,
    [playableArcs, arcProgressMap]
  );

  const visibleArcs = useMemo(() => {
    return playableArcs.filter((arc) => {
      if (filter === 'all') return true;
      if (filter === 'seasonal') return arc.category === 'seasonal';
      if (filter === 'challenge') return arc.category === 'challenge';
      return Boolean(arcProgressMap[arc.id]?.active);
    });
  }, [playableArcs, filter, arcProgressMap]);

  return (
    <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-zinc-400 font-mono-tabular">
            Themed Transformation Arcs · {activeCount} Active ·{' '}
            {completedSet.size}/{SEASONAL_ARCS.length} Mastered
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Seasonal Arcs &amp; Special Challenges
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Activate one or more themed arcs to stack bonus XP alongside your 66-day reset. Active arcs also auto-advance when you conquer a full day on Progress.
          </p>
        </div>

        <div
          role="group"
          aria-label="Filter seasonal arcs and challenges"
          className="flex items-center p-1 rounded-xl bg-[#09090b] border border-zinc-800 self-start lg:self-auto overflow-x-auto max-w-full"
        >
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'seasonal', label: 'Seasonal' },
              { id: 'challenge', label: 'Challenges' },
              { id: 'active', label: `Active (${activeCount})` },
            ] as const
          ).map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                aria-pressed={active}
                className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#e11d48] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Master Meta-Arc: Complete Year Circle */}
      <div
        className={`rounded-2xl border p-5 space-y-4 transition-colors ${
          yearCircleComplete
            ? 'bg-amber-500/10 border-amber-400/55'
            : 'bg-[#09090b] border-zinc-800/90'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <ArcBadgeSvg
              arcId="complete-year-circle"
              accentHex={yearCircleDef.accentHex}
              completedSeasons={completedSet}
            />
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular">
                <span className="text-[#fbbf24] font-semibold">
                  Master Meta-Arc
                </span>
                <span aria-hidden="true" className="text-zinc-600">
                  ·
                </span>
                <span className="text-zinc-300 font-semibold">
                  +{yearCircleDef.bonusXP.toLocaleString()} Bonus XP
                </span>
                {yearCircleComplete && (
                  <>
                    <span aria-hidden="true" className="text-zinc-600">
                      ·
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      Circle Mastered
                    </span>
                  </>
                )}
              </div>
              <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                {yearCircleDef.name}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {yearCircleDef.description}
              </p>
            </div>
          </div>

          {/* 4-Season Status Strip */}
          <div className="grid grid-cols-4 gap-2 shrink-0">
            {FOUR_SEASON_IDS.map((seasonId) => {
              const sDef = getSeasonalArcById(seasonId);
              const done = completedSet.has(seasonId);
              const running = Boolean(arcProgressMap[seasonId]?.active);
              return (
                <div
                  key={seasonId}
                  className={`px-2.5 py-2 rounded-xl border text-center min-w-[68px] ${
                    done
                      ? `${sDef.accentBgClass} ${sDef.accentBorderClass}`
                      : running
                      ? 'bg-[#111113] border-zinc-600'
                      : 'bg-[#111113]/60 border-zinc-800/80'
                  }`}
                >
                  <div
                    className={`text-[11px] font-semibold truncate ${
                      done ? sDef.accentTextClass : 'text-zinc-300'
                    }`}
                  >
                    {sDef.name.replace(' Arc', '')}
                  </div>
                  <div className="text-[10px] font-mono-tabular text-zinc-500 mt-0.5">
                    {done ? 'Done' : running ? 'Active' : 'Locked'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono-tabular">
            <span className="text-zinc-400">Four-Season Mastery Progress</span>
            <span className="text-[#fbbf24] font-semibold">
              {seasonsMasteredCount}/4 Seasons ({yearCirclePct}%)
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${yearCirclePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Arcs & Special Challenges Grid */}
      {visibleArcs.length === 0 ? (
        <div className="py-8 text-center space-y-2 border border-zinc-800/80 rounded-2xl bg-[#09090b]">
          <p className="text-sm text-zinc-300 font-medium">
            No active arcs yet.
          </p>
          <p className="text-xs text-zinc-500">
            Switch to &ldquo;All&rdquo; and activate a seasonal arc or special challenge to start earning bonus XP.
          </p>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className="mt-2 min-h-[40px] px-4 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs font-semibold text-white transition-colors"
          >
            Browse All Arcs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleArcs.map((arc: SeasonalArcDefinition) => {
            const record = arcProgressMap[arc.id];
            const isActive = Boolean(record?.active);
            const completedDays = record?.completedDays ?? 0;
            const isRunComplete = completedDays >= arc.durationDays;
            const isEverMastered = completedSet.has(arc.id);
            const loggedToday = record?.lastLoggedDate === todayKey;
            const pct = Math.min(
              100,
              Math.round((completedDays / arc.durationDays) * 100)
            );

            return (
              <article
                key={arc.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-colors ${
                  isActive
                    ? `bg-[#0d0d10] ${arc.accentBorderClass}`
                    : 'bg-[#09090b] border-zinc-800/90 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Identity Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <ArcBadgeSvg arcId={arc.id} accentHex={arc.accentHex} />
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-[11px] font-mono-tabular text-zinc-400">
                          {arc.category === 'seasonal'
                            ? 'Seasonal Arc'
                            : 'Special Challenge'}{' '}
                          · {arc.durationDays}d
                        </div>
                        <h3 className="font-display text-2xl font-bold text-white leading-tight truncate">
                          {arc.name}
                        </h3>
                        <div className={`text-xs font-medium ${arc.accentTextClass}`}>
                          {arc.subtitle}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description & Pillars */}
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {arc.description}
                  </p>

                  <div className="text-[11px] text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                    {arc.pillars.map((pillar, idx) => (
                      <React.Fragment key={pillar}>
                        {idx > 0 && (
                          <span aria-hidden="true" className="text-zinc-600">
                            ·
                          </span>
                        )}
                        <span>{pillar}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Progress Bar, Reward & Controls */}
                <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono-tabular">
                      <span className="text-zinc-300 font-semibold">
                        {completedDays}/{arc.durationDays} Days ({pct}%)
                      </span>
                      <span className="text-[#f59e0b] font-semibold">
                        +{arc.bonusXP.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: arc.accentHex,
                        }}
                      />
                    </div>
                  </div>

                  {/* Interactive State Buttons */}
                  {isRunComplete ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <Award className="w-4 h-4 shrink-0" />
                        <span>Mastered · Bonus Claimed</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRestartArc(arc.id)}
                        className="min-h-[40px] px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Run Again</span>
                      </button>
                    </div>
                  ) : isActive ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={loggedToday}
                        onClick={() => onLogArcDay(arc.id)}
                        className={`flex-1 min-h-[44px] px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                          loggedToday
                            ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 cursor-default'
                            : 'bg-[#e11d48] hover:bg-[#be123c] text-white'
                        }`}
                      >
                        {loggedToday ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Logged Today</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Log Day {completedDays + 1}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleArcActive(arc.id)}
                        aria-label={`Pause ${arc.name}`}
                        className="min-h-[44px] px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleArcActive(arc.id)}
                        className="w-full min-h-[44px] px-4 rounded-xl bg-[#111113] border border-zinc-700 hover:border-zinc-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                      >
                        <Play className="w-3.5 h-3.5" style={{ color: arc.accentHex }} />
                        <span>
                          {completedDays > 0
                            ? `Resume Arc (Day ${completedDays}/${arc.durationDays})`
                            : isEverMastered
                            ? 'Activate New Run'
                            : 'Activate Arc'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
