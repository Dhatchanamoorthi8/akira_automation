import React, { useState, useMemo } from 'react';
import { Card, Chip, Button } from '@heroui/react';
import { TrendingUp, BarChart2, LineChart, Calendar } from 'lucide-react';

export interface TrendItem {
  date: string;
  label: string;
  count: number;
  converted?: number;
}

interface EnquiryTrendProps {
  data: TrendItem[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
}

export const EnquiryTrend: React.FC<EnquiryTrendProps> = ({
  data,
  isLoading,
  title = 'Performance Overview',
  subtitle = 'Daily inbound technical RFQ volume & conversion velocity',
  badgeLabel,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [chartType, setChartType] = useState<'bars' | 'line'>('bars');

  // Group continuous days into 6-8 clean responsive intervals when range > 12 to prevent chart overflow
  const displayData = useMemo(() => {
    if (!data || data.length <= 12) return data || [];
    const targetBucketCount = data.length <= 31 ? 6 : 8;
    const bucketSize = Math.ceil(data.length / targetBucketCount);
    const buckets: TrendItem[] = [];

    for (let i = 0; i < data.length; i += bucketSize) {
      const chunk = data.slice(i, i + bucketSize);
      if (chunk.length === 0) continue;
      const count = chunk.reduce((sum, item) => sum + item.count, 0);
      const converted = chunk.reduce((sum, item) => sum + (item.converted || 0), 0);
      const startLabel = chunk[0].label;
      const endLabel = chunk[chunk.length - 1].label;
      const label = chunk.length > 1 ? `${startLabel} - ${endLabel}` : startLabel;

      buckets.push({
        date: chunk[0].date,
        label,
        count,
        converted,
      });
    }
    return buckets;
  }, [data]);

  // Compute maximum count for proportional bar heights
  const maxCount = Math.max(
    ...displayData.map((d) => Math.max(d.count, d.converted || 0)),
    5
  );

  // Generate 4 nice y-axis tick values
  const yTicks = [
    maxCount,
    Math.round((maxCount * 3) / 4),
    Math.round((maxCount * 2) / 4),
    Math.round(maxCount / 4),
    0,
  ];

  const totalPeriodEnquiries = (data || []).reduce((sum, d) => sum + d.count, 0);
  const totalPeriodConverted = (data || []).reduce((sum, d) => sum + (d.converted || 0), 0);

  // Chart canvas constants
  const chartHeight = 224; // Corresponds to h-56 (14rem)
  const maxBarHeight = 210; // Leaves headroom under the top dashed tick

  // SVG Spline calculations for 'line' mode
  const svgWidth = 600;
  const svgPoints = useMemo(() => {
    if (displayData.length === 0) return { createdPoints: '', closedPoints: '', createdArea: '', closedArea: '', coords: [] };
    const n = displayData.length;
    const stepX = svgWidth / (n > 1 ? n - 1 : 1);

    const coords = displayData.map((item, idx) => {
      const x = n > 1 ? idx * stepX : svgWidth / 2;
      const yCreated = chartHeight - Math.round((item.count / maxCount) * maxBarHeight) - 8;
      const yClosed = chartHeight - Math.round(((item.converted || 0) / maxCount) * maxBarHeight) - 8;
      return { x, yCreated, yClosed, item, idx };
    });

    // Helper for smooth bezier path
    const buildSmoothPath = (pts: { x: number; y: number }[]) => {
      if (pts.length === 0) return '';
      if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i === 0 ? 0 : i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
      return d;
    };

    const createdLine = buildSmoothPath(coords.map((c) => ({ x: c.x, y: c.yCreated })));
    const closedLine = buildSmoothPath(coords.map((c) => ({ x: c.x, y: c.yClosed })));

    const createdArea = `${createdLine} L ${coords[coords.length - 1].x} ${chartHeight} L ${coords[0].x} ${chartHeight} Z`;
    const closedArea = `${closedLine} L ${coords[coords.length - 1].x} ${chartHeight} L ${coords[0].x} ${chartHeight} Z`;

    return { createdLine, closedLine, createdArea, closedArea, coords };
  }, [displayData, maxCount]);

  if (isLoading) {
    return (
      <Card className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs animate-pulse space-y-4 min-w-0 max-w-full overflow-hidden h-full">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-slate-200 rounded-md" />
          <div className="h-5 w-24 bg-slate-100 rounded-md" />
        </div>
        <div className="h-60 bg-slate-50 rounded-xl" />
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-slate-200/70 rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between min-w-0 max-w-full overflow-hidden h-full flex-1">
      {/* Header matching HeroUI visual reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900 tracking-tight truncate font-sans">
              {title}
            </h2>
            {badgeLabel && (
              <Chip
                variant="soft"
                color="accent"
                size="sm"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 shrink-0"
              >
                <TrendingUp className="w-3 h-3 shrink-0" />
                <Chip.Label>{badgeLabel}</Chip.Label>
              </Chip>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {subtitle}
          </p>
        </div>

        {/* Legend & View Switcher (• Created • Closed style) */}
        <div className="flex items-center gap-4 self-start sm:self-auto flex-wrap min-w-0">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 flex-wrap">
            <div className="inline-flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <span>Created ({totalPeriodEnquiries})</span>
            </div>
            <div className="inline-flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Closed ({totalPeriodConverted})</span>
            </div>
          </div>

          {/* Toggle between Bars & Spline Line */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-600">
            <Button
              isIconOnly
              variant={chartType === 'bars' ? 'secondary' : 'ghost'}
              size="sm"
              onPress={() => setChartType('bars')}
              className={`p-1.5 rounded-lg min-h-[28px] min-w-[28px] h-7 w-7 transition-all cursor-pointer ${
                chartType === 'bars'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              aria-label="View as bar chart"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              isIconOnly
              variant={chartType === 'line' ? 'secondary' : 'ghost'}
              size="sm"
              onPress={() => setChartType('line')}
              className={`p-1.5 rounded-lg min-h-[28px] min-w-[28px] h-7 w-7 transition-all cursor-pointer ${
                chartType === 'line'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              aria-label="View as spline area chart"
            >
              <LineChart className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      {displayData.length === 0 || totalPeriodEnquiries === 0 ? (
        <div className="h-60 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 mt-4">
          <Calendar className="w-9 h-9 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Enquiries Recorded In Period</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Inbound technical RFQs submitted by prospective industrial clients will plot here automatically.
          </p>
        </div>
      ) : (
        <div className="relative mt-6 pt-2 min-w-0 max-w-full">
          {/* Y-Axis Grid Lines and Scale */}
          <div className="relative h-56 flex flex-col justify-between pointer-events-none">
            {yTicks.map((tick, idx) => (
              <div key={idx} className="flex items-center w-full min-w-0">
                <span className="w-8 text-[11px] font-mono font-semibold text-slate-500 text-right pr-2 shrink-0">
                  {tick}
                </span>
                <div className="w-full border-b border-dashed border-slate-200/90" />
              </div>
            ))}
          </div>

          {/* Chart Graphic Overlay (Aligned strictly to grid height: h-56 = 224px) */}
          {chartType === 'bars' ? (
            <div className="absolute top-0 bottom-0 left-8 right-0 h-56 flex items-end justify-between gap-1 sm:gap-3 px-1 sm:px-3 min-w-0">
              {displayData.map((item, idx) => {
                const primaryHeightPx = item.count > 0 ? Math.max(Math.round((item.count / maxCount) * maxBarHeight), 8) : 2;
                const convertedVal = item.converted || 0;
                const convertedHeightPx = convertedVal > 0 ? Math.max(Math.round((convertedVal / maxCount) * maxBarHeight), 8) : (item.count > 0 ? 0 : 2);
                const isHovered = hoveredIndex === idx;

                const tooltipAlign =
                  idx === 0
                    ? 'left-0'
                    : idx === displayData.length - 1
                    ? 'right-0'
                    : 'left-1/2 -translate-x-1/2';

                return (
                  <div
                    key={item.date || idx}
                    className="flex-1 min-w-0 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Floating Hover Card (Tooltip) */}
                    {isHovered && (
                      <div className={`absolute -top-16 z-30 bg-slate-900 border border-slate-800 text-white text-xs rounded-xl py-2 px-3 shadow-2xl pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 ${tooltipAlign}`}>
                        <div className="font-semibold text-[11px] text-slate-300 border-b border-slate-800 pb-1 mb-1 truncate max-w-[200px] font-mono">
                          {item.label}
                        </div>
                        <div className="flex items-center justify-between gap-3 text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-white" />
                            <span>Created:</span>
                          </span>
                          <span className="font-bold font-mono text-white">{item.count}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-[11px] mt-0.5">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>Closed:</span>
                          </span>
                          <span className="font-bold font-mono text-rose-400">{convertedVal}</span>
                        </div>
                      </div>
                    )}

                    {/* Dual Bar Group with explicit calculated pixel heights */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 max-w-[42px] min-w-0 pb-[1px]">
                      {/* Primary Bar: Created Count (Slate-900 matching Legend) */}
                      <div
                        style={{ height: `${primaryHeightPx}px` }}
                        className={`flex-1 min-w-[8px] max-w-[18px] rounded-t-lg transition-all duration-300 ${
                          item.count > 0
                            ? isHovered
                              ? 'bg-slate-900 shadow-md ring-2 ring-slate-900/20'
                              : 'bg-slate-800 hover:bg-slate-900'
                            : 'bg-slate-100'
                        }`}
                      />

                      {/* Secondary Bar: Closed Count (Rose-500 matching Legend) */}
                      <div
                        style={{ height: `${convertedHeightPx}px` }}
                        className={`flex-1 min-w-[8px] max-w-[18px] rounded-t-lg transition-all duration-300 ${
                          convertedVal > 0
                            ? isHovered
                              ? 'bg-rose-500 shadow-md ring-2 ring-rose-500/30'
                              : 'bg-rose-500/90 hover:bg-rose-500'
                            : 'bg-slate-100/50'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="absolute top-0 bottom-0 left-8 right-0 h-56 min-w-0 overflow-visible">
              <svg
                viewBox={`0 0 ${svgWidth} ${chartHeight}`}
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F172A" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#0F172A" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="closedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FB7185" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#FB7185" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Closed Area & Line */}
                <path d={svgPoints.closedArea} fill="url(#closedGrad)" />
                <path
                  d={svgPoints.closedLine}
                  fill="none"
                  stroke="#FB7185"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Created Area & Line */}
                <path d={svgPoints.createdArea} fill="url(#createdGrad)" />
                <path
                  d={svgPoints.createdLine}
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {svgPoints.coords.map((c) => {
                  const isHovered = hoveredIndex === c.idx;
                  return (
                    <g key={c.idx}>
                      {/* Created Node */}
                      <circle
                        cx={c.x}
                        cy={c.yCreated}
                        r={isHovered ? 5.5 : 3.5}
                        fill="#0F172A"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(c.idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                      {/* Closed Node */}
                      <circle
                        cx={c.x}
                        cy={c.yClosed}
                        r={isHovered ? 5.5 : 3.5}
                        fill="#FB7185"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(c.idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip Overlay for Line Mode */}
              {hoveredIndex !== null && displayData[hoveredIndex] && (
                <div
                  className={`absolute -top-14 z-30 bg-slate-900 border border-slate-800 text-white text-xs rounded-xl py-2 px-3 shadow-2xl pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 ${
                    hoveredIndex === 0
                      ? 'left-4'
                      : hoveredIndex === displayData.length - 1
                      ? 'right-4'
                      : 'left-1/2 -translate-x-1/2'
                  }`}
                >
                  <div className="font-semibold text-[11px] text-slate-300 border-b border-slate-800 pb-1 mb-1 truncate max-w-[200px] font-mono">
                    {displayData[hoveredIndex].label}
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <span>Created:</span>
                    </span>
                    <span className="font-bold font-mono text-white">{displayData[hoveredIndex].count}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[11px] mt-0.5">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Closed:</span>
                    </span>
                    <span className="font-bold font-mono text-rose-400">{displayData[hoveredIndex].converted || 0}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* X-Axis Labels Row (Strictly placed below chart grid baseline) */}
          <div className="flex items-center justify-between pl-8 pt-3 border-t border-slate-100/70 mt-1">
            {displayData.map((item, idx) => (
              <div key={item.date || idx} className="flex-1 text-center min-w-0 px-0.5">
                <span className="text-[10px] sm:text-[11px] font-mono font-medium text-slate-500 truncate block">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

