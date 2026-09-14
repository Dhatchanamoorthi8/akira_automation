import React from 'react';
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
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-subtle animate-pulse space-y-4 h-full flex flex-col">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="space-y-3 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col h-full flex-1 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            System & Audit Activity
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable operation log across catalogue and CRM
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
          {logs.length}
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="flex-1 min-h-[180px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
          <History className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-slate-600">No recent activity.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Catalogue modifications and follow-up updates will log here.
          </p>
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {logs.map((log) => {
            const Icon = resolveActionIcon(log.action);

            return (
              <div key={log.id} className="flex items-start gap-3 text-xs">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-industrial-dark truncate">
                    {log.description || log.action.replace(/_/g, ' ')}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatRelativeTime(log.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
