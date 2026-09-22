import React from 'react';
import { Card, Chip } from '@heroui/react';
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
    <Card
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-sky-500/40 transition-all duration-200 flex flex-col justify-between min-w-0 max-w-full overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Card Header: Title and Icon / Action */}
      <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate font-mono">
          {title}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {Icon && (
            <div
              className={`w-8 h-8 rounded-lg ${iconBgClass} ${iconColorClass} flex items-center justify-center shrink-0 border border-slate-100/80 shadow-2xs`}
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
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 truncate font-mono">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>

      {/* Card Footer: Trend Badge & Subtext */}
      <div className="flex items-center flex-wrap gap-2 text-xs pt-2 border-t border-slate-100 min-w-0">
        {trend && (
          <Chip
            variant="soft"
            color={trend.isPositive ? 'success' : 'danger'}
            size="sm"
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : 'bg-rose-50 text-rose-700 border border-rose-200/60'
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="w-3 h-3 shrink-0" />
            ) : (
              <ArrowDownRight className="w-3 h-3 shrink-0" />
            )}
            <Chip.Label className="font-mono text-[11px]">{trend.label}</Chip.Label>
          </Chip>
        )}
        {subtext && (
          <span className="text-slate-500 text-[11px] font-medium truncate max-w-full">
            {subtext}
          </span>
        )}
      </div>
    </Card>
  );
};
