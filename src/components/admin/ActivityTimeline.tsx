import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  User,
  Shield,
  Tag,
  Calendar,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  LogIn,
  LogOut,
  UserCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { ActivityLogWithActor } from '../../types/database';
import { activityService, FieldDiff } from '../../services/activityService';
import { formatDate } from '../../utils/date';

interface ActivityTimelineProps {
  entityType?: string;
  entityId?: string;
  logs?: ActivityLogWithActor[];
  maxItems?: number;
  showEntityBadge?: boolean;
  onRefresh?: () => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  entityType,
  entityId,
  logs: propLogs,
  maxItems,
  showEntityBadge = false,
}) => {
  const [logs, setLogs] = useState<ActivityLogWithActor[]>(propLogs || []);
  const [loading, setLoading] = useState<boolean>(!propLogs && Boolean(entityType && entityId));
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchEntityLogs = useCallback(async () => {
    if (!entityType || !entityId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await activityService.getEntityHistory(entityType, entityId);
      if (res.error) {
        setError(res.error);
      } else {
        setLogs(res.logs);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load timeline history.');
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    if (propLogs) {
      setLogs(propLogs);
    } else if (entityType && entityId) {
      fetchEntityLogs();
    }
  }, [propLogs, entityType, entityId, fetchEntityLogs]);

  const toggleExpand = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('STATUS')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Tag className="w-3 h-3" /> Status Changed
        </span>
      );
    }
    if (act.includes('FOLLOWUP_COMPLETED')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Activity className="w-3 h-3" /> Follow-up Completed
        </span>
      );
    }
    if (act.includes('FOLLOWUP_CREATED')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Calendar className="w-3 h-3" /> Follow-up Scheduled
        </span>
      );
    }
    if (act.includes('FOLLOWUP_CANCELLED')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          Cancelled
        </span>
      );
    }
    if (act.includes('ASSIGN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <User className="w-3 h-3" /> Staff Assigned
        </span>
      );
    }
    if (act.includes('ENQUIRY_CREATED')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
          <FileText className="w-3 h-3" /> Inbound Enquiry
        </span>
      );
    }
    if (act.includes('AUTH_LOGIN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <LogIn className="w-3 h-3" /> Signed In
        </span>
      );
    }
    if (act.includes('AUTH_LOGOUT')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <LogOut className="w-3 h-3" /> Signed Out
        </span>
      );
    }
    if (act.includes('USER_')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
          <UserCheck className="w-3 h-3" /> Staff Account
        </span>
      );
    }
    if (act.includes('PRODUCT_')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Layers className="w-3 h-3" /> Product Catalog
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <Shield className="w-3 h-3" /> {action.replace(/_/g, ' ')}
      </span>
    );
  };

  const displayedLogs = maxItems ? logs.slice(0, maxItems) : logs;

  if (loading) {
    return (
      <div className="space-y-4 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-slate-200 mt-1 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-1/3 h-4 bg-slate-200 rounded" />
              <div className="w-2/3 h-3 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 text-xs">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Unable to display timeline</p>
          <p className="mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  if (displayedLogs.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
          <Clock className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-700">No activity history recorded yet</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Lifecycle status changes and team touchpoints will automatically appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {displayedLogs.map((log) => {
        const isExpanded = expandedLogId === log.id;
        const hasPayload =
          (log.new_value && Object.keys(log.new_value).length > 0) ||
          (log.old_value && Object.keys(log.old_value).length > 0) ||
          (log.metadata && Object.keys(log.metadata).length > 0);

        // Check if there are structured diffs in metadata
        const diffs = (log.metadata?.diff as FieldDiff[]) || [];

        return (
          <div key={log.id} className="relative group">
            {/* Timeline bullet icon */}
            <div className="absolute -left-6 mt-1 w-5 h-5 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-xs transition-transform group-hover:scale-110">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            </div>

            {/* Timeline Entry Card */}
            <div
              className={`p-3.5 rounded-xl border transition-all text-xs ${
                isExpanded
                  ? 'bg-slate-50 border-slate-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {getActionBadge(log.action)}
                  {showEntityBadge && (
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase">
                      {log.entity_type} {log.entity_id ? `#${log.entity_id.substring(0, 6)}` : ''}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(log.created_at)}</span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-1.5 text-slate-800 font-medium leading-relaxed">
                {log.description || log.action}
              </p>

              {/* Actor & Action Bar */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className="font-semibold text-slate-700">
                    {log.actor_profile?.full_name || log.actor_profile?.email || 'System / Direct API'}
                  </span>
                  {log.actor_profile?.role && (
                    <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                      {log.actor_profile.role}
                    </span>
                  )}
                </div>

                {hasPayload && (
                  <button
                    onClick={() => toggleExpand(log.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {/* Expanded Details / Diffs */}
              {isExpanded && hasPayload && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-2.5">
                  {/* Structured Diffs */}
                  {diffs.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Changed Attributes
                      </p>
                      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white overflow-hidden">
                        {diffs.map((diff, idx) => (
                          <div key={idx} className="p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                            <span className="font-mono font-semibold text-slate-700">{diff.field}:</span>
                            <div className="flex items-center gap-1.5 font-mono text-[10px]">
                              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 line-through">
                                {String(diff.from ?? 'none')}
                              </span>
                              <span className="text-slate-400">→</span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                                {String(diff.to ?? 'none')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw State JSON if no structured diff */}
                  {diffs.length === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                      {log.old_value && Object.keys(log.old_value).length > 0 && (
                        <div className="p-2 rounded bg-rose-50/70 border border-rose-200">
                          <span className="font-bold text-rose-800 uppercase tracking-wider block mb-1">
                            Previous State
                          </span>
                          <pre className="font-mono text-slate-700 whitespace-pre-wrap overflow-x-auto bg-white/80 p-1.5 rounded">
                            {JSON.stringify(log.old_value, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.new_value && Object.keys(log.new_value).length > 0 && (
                        <div className="p-2 rounded bg-emerald-50/70 border border-emerald-200">
                          <span className="font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                            Applied State
                          </span>
                          <pre className="font-mono text-slate-700 whitespace-pre-wrap overflow-x-auto bg-white/80 p-1.5 rounded">
                            {JSON.stringify(log.new_value, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metadata preview if exists */}
                  {log.metadata && Object.keys(log.metadata).length > 0 && !log.metadata.diff && (
                    <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[10px]">
                      <span className="font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Metadata
                      </span>
                      <pre className="font-mono text-slate-700 whitespace-pre-wrap overflow-x-auto bg-white p-1.5 rounded">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
