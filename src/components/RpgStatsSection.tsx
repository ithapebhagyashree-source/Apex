import React, { useMemo } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Shield } from 'lucide-react';
import { AppState } from '../types';
import {
  ComputedRpgStat,
  RPG_XP_PER_LEVEL,
  getComputedRpgStats,
} from '../utils/storage';

interface RpgStatsSectionProps {
  state: AppState;
}

interface RadarTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ComputedRpgStat }>;
}

const RpgRadarTooltip: React.FC<RadarTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const stat = payload[0].payload;
  return (
    <div className="bg-[#09090b] border border-zinc-700/90 rounded-lg px-3 py-2 shadow-xl">
      <div className="text-xs font-semibold text-white">
        {stat.label} · Lv. {stat.level}
      </div>
      <div className="font-mono-tabular text-xs text-[#f59e0b] mt-0.5">
        {stat.xp.toLocaleString()} Stat XP ({stat.xpForNextLevel} to Lv.{' '}
        {stat.level + 1})
      </div>
    </div>
  );
};

export const RpgStatsSection: React.FC<RpgStatsSectionProps> = ({ state }) => {
  const stats = useMemo(() => getComputedRpgStats(state), [state]);

  const totalLevels = useMemo(
    () => stats.reduce((sum, s) => sum + s.level, 0),
    [stats]
  );

  const strongestStat = useMemo(() => {
    return stats.reduce((best, cur) => (cur.xp > best.xp ? cur : best), stats[0]);
  }, [stats]);

  return (
    <section
      aria-label="6-Stat RPG Discipline Radar and Attribute Progress"
      className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Shield className="w-3.5 h-3.5 text-[#e11d48]" />
            <span>Auto-levels from daily habit categories</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            6-Stat RPG Attributes
          </h2>
        </div>

        <div className="flex items-center gap-5 text-xs font-mono-tabular shrink-0">
          <div>
            <div className="text-zinc-500">Combined Level</div>
            <div className="text-sm font-bold text-white">Lv. {totalLevels}</div>
          </div>
          <div>
            <div className="text-zinc-500">Lead Attribute</div>
            <div className="text-sm font-bold text-[#f59e0b]">
              {strongestStat.xp > 0 ? strongestStat.label : 'Balanced'}
            </div>
          </div>
        </div>
      </div>

      {/* Radar + 6 Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Recharts 6-Axis Radar */}
        <div className="lg:col-span-5 h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={stats}>
              <PolarGrid stroke="#27272a" />
              <PolarAngleAxis
                dataKey="label"
                tick={{ fill: '#d4d4d8', fontSize: 12, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Tooltip content={<RpgRadarTooltip />} />
              <Radar
                name="Attribute"
                dataKey="radarScore"
                stroke="#e11d48"
                strokeWidth={2}
                fill="#e11d48"
                fillOpacity={0.26}
                isAnimationActive={false}
                dot={{
                  r: 3.5,
                  fill: '#f59e0b',
                  stroke: '#09090b',
                  strokeWidth: 1.5,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Right: 6 Attribute Level Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className="rounded-xl bg-[#09090b] border border-zinc-800/90 p-3.5 space-y-2"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-white">
                  {stat.label}
                </span>
                <span className="font-mono-tabular text-xs font-bold text-[#f59e0b]">
                  Lv. {stat.level}
                </span>
              </div>

              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#e11d48] to-[#f59e0b] transition-all duration-300"
                  style={{ width: `${Math.max(4, stat.progressPct)}%` }}
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                <span className="truncate">{stat.fedBy}</span>
                <span className="font-mono-tabular text-zinc-400 shrink-0">
                  {stat.xpInLevel}/{RPG_XP_PER_LEVEL} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
