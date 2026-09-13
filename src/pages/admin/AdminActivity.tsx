import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Filter,
  RefreshCw,
  AlertTriangle,
  User,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Shield,
  Activity,
  Tag,
  Calendar,
  Layers,
  Search,
  Download,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  UserCheck,
} from 'lucide-react';
import { ActivityLogWithActor, ActivityFilters, StaffProfile } from '../../types/database';
import { activityService, FieldDiff } from '../../services/activityService';
import { enquiryService } from '../../services/enquiryService';
import { formatDate } from '../../utils/date';

export const AdminActivity: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogWithActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [selectedActor, setSelectedActor] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Staff list for actor filter
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>([]);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const pageSize = 25;

  // Load staff profiles once
  useEffect(() => {
    enquiryService.getAdminProfiles().then((profiles) => {
      setStaffProfiles(profiles);
    }).catch(() => {});
  }, []);

  const calculateDateRange = useCallback((preset: 'all' | 'today' | '7d' | '30d') => {
    if (preset === 'all') return { dateFrom: undefined, dateTo: undefined };
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
    let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    if (preset === '7d') {
      start.setDate(start.getDate() - 6);
    } else if (preset === '30d') {
      start.setDate(start.getDate() - 29);
    }

    return {
      dateFrom: start.toISOString(),
      dateTo: end,
    };
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { dateFrom, dateTo } = calculateDateRange(dateFilter);

      const filters: ActivityFilters = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        action: selectedAction !== 'all' ? selectedAction : undefined,
        entityType: selectedEntity !== 'all' ? selectedEntity : undefined,
        performedBy: selectedActor !== 'all' ? selectedActor : undefined,
        search: searchTerm.trim() ? searchTerm.trim() : undefined,
        dateFrom,
        dateTo,
      };

      const res = await activityService.getActivityHistory(filters);
      if (res.error) {
        setError(res.error);
      } else {
        setLogs(res.logs);
        setTotal(res.total);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve system activity logs.');
    } finally {
      setLoading(false);
    }
  }, [selectedAction, selectedEntity, selectedActor, dateFilter, searchTerm, page, calculateDateRange]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setPage(1);
  };

  const toggleExpand = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  const exportCSV = () => {
    if (logs.length === 0) return;

    const headers = ['ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Description'];
    const rows = logs.map((l) => [
      l.id,
      l.created_at,
      l.actor_profile?.full_name || l.actor_profile?.email || 'System',
      l.actor_profile?.role || 'system',
      l.action,
      l.entity_type,
      l.entity_id || '',
      `"${(l.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `akira_activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('STATUS')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Tag className="w-3 h-3" /> Status Changed
        </span>
      );
    }
    if (act.includes('FOLLOWUP_COMPLETED')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Activity className="w-3 h-3" /> Follow-up Completed
        </span>
      );
    }
    if (act.includes('FOLLOWUP_CREATED')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Calendar className="w-3 h-3" /> Follow-up Scheduled
        </span>
      );
    }
    if (act.includes('FOLLOWUP_CANCELLED')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          Follow-up Cancelled
        </span>
      );
    }
    if (act.includes('ASSIGN')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <User className="w-3 h-3" /> Staff Assigned
        </span>
      );
    }
    if (act.includes('ENQUIRY_CREATED')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
          <FileText className="w-3 h-3" /> Enquiry Received
        </span>
      );
    }
    if (act.includes('AUTH_LOGIN')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <LogIn className="w-3 h-3" /> Signed In
        </span>
      );
    }
    if (act.includes('AUTH_LOGOUT')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <LogOut className="w-3 h-3" /> Signed Out
        </span>
      );
    }
    if (act.includes('USER_')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
          <UserCheck className="w-3 h-3" /> Staff Role
        </span>
      );
    }
    if (act.includes('PRODUCT_')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Layers className="w-3 h-3" /> {action.replace(/_/g, ' ')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <Shield className="w-3 h-3" /> {action.replace(/_/g, ' ')}
      </span>
    );
  };

  const getEntityLink = (log: ActivityLogWithActor) => {
    if (!log.entity_id) return null;
    if (log.entity_type === 'enquiry') {
      return (
        <Link
          to={`/admin/enquiries/${log.entity_id}`}
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
        >
          <span>View Enquiry</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      );
    }
    if (log.entity_type === 'product') {
      return (
        <Link
          to={`/admin/products/${log.entity_id}/edit`}
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
        >
          <span>View Product</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 shadow-sm">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0B1F33] tracking-tight">System Activity Logs</h1>
              <p className="text-sm text-slate-500">
                Immutable audit trail of enquiry lifecycle events, CRM touchpoints, auth, and catalogue changes
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={logs.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search activity description or action code..."
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Date range filter pills */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 self-start md:self-auto text-xs font-semibold">
            {(['all', 'today', '7d', '30d'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => handleFilterChange(setDateFilter, preset)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  dateFilter === preset
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {preset === 'all' ? 'All Time' : preset === 'today' ? 'Today' : preset === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          {/* Action Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Action:</span>
            <select
              value={selectedAction}
              onChange={(e) => handleFilterChange(setSelectedAction, e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="all">All Actions</option>
              <option value="ENQUIRY_CREATED">Enquiry Created</option>
              <option value="ENQUIRY_STATUS_CHANGED">Status Changed</option>
              <option value="ENQUIRY_ASSIGNED">Enquiry Assigned</option>
              <option value="FOLLOWUP_CREATED">Follow-up Created</option>
              <option value="FOLLOWUP_COMPLETED">Follow-up Completed</option>
              <option value="FOLLOWUP_CANCELLED">Follow-up Cancelled</option>
              <option value="AUTH_LOGIN">Auth Login</option>
              <option value="AUTH_LOGOUT">Auth Logout</option>
              <option value="PRODUCT_CREATED">Product Created</option>
              <option value="PRODUCT_UPDATED">Product Updated</option>
              <option value="PRODUCT_DELETED">Product Deleted</option>
              <option value="USER_ROLE_CHANGED">User Role Changed</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Entity:</span>
            <select
              value={selectedEntity}
              onChange={(e) => handleFilterChange(setSelectedEntity, e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="all">All Entities</option>
              <option value="enquiry">Enquiries</option>
              <option value="followup">Follow-ups</option>
              <option value="product">Products</option>
              <option value="profile">Staff Profiles</option>
              <option value="auth">Authentication</option>
            </select>
          </div>

          {/* Staff/Actor Filter */}
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actor:</span>
            <select
              value={selectedActor}
              onChange={(e) => handleFilterChange(setSelectedActor, e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="all">All Actors</option>
              {staffProfiles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name || s.email} ({s.role})
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{logs.length}</span> of{' '}
            <span className="font-bold text-slate-900">{total}</span> events
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold">Unable to load audit logs</p>
            <p className="text-rose-600 mt-0.5">{error}</p>
          </div>
          <button
            onClick={fetchLogs}
            className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-md hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 animate-pulse flex items-center justify-between">
              <div className="space-y-2">
                <div className="w-48 h-4 bg-slate-200 rounded" />
                <div className="w-96 h-3 bg-slate-100 rounded" />
              </div>
              <div className="w-20 h-6 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && logs.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No activity recorded</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
            There are no audit events matching the selected filters.
          </p>
        </div>
      )}

      {/* Audit Log Entries Feed */}
      {!loading && !error && logs.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const hasPayload =
                (log.new_value && Object.keys(log.new_value).length > 0) ||
                (log.old_value && Object.keys(log.old_value).length > 0) ||
                (log.metadata && Object.keys(log.metadata).length > 0);

              const diffs = (log.metadata?.diff as FieldDiff[]) || [];

              return (
                <div
                  key={log.id}
                  className={`p-4 sm:p-5 transition-colors ${
                    isExpanded ? 'bg-slate-50/70' : 'hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Left: Icon, Action, Description */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100 shadow-xs">
                        <Shield className="w-4 h-4" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {getActionBadge(log.action)}
                          <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {log.entity_type} {log.entity_id ? `#${log.entity_id.substring(0, 8)}` : ''}
                          </span>
                        </div>

                        <p className="text-sm text-slate-800 font-medium leading-snug pt-0.5">
                          {log.description || log.action}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-700">
                              {log.actor_profile?.full_name || log.actor_profile?.email || 'System / Direct API'}
                            </span>
                            {log.actor_profile?.role && (
                              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1 rounded">
                                {log.actor_profile.role}
                              </span>
                            )}
                          </span>

                          <span>•</span>

                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(log.created_at)}
                          </span>

                          {getEntityLink(log) && (
                            <>
                              <span>•</span>
                              {getEntityLink(log)}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Expand Payload Toggle */}
                    {hasPayload && (
                      <button
                        onClick={() => toggleExpand(log.id)}
                        className="self-end sm:self-start inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg border border-slate-200 transition-colors shadow-2xs"
                      >
                        <span>{isExpanded ? 'Hide Payload' : 'View Payload'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* Expanded Payload / State Change Diff */}
                  {isExpanded && hasPayload && (
                    <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3 text-xs">
                      {diffs.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Field Changes
                          </p>
                          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white overflow-hidden">
                            {diffs.map((diff, idx) => (
                              <div key={idx} className="p-2 flex items-center justify-between text-xs">
                                <span className="font-mono font-semibold text-slate-700">{diff.field}:</span>
                                <div className="flex items-center gap-2 font-mono text-[11px]">
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {log.old_value && Object.keys(log.old_value).length > 0 && (
                          <div className="bg-rose-50/60 p-3 rounded-lg border border-rose-200">
                            <div className="font-bold text-rose-800 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1">
                              <span>Previous State (Old)</span>
                            </div>
                            <pre className="font-mono text-slate-800 whitespace-pre-wrap overflow-x-auto text-[11px] bg-white/70 p-2 rounded border border-rose-100">
                              {JSON.stringify(log.old_value, null, 2)}
                            </pre>
                          </div>
                        )}

                        {log.new_value && Object.keys(log.new_value).length > 0 && (
                          <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
                            <div className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1">
                              <span>Applied State (New)</span>
                            </div>
                            <pre className="font-mono text-slate-800 whitespace-pre-wrap overflow-x-auto text-[11px] bg-white/70 p-2 rounded border border-emerald-100">
                              {JSON.stringify(log.new_value, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px] block mb-1">
                            Additional Metadata
                          </span>
                          <pre className="font-mono text-slate-700 whitespace-pre-wrap overflow-x-auto text-[11px] bg-white p-2 rounded border border-slate-200">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-xs text-xs text-slate-600">
              <div>
                Page <span className="font-bold text-slate-900">{page}</span> of{' '}
                <span className="font-bold text-slate-900">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 font-semibold"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminActivity;
