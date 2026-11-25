import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { AppState } from '../types';
import { DailyXPPoint, getLast7DaysXPTrend } from '../utils/storage';

interface XpSparklineCardProps {
  state: AppState;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DailyXPPoint; value: number }>;
}

const SparklineTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-[#09090b] border border-zinc-700/90 rounded-lg px-3 py-2 shadow-xl">
      <div className="text-[11px] text-zinc-400">
        {point.isToday ? `Today · ${point.fullLabel}` : point.fullLabel}
      </div>
      <div className="font-mono-tabular text-sm font-bold text-[#f59e0b] mt-0.5">
        +{point.xp.toLocaleString()} XP
      </div>
    </div>
  );
};

export const XpSparklineCard: React.FC<XpSparklineCardProps> = ({ state }) => {
  const data = useMemo(() => getLast7DaysXPTrend(state), [state]);

  const weekTotal = useMemo(
    () => data.reduce((sum, pt) => sum + pt.xp, 0),
    [data]
  );
  const dailyAvg = Math.round(weekTotal / 7);
  const todayXP = data[data.length - 1]?.xp ?? 0;
  const maxXP = Math.max(120, ...data.map((pt) => pt.xp));

  return (
    <section
      aria-label="Daily XP earned over the last 7 days"
      className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <TrendingUp className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Last 7 Days XP Trend</span>
          </div>
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="font-mono-tabular text-2xl font-bold text-white">
              +{weekTotal.toLocaleString()} XP
            </span>
            <span className="text-xs text-zinc-400 font-mono-tabular">
              Avg {dailyAvg}/day · Today +{todayXP}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Mini Sparkline */}
      <div className="w-full h-28">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="xpSparklineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.32} />
                <stop offset="65%" stopColor="#e11d48" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#09090b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="xpSparklineStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="shortDay"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{ fill: '#71717a', fontSize: 11 }}
              dy={6}
            />
            <YAxis hide domain={[0, Math.ceil(maxXP * 1.15)]} />
            <Tooltip
              content={<SparklineTooltip />}
              cursor={{
                stroke: '#3f3f46',
                strokeWidth: 1,
                strokeDasharray: '3 3',
              }}
            />
            <Area
              type="monotone"
              dataKey="xp"
              stroke="url(#xpSparklineStroke)"
              strokeWidth={2.25}
              fill="url(#xpSparklineFill)"
              isAnimationActive={false}
              dot={{
                r: 3,
                fill: '#111113',
                stroke: '#f59e0b',
                strokeWidth: 1.75,
              }}
              activeDot={{
                r: 5,
                fill: '#f59e0b',
                stroke: '#09090b',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
