import React, { useState, useMemo } from 'react';
import { TrendingUp, MoreHorizontal, Calendar } from 'lucide-react';

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

  // Group continuous days into 7-10 clean responsive intervals when range > 12 to prevent chart overflow
  const displayData = useMemo(() => {
    if (!data || data.length <= 12) return data || [];
    const targetBucketCount = data.length <= 31 ? 7 : 10;
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

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-pulse space-y-4 min-w-0 max-w-full overflow-hidden h-full">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-slate-200 rounded-md" />
          <div className="h-5 w-24 bg-slate-100 rounded-md" />
        </div>
        <div className="h-60 bg-slate-50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between min-w-0 max-w-full overflow-hidden h-full flex-1">
      {/* Header matching visual reference with responsive wrapping */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
              {title}
            </h3>
            {badgeLabel && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
                <TrendingUp className="w-3 h-3" />
                <span>{badgeLabel}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {subtitle}
          </p>
        </div>

        {/* Legend & Options Button */}
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap min-w-0">
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600 flex-wrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Total RFQs ({totalPeriodEnquiries})</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-300" />
              <span>Converted ({totalPeriodConverted})</span>
            </div>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors shrink-0"
            aria-label="Chart options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
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
                <span className="w-8 text-[11px] font-mono text-slate-400 text-right pr-2 shrink-0">
                  {tick}
                </span>
                <div className="w-full border-b border-dashed border-slate-200" />
              </div>
            ))}
          </div>

          {/* Overlaid Bars Container */}
          <div className="absolute inset-x-0 bottom-0 top-0 left-8 flex items-end justify-between gap-1 sm:gap-2 px-1 sm:px-2 pb-0.5 min-w-0">
            {displayData.map((item, idx) => {
              const primaryHeightPercent = Math.max((item.count / maxCount) * 100, 4);
              const convertedVal = item.converted || 0;
              const convertedHeightPercent = Math.max((convertedVal / maxCount) * 100, convertedVal > 0 ? 4 : 0);
              const isHovered = hoveredIndex === idx;

              // Tooltip boundary positioning to keep inside viewport
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
                  {/* Floating Hover Card (Tooltip) with boundary protection */}
                  {isHovered && (
                    <div className={`absolute -top-16 z-20 bg-slate-900 text-white text-xs rounded-xl py-2 px-3 shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 ${tooltipAlign}`}>
                      <div className="font-semibold text-[11px] text-slate-300 border-b border-slate-700/60 pb-1 mb-1 truncate max-w-[200px]">
                        {item.label}
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>Total RFQs:</span>
                        </span>
                        <span className="font-bold font-mono">{item.count}</span>
                      </div>
                      {convertedVal > 0 && (
                        <div className="flex items-center justify-between gap-3 text-[11px] mt-0.5">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-sky-300" />
                            <span>Converted:</span>
                          </span>
                          <span className="font-bold font-mono text-sky-300">{convertedVal}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dual Bar Group */}
                  <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 max-w-[36px] min-w-0">
                    {/* Primary Bar: Total Count */}
                    <div
                      style={{ height: `${primaryHeightPercent}%` }}
                      className={`flex-1 min-w-0 rounded-t-md transition-all duration-200 ${
                        item.count > 0
                          ? isHovered
                            ? 'bg-blue-600 shadow-sm'
                            : 'bg-blue-600/90 group-hover:bg-blue-600'
                          : 'bg-slate-100'
                      }`}
                    />

                    {/* Secondary Bar: Converted Count */}
                    <div
                      style={{ height: `${convertedHeightPercent}%` }}
                      className={`flex-1 min-w-0 rounded-t-md transition-all duration-200 ${
                        convertedVal > 0
                          ? isHovered
                            ? 'bg-sky-400'
                            : 'bg-sky-300'
                          : 'bg-slate-100'
                      }`}
                    />
                  </div>

                  {/* X-Axis Label */}
                  <span className="text-[10px] font-medium text-slate-400 mt-2 truncate max-w-full text-center block px-0.5">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
