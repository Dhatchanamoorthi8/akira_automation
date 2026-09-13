import React from 'react';
import { LucideIcon, MoreHorizontal, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface AdminStatCardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  subtext?: string;
  trend?: {
    label: string;
    isPositive?: boolean;
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
  iconColorClass = 'text-blue-600',
  iconBgClass = 'bg-blue-50',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between min-w-0 max-w-full overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      {/* Card Header: Title and Icon / Action */}
      <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
          {title}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {Icon && (
            <div
              className={`w-8 h-8 rounded-xl ${iconBgClass} ${iconColorClass} flex items-center justify-center shrink-0`}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Metric Value */}
      <div className="mb-3 min-w-0">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 truncate font-mono">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>

      {/* Card Footer: Trend Badge & Subtext */}
      <div className="flex items-center flex-wrap gap-2 text-xs pt-1 border-t border-slate-50 min-w-0">
        {trend && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : 'bg-rose-50 text-rose-700 border border-rose-200/60'
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span>{trend.label}</span>
          </span>
        )}
        {subtext && (
          <span className="text-slate-500 text-[11px] font-normal truncate max-w-full">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
