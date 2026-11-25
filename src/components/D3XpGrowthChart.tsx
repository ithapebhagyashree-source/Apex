import React, { useEffect, useId, useRef, useState } from 'react';
import * as d3 from 'd3';
import { XpGrowthPoint } from '../utils/performanceReview';

interface D3XpGrowthChartProps {
  data: XpGrowthPoint[];
  scopeLabel: string;
}

type XpChartMode = 'cumulative' | 'daily';

export const D3XpGrowthChart: React.FC<D3XpGrowthChartProps> = ({
  data,
  scopeLabel,
}) => {
  const uid = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [mode, setMode] = useState<XpChartMode>('cumulative');
  const [width, setWidth] = useState(640);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [chartError, setChartError] = useState(false);

  const safeData = Array.isArray(data) ? data : [];

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

      if (safeData.length === 0) {
        svg.attr('viewBox', `0 0 ${width} 40`).attr('height', 40);
        setChartError(false);
        return;
      }

      const isCompact = width < 460;
      const height = isCompact ? 220 : 250;
      const margin = {
        top: 16,
        right: 16,
        bottom: 30,
        left: isCompact ? 42 : 54,
      };
      const innerW = Math.max(120, width - margin.left - margin.right);
      const innerH = height - margin.top - margin.bottom;

      svg.attr('viewBox', `0 0 ${width} ${height}`).attr('height', height);

      const defs = svg.append('defs');
      const areaGradId = `xp-area-grad-${uid}`;
      const grad = defs
        .append('linearGradient')
        .attr('id', areaGradId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
      grad.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.34);
      grad.append('stop').attr('offset', '100%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.02);

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const xScale = d3
        .scalePoint<number>()
        .domain(safeData.map((_, i) => i))
        .range([0, innerW])
        .padding(0.25);

      const maxDaily = Math.max(60, d3.max(safeData, (d) => d.dailyXP) ?? 60);
      const minCum = d3.min(safeData, (d) => d.cumulativeXP) ?? 0;
      const maxCum = Math.max(
        minCum + 100,
        d3.max(safeData, (d) => d.cumulativeXP) ?? 100
      );

      const yDomain: [number, number] =
        mode === 'cumulative'
          ? [Math.max(0, Math.floor(minCum * 0.92)), Math.ceil(maxCum * 1.06)]
          : [0, Math.ceil(maxDaily * 1.18)];

      const yScale = d3.scaleLinear().domain(yDomain).nice().range([innerH, 0]);

      // Horizontal gridlines
      const yTicks = yScale.ticks(4);
      g.selectAll('line.grid-y')
        .data(yTicks)
        .enter()
        .append('line')
        .attr('class', 'grid-y')
        .attr('x1', 0)
        .attr('x2', innerW)
        .attr('y1', (d) => yScale(d))
        .attr('y2', (d) => yScale(d))
        .attr('stroke', '#27272a')
        .attr('stroke-dasharray', '2,4')
        .attr('stroke-width', 1);

      // Y Axis
      const yAxis = d3
        .axisLeft(yScale)
        .ticks(4)
        .tickSize(0)
        .tickPadding(8)
        .tickFormat((d) => {
          const n = Number(d);
          return n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`;
        });

      const yAxisG = g.append('g').call(yAxis);
      yAxisG.select('.domain').remove();
      yAxisG
        .selectAll('text')
        .attr('fill', '#71717a')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '10px');

      // X Axis (pick cleanly spaced tick indices)
      const maxTickLabels = isCompact ? 5 : 7;
      const step = Math.max(1, Math.ceil(safeData.length / maxTickLabels));
      const tickIndices = safeData
        .map((_, i) => i)
        .filter((i) => i % step === 0 || i === safeData.length - 1);

      const xAxis = d3
        .axisBottom(xScale)
        .tickValues(tickIndices)
        .tickSize(0)
        .tickPadding(10)
        .tickFormat((i) => safeData[Number(i)]?.shortLabel ?? '');

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

      const barW = Math.max(
        4,
        Math.min(20, (innerW / Math.max(1, safeData.length)) * 0.58)
      );

      if (mode === 'cumulative') {
        // Subtle daily XP shadow bars along baseline
        const dailyMiniScale = d3
          .scaleLinear()
          .domain([0, maxDaily])
          .range([0, innerH * 0.28]);

        g.selectAll('rect.daily-bg-bar')
          .data(safeData)
          .enter()
          .append('rect')
          .attr('class', 'daily-bg-bar')
          .attr('x', (_, i) => (xScale(i) ?? 0) - barW / 2)
          .attr('y', (d) => innerH - dailyMiniScale(d.dailyXP))
          .attr('width', barW)
          .attr('height', (d) => Math.max(0, dailyMiniScale(d.dailyXP)))
          .attr('rx', 3)
          .attr('fill', '#10b981')
          .attr('fill-opacity', 0.22);

        // D3 Smooth Area
        const areaGen = d3
          .area<XpGrowthPoint>()
          .x((_, i) => xScale(i) ?? 0)
          .y0(innerH)
          .y1((d) => yScale(d.cumulativeXP))
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(safeData)
          .attr('fill', `url(#${areaGradId})`)
          .attr('d', areaGen);

        // D3 Smooth Cumulative Line
        const lineGen = d3
          .line<XpGrowthPoint>()
          .x((_, i) => xScale(i) ?? 0)
          .y((d) => yScale(d.cumulativeXP))
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(safeData)
          .attr('fill', 'none')
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 2.5)
          .attr('stroke-linecap', 'round')
          .attr('d', lineGen);

        // Key point dots (today + active XP gain days)
        g.selectAll('circle.cum-dot')
          .data(
            safeData
              .map((d, i) => ({ d, i }))
              .filter(
                (item) =>
                  item.d.dailyXP > 0 ||
                  item.d.isToday ||
                  item.i === safeData.length - 1
              )
          )
          .enter()
          .append('circle')
          .attr('class', 'cum-dot')
          .attr('cx', (item) => xScale(item.i) ?? 0)
          .attr('cy', (item) => yScale(item.d.cumulativeXP))
          .attr('r', (item) => (item.d.isToday ? 4.5 : 3))
          .attr('fill', (item) => (item.d.isToday ? '#e11d48' : '#f59e0b'))
          .attr('stroke', '#09090b')
          .attr('stroke-width', 1.5);
      } else {
        // Daily XP Velocity vertical bars
        g.selectAll('rect.daily-bar')
          .data(safeData)
          .enter()
          .append('rect')
          .attr('class', 'daily-bar')
          .attr('x', (_, i) => (xScale(i) ?? 0) - barW / 2)
          .attr('y', (d) => yScale(d.dailyXP))
          .attr('width', barW)
          .attr('height', (d) => Math.max(0, innerH - yScale(d.dailyXP)))
          .attr('rx', 4)
          .attr('fill', (d) => (d.isToday ? '#e11d48' : '#f59e0b'))
          .attr('fill-opacity', (d) => (d.dailyXP > 0 ? 0.88 : 0.15));

        // 7-day rolling average curve
        const avgLine = d3
          .line<XpGrowthPoint>()
          .x((_, i) => xScale(i) ?? 0)
          .y((d) => yScale(d.rollingAvgXP))
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(safeData)
          .attr('fill', 'none')
          .attr('stroke', '#10b981')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '4,3')
          .attr('d', avgLine);
      }

      // Active crosshair & highlighted focus dot
      const focusGroup = g.append('g').style('display', 'none');
      const crosshair = focusGroup
        .append('line')
        .attr('y1', 0)
        .attr('y2', innerH)
        .attr('stroke', '#52525b')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3');

      const focusDot = focusGroup
        .append('circle')
        .attr('r', 5.5)
        .attr('fill', '#ffffff')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2.5);

      const updateHoverFromX = (mx: number) => {
        if (!Number.isFinite(mx)) return;
        let nearestIdx = 0;
        let minDist = Infinity;
        for (let i = 0; i < safeData.length; i++) {
          const px = xScale(i) ?? 0;
          const dist = Math.abs(mx - px);
          if (dist < minDist) {
            minDist = dist;
            nearestIdx = i;
          }
        }
        const pt = safeData[nearestIdx];
        if (!pt) return;
        const px = xScale(nearestIdx) ?? 0;
        const py = yScale(mode === 'cumulative' ? pt.cumulativeXP : pt.dailyXP);
        focusGroup.style('display', null);
        crosshair.attr('x1', px).attr('x2', px);
        focusDot.attr('cx', px).attr('cy', py);
        setHoveredIdx(nearestIdx);
      };

      // Interactive invisible hover/touch overlay
      g.append('rect')
        .attr('width', innerW)
        .attr('height', innerH)
        .attr('fill', 'transparent')
        .style('cursor', 'crosshair')
        .on('mousemove', function (event: MouseEvent) {
          const [mx] = d3.pointer(event, this);
          updateHoverFromX(mx);
        })
        .on('touchstart touchmove', function (event: TouchEvent) {
          const touchSource = event.touches?.[0] ?? event;
          const [mx] = d3.pointer(touchSource, this);
          updateHoverFromX(mx);
        })
        .on('mouseleave', () => {
          focusGroup.style('display', 'none');
          setHoveredIdx(null);
        });

      setChartError(false);
    } catch (err) {
      console.error('[D3XpGrowthChart] Render failed:', err);
      setChartError(true);
    }
  }, [safeData, mode, width, uid]);

  const activePoint =
    (hoveredIdx !== null ? safeData[hoveredIdx] : null) ??
    safeData[safeData.length - 1] ??
    null;

  return (
    <div className="space-y-4">
      {/* Mode Selector & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
          {mode === 'cumulative' ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#f59e0b] rounded-full" />
                <span>Cumulative Total XP</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/40" />
                <span>Daily Gain Pulse</span>
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#f59e0b]" />
                <span>Daily XP Earned</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-400 rounded-full" />
                <span>7-Day Rolling Average</span>
              </span>
            </>
          )}
        </div>

        <div
          role="group"
          aria-label="XP chart mode"
          className="flex items-center p-1 rounded-xl bg-[#09090b] border border-zinc-800 self-start sm:self-auto"
        >
          <button
            type="button"
            onClick={() => setMode('cumulative')}
            aria-pressed={mode === 'cumulative'}
            className={`min-h-[34px] px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              mode === 'cumulative'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cumulative Growth
          </button>
          <button
            type="button"
            onClick={() => setMode('daily')}
            aria-pressed={mode === 'daily'}
            className={`min-h-[34px] px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              mode === 'daily'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Daily Velocity
          </button>
        </div>
      </div>

      {/* D3 SVG Container */}
      {chartError ? (
        <div className="rounded-xl bg-[#09090b] border border-zinc-800/90 p-5 text-xs text-zinc-400">
          XP growth chart is temporarily unavailable for {scopeLabel}.
        </div>
      ) : safeData.length === 0 ? (
        <div className="rounded-xl bg-[#09090b] border border-zinc-800/90 p-5 text-xs text-zinc-400">
          No XP history recorded for {scopeLabel} yet. Check off today&apos;s habits to begin tracking your growth curve.
        </div>
      ) : (
        <div ref={containerRef} className="w-full">
          <svg
            ref={svgRef}
            role="img"
            aria-label={`Total XP growth trends D3 chart for ${scopeLabel}`}
            className="w-full block"
          />
        </div>
      )}

      {/* Interactive Point Readout */}
      {activePoint && (
        <div className="pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white font-mono-tabular">
              {activePoint.shortLabel}
              {activePoint.isToday ? ' (Today)' : ''}
            </span>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <span className="text-zinc-400">
              Rank:{' '}
              <strong className="text-[#f59e0b]">{activePoint.rankName}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono-tabular">
            <span className="text-emerald-400">
              Daily +{activePoint.dailyXP.toLocaleString()} XP
            </span>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <span className="text-zinc-200 font-semibold">
              Total {activePoint.cumulativeXP.toLocaleString()} XP
            </span>
            {mode === 'daily' && (
              <>
                <span aria-hidden="true" className="text-zinc-600">
                  ·
                </span>
                <span className="text-zinc-400">
                  7d Avg {activePoint.rollingAvgXP} XP
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
