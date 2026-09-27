import React from 'react';
import { Card, Chip } from '@heroui/react';
import { ActivityLog } from '../../types/database';
import { formatRelativeTime } from '../../utils/date';
import { History, PlusCircle, Edit3, Image, RefreshCw, CheckSquare } from 'lucide-react';

interface RecentActivityProps {
  logs: ActivityLog[];
  isLoading?: boolean;
}

function resolveActionIcon(action: string): React.ElementType {
  if (action.includes('IMAGE')) return Image;
  if (action.includes('FOLLOWUP')) return CheckSquare;
  if (action.includes('STATUS')) return RefreshCw;
  if (action.includes('CREATED')) return PlusCircle;
  return Edit3;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ logs, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs animate-pulse space-y-4 h-full flex flex-col">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="space-y-3 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-slate-200/70 rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] flex flex-col h-full flex-1 space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight font-sans">
            System & Audit Activity
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable operation log across catalogue and CRM
          </p>
        </div>
        <Chip
          variant="soft"
          color="default"
          size="sm"
          className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60"
        >
          <Chip.Label>{logs.length}</Chip.Label>
        </Chip>
      </div>

      {logs.length === 0 ? (
        <div className="flex-1 min-h-[180px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <History className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-700 font-heading">No recent activity.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Catalogue modifications and follow-up updates will log here.
          </p>
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {logs.map((log) => {
            const Icon = resolveActionIcon(log.action);

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200 shadow-2xs">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">
                    {log.description || log.action.replace(/_/g, ' ')}
                  </p>
                  <span className="text-[10px] text-slate-600 font-mono">
                    {formatRelativeTime(log.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
