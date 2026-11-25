import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HabitPerformanceItem } from '../utils/performanceReview';

interface D3TopHabitsChartProps {
  items: HabitPerformanceItem[];
  scopeLabel: string;
}

type HabitFilter = 'all' | 'habit' | 'replacement';

export const D3TopHabitsChart: React.FC<D3TopHabitsChartProps> = ({
  items,
  scopeLabel,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [filter, setFilter] = useState<HabitFilter>('all');
  const [width, setWidth] = useState(520);
  const [hoveredItem, setHoveredItem] = useState<HabitPerformanceItem | null>(
    null
  );
  const [chartError, setChartError] = useState(false);

  const safeItems = Array.isArray(items) ? items : [];

  const filteredItems = useMemo(() => {
    const base =
      filter === 'all' ? safeItems : safeItems.filter((i) => i.source === filter);
    return base.slice(0, 8);
  }, [safeItems, filter]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const next = Math.max(260, Math.floor(el.getBoundingClientRect().width));
      setWidth(next);
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

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    try {
      const svg = d3.select(svgEl);
      svg.selectAll('*').remove();

      if (filteredItems.length === 0) {
        svg.attr('viewBox', `0 0 ${width} 40`).attr('height', 40);
        setChartError(false);
        return;
      }

      const isCompact = width < 440;
      const margin = {
        top: 10,
        right: isCompact ? 62 : 76,
        bottom: 28,
        left: isCompact ? 118 : 164,
      };
      const rowHeight = 36;
      const innerW = Math.max(80, width - margin.left - margin.right);
      const innerH = filteredItems.length * rowHeight;
      const totalH = innerH + margin.top + margin.bottom;

      svg.attr('viewBox', `0 0 ${width} ${totalH}`).attr('height', totalH);

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const maxVal = Math.max(
        3,
        d3.max(filteredItems, (d) => d.completions) ?? 1
      );

      const xScale = d3.scaleLinear().domain([0, maxVal]).nice().range([0, innerW]);

      const yScale = d3
        .scaleBand<string>()
        .domain(filteredItems.map((d) => d.id))
        .range([0, innerH])
        .padding(0.28);

      // Subtle vertical gridlines
      const xTicks = xScale.ticks(Math.min(5, maxVal));
      g.selectAll('line.grid-x')
        .data(xTicks)
        .enter()
        .append('line')
        .attr('class', 'grid-x')
        .attr('x1', (d) => xScale(d))
        .attr('x2', (d) => xScale(d))
        .attr('y1', 0)
        .attr('y2', innerH)
        .attr('stroke', '#27272a')
        .attr('stroke-dasharray', '2,4')
        .attr('stroke-width', 1);

      // Bottom X axis
      const xAxis = d3
        .axisBottom(xScale)
        .ticks(Math.min(5, maxVal))
        .tickFormat((d) => `${Number(d)}d`)
        .tickSize(0)
        .tickPadding(8);

      const xAxisG = g
        .append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(xAxis);

      xAxisG.select('.domain').attr('stroke', '#27272a');
      xAxisG
        .selectAll('text')
        .attr('fill', '#71717a')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '10px');

      // Background track bars
      g.selectAll('rect.bar-track')
        .data(filteredItems)
        .enter()
        .append('rect')
        .attr('class', 'bar-track')
        .attr('x', 0)
        .attr('y', (d) => yScale(d.id) ?? 0)
        .attr('width', innerW)
        .attr('height', yScale.bandwidth())
        .attr('rx', 6)
        .attr('fill', '#18181b');

      // Active D3 value bars (direct width + CSS transition avoids d3-transition production tree-shaking)
      g.selectAll('rect.bar-fill')
        .data(filteredItems)
        .enter()
        .append('rect')
        .attr('class', 'bar-fill')
        .attr('x', 0)
        .attr('y', (d) => yScale(d.id) ?? 0)
        .attr('height', yScale.bandwidth())
        .attr('rx', 6)
        .attr('fill', (d) => (d.source === 'habit' ? '#10b981' : '#f59e0b'))
        .attr('fill-opacity', (d) => (d.completions > 0 ? 0.9 : 0.2))
        .attr('width', (d) =>
          d.completions > 0 ? Math.max(8, xScale(d.completions)) : 0
        )
        .style('cursor', 'pointer')
        .style('transition', 'width 260ms ease-out, fill-opacity 150ms ease')
        .on('mouseenter', function (_, d) {
          d3.select(this).attr('fill-opacity', 1);
          setHoveredItem(d);
        })
        .on('mouseleave', function (_, d) {
          d3.select(this).attr('fill-opacity', d.completions > 0 ? 0.9 : 0.2);
          setHoveredItem(null);
        })
        .on('click', (_, d) => setHoveredItem(d));

      // Left habit labels (cleanly truncated to fit margin)
      const maxChars = isCompact ? 15 : 22;
      g.selectAll('text.habit-label')
        .data(filteredItems)
        .enter()
        .append('text')
        .attr('class', 'habit-label')
        .attr('x', -10)
        .attr('y', (d) => (yScale(d.id) ?? 0) + yScale.bandwidth() / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', (d) => (d.completions > 0 ? '#f4f4f5' : '#71717a'))
        .attr('font-size', isCompact ? '11px' : '12px')
        .attr('font-weight', '500')
        .text((d) => {
          const text = String(d.label ?? '');
          return text.length > maxChars ? `${text.slice(0, maxChars - 1)}…` : text;
        });

      // Right tabular value labels
      g.selectAll('text.habit-val')
        .data(filteredItems)
        .enter()
        .append('text')
        .attr('class', 'habit-val')
        .attr('x', innerW + 8)
        .attr('y', (d) => (yScale(d.id) ?? 0) + yScale.bandwidth() / 2 + 4)
        .attr('text-anchor', 'start')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('fill', (d) =>
          d.completions > 0
            ? d.source === 'habit'
              ? '#6ee7b7'
              : '#fde68a'
            : '#52525b'
        )
        .text((d) => `${d.completions}d · ${d.ratePct}%`);

      setChartError(false);
    } catch (err) {
      console.error('[D3TopHabitsChart] Render failed:', err);
      setChartError(true);
    }
  }, [filteredItems, width]);

  const topHabit = filteredItems.find((i) => i.completions > 0) ?? null;

  return (
    <div className="space-y-4">
      {/* Header Controls & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span>Daily Non-Negotiables</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#f59e0b]" />
            <span>Healthy Replacements</span>
          </span>
        </div>

        <div
          role="group"
          aria-label="Filter habit categories"
          className="flex items-center p-1 rounded-xl bg-[#09090b] border border-zinc-800 self-start sm:self-auto"
        >
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'habit', label: 'Daily Habits' },
              { id: 'replacement', label: 'Replacements' },
            ] as const
          ).map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                aria-pressed={active}
                className={`min-h-[34px] px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* D3 Horizontal Bar Chart */}
      {chartError ? (
        <div className="rounded-xl bg-[#09090b] border border-zinc-800/90 p-5 text-xs text-zinc-400">
          Habit ranking chart is temporarily unavailable for {scopeLabel}.
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl bg-[#09090b] border border-zinc-800/90 p-5 text-xs text-zinc-400">
          No habits match this filter for {scopeLabel} yet. Add habits or log a replacement activity to build your ranking.
        </div>
      ) : (
        <div ref={containerRef} className="w-full">
          <svg
            ref={svgRef}
            role="img"
            aria-label={`Top healthy habits horizontal bar chart for ${scopeLabel}`}
            className="w-full block"
          />
        </div>
      )}

      {/* Interactive Focus Footer */}
      <div className="pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        {hoveredItem ? (
          <>
            <div className="text-zinc-200 font-medium">
              {hoveredItem.label}{' '}
              <span className="text-zinc-500">· {hoveredItem.categoryLabel}</span>
            </div>
            <div className="font-mono-tabular text-zinc-300">
              {hoveredItem.completions} completions ({hoveredItem.ratePct}%) ·{' '}
              <span className="text-emerald-400">
                {hoveredItem.cleanDaysLinked} streak-safe days
              </span>
            </div>
          </>
        ) : topHabit ? (
          <>
            <div className="text-zinc-400">
              #1 Habit in {scopeLabel}:{' '}
              <span className="text-white font-semibold">{topHabit.label}</span>
            </div>
            <div className="font-mono-tabular text-emerald-400">
              {topHabit.completions}{' '}
              {topHabit.completions === 1 ? 'day' : 'days'} logged (
              {topHabit.ratePct}%)
            </div>
          </>
        ) : (
          <div className="text-zinc-400">
            Check off daily habits or tap a healthy replacement on the Progress tab to populate rankings for {scopeLabel}.
          </div>
        )}
      </div>
    </div>
  );
};
