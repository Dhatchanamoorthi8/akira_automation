import React, { useState } from 'react';
import { EnquiryStatusDistribution } from '../../types/database';
import { Layers, MoreHorizontal } from 'lucide-react';

interface EnquiryStatusSummaryProps {
  data: EnquiryStatusDistribution[];
  isLoading?: boolean;
  title?: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6', // blue-500
  contacted: '#0ea5e9', // sky-500
  quotation_sent: '#f59e0b', // amber-500
  follow_up: '#6366f1', // indigo-500
  converted: '#10b981', // emerald-500
  closed: '#94a3b8', // slate-400
};

export const EnquiryStatusSummary: React.FC<EnquiryStatusSummaryProps> = ({
  data,
  isLoading,
  title = 'Pipeline Distribution',
}) => {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-pulse space-y-4 min-w-0 max-w-full overflow-hidden h-full">
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 bg-slate-200 rounded-md" />
          <div className="h-4 w-4 bg-slate-200 rounded" />
        </div>
        <div className="h-40 w-40 rounded-full bg-slate-100 mx-auto" />
        <div className="space-y-2 pt-2">
          <div className="h-4 bg-slate-100 rounded" />
          <div className="h-4 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  // Calculate SVG donut stroke arcs
  const radius = 56;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const segments = data
    .filter((d) => d.count > 0)
    .map((item) => {
      const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((cumulativePercent / 100) * circumference);
      cumulativePercent += item.percentage;
      const strokeColor = STATUS_COLORS[item.status] || '#cbd5e1';

      return {
        ...item,
        strokeDasharray,
        strokeDashoffset,
        strokeColor,
      };
    });

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between min-w-0 max-w-full overflow-hidden h-full flex-1">
      {/* Header matching visual reference */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 min-w-0">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            RFQ stage & deal progression breakdown
          </p>
        </div>
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors shrink-0"
          aria-label="Distribution options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {total === 0 ? (
        <div className="h-60 flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 my-auto">
          <Layers className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-slate-600">No Pipeline Records</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Captured RFQs will categorize across lifecycle stages here.
          </p>
        </div>
      ) : (
        <div className="py-4 flex-1 flex flex-col items-center justify-center min-w-0 max-w-full">
          {/* Responsive Donut Ring Chart */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 max-w-full flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 140 140"
            >
              {/* Background Ring */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Data Arc Segments */}
              {segments.map((seg) => {
                const isHovered = hoveredStatus === seg.status;
                return (
                  <circle
                    key={seg.status}
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke={seg.strokeColor}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredStatus(seg.status)}
                    onMouseLeave={() => setHoveredStatus(null)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {total}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Total RFQs
              </span>
            </div>
          </div>

          {/* Clean Responsive Legend Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 pt-4 mt-2 border-t border-slate-100 text-xs min-w-0">
            {data.map((item) => {
              const color = STATUS_COLORS[item.status] || '#cbd5e1';
              const isHovered = hoveredStatus === item.status;

              return (
                <div
                  key={item.status}
                  className={`flex items-center justify-between p-1 rounded-lg transition-colors cursor-pointer min-w-0 ${
                    isHovered ? 'bg-slate-50' : ''
                  }`}
                  onMouseEnter={() => setHoveredStatus(item.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-slate-600 font-medium text-[11px] truncate">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[11px] shrink-0">
                    <span className="font-semibold text-slate-800">{item.count}</span>
                    <span className="text-slate-400 text-[10px]">({item.percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
