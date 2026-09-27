import React from 'react';
import { Card, Chip } from '@heroui/react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface AdminStatCardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  subtext?: string;
  trend?: {
    label: string;
    isPositive?: boolean;
  };
  countBadge?: number | string;
  sparkline?: 'dark' | 'purple' | 'orange' | 'emerald';
  progress?: {
    percent: number;
    color?: string;
  };
  iconColorClass?: string;
  iconBgClass?: string;
  onClick?: () => void;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtext,
  trend,
  countBadge,
  sparkline,
  progress,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      className={`bg-white border border-slate-200/70 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between min-w-0 max-w-full overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Card Header: Icon + Title & Top-Right Badge */}
      <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && (
            <div className="w-6 h-6 rounded-lg bg-slate-100/90 text-slate-600 flex items-center justify-center shrink-0">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs font-semibold text-slate-700 truncate">
            {title}
          </span>
        </div>

        {/* Right Badge: Trend Pill or Count Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          {trend ? (
            <Chip
              variant="soft"
              color={trend.isPositive ? 'success' : 'danger'}
              size="sm"
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/80'
                  : 'bg-rose-50 text-rose-600 border border-rose-100/80'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3 h-3 shrink-0" />
              ) : (
                <ArrowDownRight className="w-3 h-3 shrink-0" />
              )}
              <Chip.Label className="text-[11px] font-semibold">{trend.label}</Chip.Label>
            </Chip>
          ) : countBadge !== undefined ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              {countBadge}
            </span>
          ) : null}
        </div>
      </div>

      {/* Content Area: Split layout for Sparklines & Stacked layout for Progress Bars */}
      {sparkline ? (
        <div className="flex items-end justify-between gap-3 mt-1 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 truncate">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {subtext && (
              <p className="text-xs text-slate-400 font-normal mt-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                {subtext}
              </p>
            )}
          </div>

          {/* Smooth Wide Sparkline Curve (matches the reference screenshot curves) */}
          <div className="w-28 sm:w-36 md:w-40 h-10 sm:h-12 shrink-0 overflow-hidden flex items-end justify-end">
            <svg className="w-full h-full" viewBox="0 0 140 40" preserveAspectRatio="none" fill="none">
              {sparkline === 'dark' && (
                <>
                  <defs>
                    <linearGradient id="pipelineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0F172A" stopOpacity="0.10" />
                      <stop offset="100%" stopColor="#0F172A" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 26 C 20 26, 30 18, 50 18 C 70 18, 80 24, 100 21 C 115 18, 128 14, 140 14"
                    stroke="#1E293B"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 26 C 20 26, 30 18, 50 18 C 70 18, 80 24, 100 21 C 115 18, 128 14, 140 14 L 140 40 L 0 40 Z"
                    fill="url(#pipelineGrad)"
                  />
                </>
              )}
              {sparkline === 'purple' && (
                <>
                  <defs>
                    <linearGradient id="meetingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.16" />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 32 C 15 32, 22 22, 35 22 C 48 22, 55 30, 70 30 C 85 30, 95 16, 110 16 C 122 16, 128 26, 140 26"
                    stroke="#7C3AED"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 32 C 15 32, 22 22, 35 22 C 48 22, 55 30, 70 30 C 85 30, 95 16, 110 16 C 122 16, 128 26, 140 26 L 140 40 L 0 40 Z"
                    fill="url(#meetingsGrad)"
                  />
                </>
              )}
              {sparkline === 'orange' && (
                <>
                  <defs>
                    <linearGradient id="lostGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F97316" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 35 C 30 35, 50 35, 70 34 C 95 33, 110 28, 125 24 C 132 21, 136 12, 140 8"
                    stroke="#F97316"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 35 C 30 35, 50 35, 70 34 C 95 33, 110 28, 125 24 C 132 21, 136 12, 140 8 L 140 40 L 0 40 Z"
                    fill="url(#lostGrad)"
                  />
                </>
              )}
              {sparkline === 'emerald' && (
                <>
                  <defs>
                    <linearGradient id="emGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 32 C 25 32, 40 24, 65 24 C 90 24, 105 16, 125 16 C 132 16, 136 10, 140 8"
                    stroke="#10B981"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 32 C 25 32, 40 24, 65 24 C 90 24, 105 16, 125 16 C 132 16, 136 10, 140 8 L 140 40 L 0 40 Z"
                    fill="url(#emGrad)"
                  />
                </>
              )}
            </svg>
          </div>
        </div>
      ) : progress ? (
        <div className="mt-1 min-w-0">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 truncate">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden my-2.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progress.color || 'bg-emerald-500'}`}
              style={{ width: `${Math.min(Math.max(progress.percent, 0), 100)}%` }}
            />
          </div>
          {subtext && (
            <p className="text-xs text-slate-400 font-normal truncate">
              {subtext}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-1 min-w-0">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 truncate">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {subtext && (
            <p className="text-xs text-slate-400 font-normal mt-1.5 truncate">
              {subtext}
            </p>
          )}
        </div>
      )}
    </Card>
  );
};
