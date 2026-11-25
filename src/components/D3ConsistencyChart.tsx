import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  ConsistencySlice,
  DayConsistencyStatus,
  MonthlyDayCell,
} from '../utils/performanceReview';
import { TOTAL_RESET_DAYS } from '../utils/storage';

interface D3ConsistencyChartProps {
  slices: ConsistencySlice[];
  consistencyRatePct: number;
  completionPct: number;
  totalProtectedDays: number;
  monthLabel: string;
  firstWeekday: number;
  cells: MonthlyDayCell[];
}

const STATUS_META: Record<
  DayConsistencyStatus,
  { label: string; fill: string; stroke: string; textClass: string }
> = {
  cleared: {
    label: 'Day Cleared',
    fill: '#10b981',
    stroke: '#34d399',
    textClass: 'text-emerald-400',
  },
  frozen: {
    label: 'Freeze Protected',
    fill: '#38bdf8',
    stroke: '#7dd3fc',
    textClass: 'text-sky-400',
  },
  partial: {
    label: 'Partial Progress',
    fill: '#f59e0b',
    stroke: '#fbbf24',
    textClass: 'text-[#f59e0b]',
  },
  relapse: {
    label: 'Reset / Slip',
    fill: '#e11d48',
    stroke: '#fb7185',
    textClass: 'text-[#fb7185]',
  },
  unlogged: {
    label: 'No Activity Logged',
    fill: '#18181b',
    stroke: '#27272a',
    textClass: 'text-zinc-500',
  },
};

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const D3ConsistencyChart: React.FC<D3ConsistencyChartProps> = ({
  slices,
  consistencyRatePct,
  completionPct,
  totalProtectedDays,
  monthLabel,
  firstWeekday,
  cells,
}) => {
  const donutSvgRef = useRef<SVGSVGElement | null>(null);
  const calendarWrapRef = useRef<HTMLDivElement | null>(null);
  const calendarSvgRef = useRef<SVGSVGElement | null>(null);

  const [calWidth, setCalWidth] = useState(340);
  const [hoveredSlice, setHoveredSlice] = useState<ConsistencySlice | null>(
    null
  );
  const [activeCell, setActiveCell] = useState<MonthlyDayCell | null>(null);
  const [chartError, setChartError] = useState(false);

  const safeSlices = Array.isArray(slices) ? slices : [];
  const safeCells = Array.isArray(cells) ? cells : [];
  const safeFirstWeekday =
    Number.isFinite(firstWeekday) && firstWeekday >= 0 && firstWeekday <= 6
      ? firstWeekday
      : 0;
  const safeConsistencyRate = Number.isFinite(consistencyRatePct)
    ? Math.max(0, Math.min(100, consistencyRatePct))
    : 0;

  // Measure calendar container responsively
  useEffect(() => {
    const el = calendarWrapRef.current;
    if (!el) return;
    const update = () => {
      const nextW = Math.max(240, Math.floor(el.getBoundingClientRect().width));
      setCalWidth(nextW);
    };
    update();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // D3 Radial Consistency Donut (Outer: 66-Day Progress, Inner: Clean Consistency Arc)
  useEffect(() => {
    const svgEl = donutSvgRef.current;
    if (!svgEl) return;

    try {
      const size = 216;
      const cx = size / 2;
      const cy = size / 2;
      const outerR = 92;
      const innerR = 72;

      const svg = d3.select(svgEl);
      svg.selectAll('*').remove();
      svg.attr('viewBox', `0 0 ${size} ${size}`);

      const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

      // Outer 66-Day pie segments
      const pie = d3
        .pie<ConsistencySlice>()
        .value((d) => Math.max(0, Number(d.value) || 0))
        .sort(null)
        .padAngle(0.028);

      const arc = d3
        .arc<d3.PieArcDatum<ConsistencySlice>>()
        .innerRadius(innerR)
        .outerRadius(outerR)
        .cornerRadius(5);

      const arcHover = d3
        .arc<d3.PieArcDatum<ConsistencySlice>>()
        .innerRadius(innerR - 1)
        .outerRadius(outerR + 4)
        .cornerRadius(6);

      const nonZeroSlices = safeSlices.filter((s) => (Number(s.value) || 0) > 0);
      const dataToDraw =
        nonZeroSlices.length > 0
          ? nonZeroSlices
          : [
              {
                id: 'remaining' as const,
                label: 'Remaining in 66d',
                value: TOTAL_RESET_DAYS,
                pct: 100,
                color: '#27272a',
              },
            ];

      g.selectAll('path.outer-slice')
        .data(pie(dataToDraw))
        .enter()
        .append('path')
        .attr('class', 'outer-slice')
        .attr('fill', (d) => d.data.color)
        .attr('d', (d) => arc(d) ?? '')
        .style('cursor', 'pointer')
        .style('transition', 'opacity 200ms ease')
        .on('mouseenter', function (_, d) {
          d3.select(this).attr('d', arcHover(d) ?? '').attr('opacity', 1);
          setHoveredSlice(d.data);
        })
        .on('mouseleave', function (_, d) {
          d3.select(this).attr('d', arc(d) ?? '').attr('opacity', 0.96);
          setHoveredSlice(null);
        })
        .on('click', (_, d) => {
          setHoveredSlice((prev) => (prev?.id === d.data.id ? null : d.data));
        });

      // Inner Consistency Ring track + active arc
      const innerTrackR = 59;
      const innerRingBg = d3
        .arc<unknown>()
        .innerRadius(innerTrackR - 6)
        .outerRadius(innerTrackR)
        .startAngle(0)
        .endAngle(2 * Math.PI);

      g.append('path')
        .attr('d', innerRingBg({}) ?? '')
        .attr('fill', '#18181b');

      if (safeConsistencyRate > 0) {
        const innerRingActive = d3
          .arc<unknown>()
          .innerRadius(innerTrackR - 6)
          .outerRadius(innerTrackR)
          .startAngle(0)
          .endAngle((safeConsistencyRate / 100) * 2 * Math.PI)
          .cornerRadius(3);

        g.append('path')
          .attr('d', innerRingActive({}) ?? '')
          .attr('fill', '#f59e0b');
      }

      setChartError(false);
    } catch (err) {
      console.error('[D3ConsistencyChart] Donut render failed:', err);
      setChartError(true);
    }
  }, [safeSlices, safeConsistencyRate]);

  // D3 Monthly Calendar Heatmap Matrix
  useEffect(() => {
    const svgEl = calendarSvgRef.current;
    if (!svgEl) return;

    try {
      const svg = d3.select(svgEl);
      svg.selectAll('*').remove();

      if (safeCells.length === 0) {
        svg.attr('viewBox', `0 0 ${calWidth} 64`).attr('height', 64);
        return;
      }

      const totalSlots = safeFirstWeekday + safeCells.length;
      const numRows = Math.max(1, Math.ceil(totalSlots / 7));
      const headerH = 22;
      const padX = 2;
      const gap = 6;
      const cellW = Math.max(24, Math.floor((calWidth - padX * 2 - gap * 6) / 7));
      const cellH = Math.max(30, Math.min(40, cellW));
      const totalH = headerH + numRows * cellH + (numRows - 1) * gap + 4;

      svg.attr('viewBox', `0 0 ${calWidth} ${totalH}`).attr('height', totalH);

      const xScale = d3
        .scaleBand<number>()
        .domain([0, 1, 2, 3, 4, 5, 6])
        .range([padX, calWidth - padX])
        .paddingInner(0.14);

      // Weekday headers
      svg
        .selectAll('text.wd-head')
        .data(WEEKDAY_HEADERS)
        .enter()
        .append('text')
        .attr('class', 'wd-head')
        .attr('x', (_, i) => (xScale(i) ?? 0) + xScale.bandwidth() / 2)
        .attr('y', 13)
        .attr('text-anchor', 'middle')
        .attr('fill', '#71717a')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .text((d) => d);

      const cellGroups = svg
        .selectAll('g.day-cell')
        .data(safeCells)
        .enter()
        .append('g')
        .attr('class', 'day-cell')
        .attr('transform', (d) => {
          const slot = safeFirstWeekday + (d.dayOfMonth - 1);
          const col = slot % 7;
          const row = Math.floor(slot / 7);
          const x = xScale(col) ?? 0;
          const y = headerH + row * (cellH + gap);
          return `translate(${x},${y})`;
        })
        .style('cursor', 'pointer')
        .on('mouseenter', (_, d) => setActiveCell(d))
        .on('click', (_, d) => setActiveCell(d));

      const bw = Math.max(16, xScale.bandwidth());

      cellGroups
        .append('rect')
        .attr('width', bw)
        .attr('height', cellH)
        .attr('rx', 7)
        .attr('fill', (d) => {
          const meta = STATUS_META[d.status] ?? STATUS_META.unlogged;
          if (d.isFuture && d.status === 'unlogged') return '#111113';
          return meta.fill;
        })
        .attr('fill-opacity', (d) =>
          d.status === 'unlogged' ? 0.9 : d.status === 'partial' ? 0.35 : 0.25
        )
        .attr('stroke', (d) => {
          const meta = STATUS_META[d.status] ?? STATUS_META.unlogged;
          return d.isToday
            ? '#f59e0b'
            : d.isFuture && d.status === 'unlogged'
            ? '#1f1f23'
            : meta.stroke;
        })
        .attr('stroke-width', (d) => (d.isToday ? 1.8 : 1));

      // Day number label
      cellGroups
        .append('text')
        .attr('x', bw / 2)
        .attr('y', cellH / 2 + 4)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '11px')
        .attr('font-weight', (d) => (d.isToday || d.status !== 'unlogged' ? '700' : '500'))
        .attr('fill', (d) => {
          if (d.status === 'cleared') return '#6ee7b7';
          if (d.status === 'frozen') return '#7dd3fc';
          if (d.status === 'partial') return '#fde68a';
          if (d.status === 'relapse') return '#fda4af';
          return d.isFuture ? '#3f3f46' : '#71717a';
        })
        .text((d) => d.dayOfMonth);
    } catch (err) {
      console.error('[D3ConsistencyChart] Calendar render failed:', err);
      setChartError(true);
    }
  }, [safeCells, safeFirstWeekday, calWidth]);

  const highlightedCell =
    activeCell ??
    safeCells.find((c) => c.isToday) ??
    safeCells[safeCells.length - 1] ??
    null;

  if (chartError) {
    return (
      <div className="rounded-xl bg-[#09090b] border border-zinc-800/90 p-5 text-xs text-zinc-400">
        Consistency visualization is temporarily unavailable. Overall progress:{' '}
        <span className="text-white font-semibold font-mono-tabular">
          {safeConsistencyRate}% ({totalProtectedDays}/{TOTAL_RESET_DAYS} days)
        </span>
        .
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* Left: D3 Radial Donut */}
      <div className="lg:col-span-5 flex flex-col items-center space-y-4">
        <div className="relative w-52 h-52 sm:w-56 sm:h-56 flex items-center justify-center">
          <svg
            ref={donutSvgRef}
            role="img"
            aria-label={`Overall 66-day consistency ${safeConsistencyRate} percent, ${totalProtectedDays} of 66 days completed`}
            className="w-full h-full overflow-visible"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
            {hoveredSlice ? (
              <>
                <span className="text-[11px] font-medium text-zinc-400">
                  {hoveredSlice.label}
                </span>
                <span className="font-display text-3xl font-bold text-white font-mono-tabular leading-tight mt-0.5">
                  {hoveredSlice.value}d
                </span>
                <span className="text-xs font-mono-tabular text-zinc-400">
                  {hoveredSlice.pct}% of 66d
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-medium text-zinc-400">
                  Consistency
                </span>
                <span className="font-display text-4xl font-bold text-white font-mono-tabular leading-none mt-0.5">
                  {safeConsistencyRate}%
                </span>
                <span className="text-[11px] font-mono-tabular text-emerald-400 mt-1">
                  {totalProtectedDays}/{TOTAL_RESET_DAYS}d ({completionPct}%)
                </span>
              </>
            )}
          </div>
        </div>

        {/* Clean Unboxed Legend */}
        <div className="w-full flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs">
          {safeSlices.map((slice) => (
            <div
              key={slice.id}
              className="flex items-center gap-1.5 font-mono-tabular text-zinc-300"
            >
              <span
                aria-hidden="true"
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-zinc-400">{slice.label}:</span>
              <span className="font-semibold text-zinc-100">{slice.value}d</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: D3 Monthly Calendar Consistency Matrix */}
      <div className="lg:col-span-7 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold text-white">
            {monthLabel} Daily Consistency Matrix
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-emerald-500" /> Cleared
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#f59e0b]" /> Partial
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-sky-400" /> Frozen
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#e11d48]" /> Reset
            </span>
          </div>
        </div>

        {safeCells.length === 0 ? (
          <div className="rounded-xl bg-[#09090b] border border-zinc-800/90 p-5 text-xs text-zinc-400">
            Calendar grid data is not available for this month yet.
          </div>
        ) : (
          <div ref={calendarWrapRef} className="w-full">
            <svg
              ref={calendarSvgRef}
              role="img"
              aria-label={`${monthLabel} daily consistency calendar matrix`}
              className="w-full block"
            />
          </div>
        )}

        {/* Selected Day Readout Line */}
        {highlightedCell && (
          <div className="pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-white font-mono-tabular">
                {highlightedCell.shortLabel}
                {highlightedCell.isToday ? ' (Today)' : ''}
              </span>
              <span aria-hidden="true" className="text-zinc-600">
                ·
              </span>
              <span
                className={`font-medium ${(STATUS_META[highlightedCell.status] ?? STATUS_META.unlogged).textClass}`}
              >
                {(STATUS_META[highlightedCell.status] ?? STATUS_META.unlogged).label}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono-tabular text-zinc-400">
              <span>
                Habits {highlightedCell.habitsDone}/{highlightedCell.totalHabits}
              </span>
              <span>·</span>
              <span>Activities {highlightedCell.healthyActivitiesCount}</span>
              <span>·</span>
              <span className="text-[#f59e0b] font-semibold">
                +{highlightedCell.xpEarned} XP
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
