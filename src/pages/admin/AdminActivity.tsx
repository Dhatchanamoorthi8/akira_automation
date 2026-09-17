import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  RefreshCw,
  AlertTriangle,
  Clock,
  ExternalLink,
  Shield,
  Layers,
  Search,
  Download,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  X,
  Eye,
} from 'lucide-react';
import { ActivityLogWithActor, ActivityFilters, StaffProfile } from '../../types/database';
import { activityService, FieldDiff } from '../../services/activityService';
import { enquiryService } from '../../services/enquiryService';
import { formatDate } from '../../utils/date';
import { SEOHead } from '../../components/layout/SEOHead';
import { PersonAvatar } from '../../utils/avatarHelper';

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

  // Selected Log for Slide-over Detail Drawer
  const [selectedLog, setSelectedLog] = useState<ActivityLogWithActor | null>(null);

  // Staff list for actor filter
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>([]);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

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
    } catch (err: any) {
      setError(err.message || 'Failed to load system activity logs.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, selectedAction, selectedEntity, selectedActor, searchTerm, dateFilter, calculateDateRange]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setPage(1);
  };

  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Timestamp', 'Actor Name', 'Actor Email', 'Action', 'Entity Type', 'Entity ID', 'Description'];
    const rows = logs.map((log) => [
      log.created_at,
      log.actor_profile?.full_name || 'System',
      log.actor_profile?.email || 'N/A',
      log.action,
      log.entity_type,
      log.entity_id || 'N/A',
      `"${(log.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `system_activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CREATED') || act.includes('INSERT')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Created
        </span>
      );
    }
    if (act.includes('UPDATED') || act.includes('STATUS') || act.includes('ASSIGN')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          {action.replace(/_/g, ' ')}
        </span>
      );
    }
    if (act.includes('DELETED')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Deleted
        </span>
      );
    }
    if (act.includes('AUTH_LOGIN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <LogIn className="w-3 h-3" /> Login
        </span>
      );
    }
    if (act.includes('AUTH_LOGOUT')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <LogOut className="w-3 h-3" /> Logout
        </span>
      );
    }
    if (act.includes('USER_')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
          <UserCheck className="w-3 h-3" /> Staff Role
        </span>
      );
    }
    if (act.includes('PRODUCT_')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Layers className="w-3 h-3" /> Product
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
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
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
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
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
        >
          <span>View Product</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      );
    }
    return null;
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <SEOHead
        title="System Activity Logs | Akira Precision Automation LLP Admin"
        description="Immutable audit trail of enquiry lifecycle events, CRM touchpoints, auth, and catalogue changes."
      />

      <div className="space-y-4 max-w-7xl mx-auto pb-12 font-sans text-gray-900">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              System Activity Logs
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Immutable audit trail of enquiry lifecycle events, CRM touchpoints, auth, and catalogue changes.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={exportCSV}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs disabled:opacity-50"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={fetchLogs}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs disabled:opacity-50"
              title="Refresh logs"
              aria-label="Refresh logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar (Clean Pills & Search) */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                placeholder="Search audit descriptions, users, IDs..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 placeholder:text-gray-400"
              />
            </div>

            {/* Date Preset Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mr-1">Date:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'today', label: 'Today' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleFilterChange(setDateFilter, d.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    dateFilter === d.id
                      ? 'bg-gray-900 text-white shadow-2xs'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filters: Action, Entity, Actor */}
          <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-gray-100 text-xs text-gray-600">
            {/* Action Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Action:</span>
              <select
                value={selectedAction}
                onChange={(e) => handleFilterChange(setSelectedAction, e.target.value)}
                className="px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700"
              >
                <option value="all">All Actions</option>
                <option value="ENQUIRY_CREATED">Enquiry Created</option>
                <option value="ENQUIRY_STATUS_CHANGED">Enquiry Status Changed</option>
                <option value="ENQUIRY_ASSIGNED">Enquiry Assigned</option>
                <option value="FOLLOWUP_CREATED">Followup Created</option>
                <option value="FOLLOWUP_COMPLETED">Followup Completed</option>
                <option value="AUTH_LOGIN">User Login</option>
                <option value="PRODUCT_CREATED">Product Created</option>
                <option value="PRODUCT_UPDATED">Product Updated</option>
                <option value="PRODUCT_DELETED">Product Deleted</option>
                <option value="USER_ROLE_CHANGED">User Role Changed</option>
              </select>
            </div>

            {/* Entity Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Entity:</span>
              <select
                value={selectedEntity}
                onChange={(e) => handleFilterChange(setSelectedEntity, e.target.value)}
                className="px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700"
              >
                <option value="all">All Entities</option>
                <option value="enquiry">Enquiries</option>
                <option value="followup">Follow-ups</option>
                <option value="product">Products</option>
                <option value="profile">Staff Profiles</option>
                <option value="auth">Authentication</option>
              </select>
            </div>

            {/* Actor Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actor:</span>
              <select
                value={selectedActor}
                onChange={(e) => handleFilterChange(setSelectedActor, e.target.value)}
                className="px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700"
              >
                <option value="all">All Actors</option>
                {staffProfiles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || s.email} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{logs.length}</span> of{' '}
              <span className="font-bold text-gray-900">{total}</span> events
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold">Unable to load audit logs</p>
              <p className="text-rose-600 mt-0.5">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchLogs}
              className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-md hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 animate-pulse flex items-center justify-between">
                <div className="space-y-2">
                  <div className="w-48 h-4 bg-gray-200 rounded" />
                  <div className="w-96 h-3 bg-gray-100 rounded" />
                </div>
                <div className="w-20 h-6 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && logs.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No activity recorded</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              There are no audit events matching the selected filters.
            </p>
          </div>
        )}

        {/* People Table Format: Activity Logs Table */}
        {!loading && !error && logs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                {/* Table Header */}
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/40 text-[12px] font-medium text-gray-500">
                    <th className="py-3.5 pl-5 pr-3 w-10">
                      <Shield className="w-4 h-4 text-gray-400" />
                    </th>
                    <th className="py-3.5 px-4 font-medium whitespace-nowrap">Date &amp; Time</th>
                    <th className="py-3.5 px-4 font-medium">Actor</th>
                    <th className="py-3.5 px-4 font-medium">Action</th>
                    <th className="py-3.5 px-4 font-medium">Entity</th>
                    <th className="py-3.5 px-4 font-medium">Description</th>
                    <th className="py-3.5 px-4 font-medium text-right whitespace-nowrap">Details</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-gray-100 text-xs">
                  {logs.map((log) => {
                    const actorName = log.actor_profile?.full_name || log.actor_profile?.email || 'System API';

                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                      >
                        {/* Icon column */}
                        <td className="py-3.5 pl-5 pr-3 w-10">
                          <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-600">
                            <History className="w-3.5 h-3.5" />
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{formatDate(log.created_at)}</span>
                          </div>
                        </td>

                        {/* Actor with Avatar */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <PersonAvatar name={actorName} size="sm" />
                            <div>
                              <span className="font-medium text-gray-900 text-xs block group-hover:text-blue-600 transition-colors">
                                {actorName}
                              </span>
                              {log.actor_profile?.role && (
                                <span className="text-[10px] uppercase font-bold text-gray-400">
                                  {log.actor_profile.role}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getActionBadge(log.action)}
                        </td>

                        {/* Entity */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 inline-block">
                              {log.entity_type} {log.entity_id ? `#${log.entity_id.substring(0, 8)}` : ''}
                            </span>
                            <div>{getEntityLink(log)}</div>
                          </div>
                        </td>

                        {/* Description (Click to view full description) */}
                        <td className="py-3.5 px-4">
                          <p className="text-xs text-gray-800 font-medium line-clamp-1 max-w-md">
                            {log.description || log.action}
                          </p>
                        </td>

                        {/* Details Action Button */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 hover:bg-gray-900 hover:text-white transition-colors shadow-2xs"
                            title="View Full Description & Metadata"
                          >
                            <span>View Details</span>
                            <Eye className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Matching People Table Format */}
            <div className="border-t border-gray-100 px-6 py-3.5 flex items-center justify-between text-xs text-gray-500">
              <div>
                Page {page} of {totalPages} ({total} total events)
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = page === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-gray-900 text-white shadow-2xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && (
                  <>
                    <span className="px-1 text-gray-400 font-mono">...</span>
                    <button
                      type="button"
                      onClick={() => setPage(totalPages)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                        page === totalPages
                          ? 'bg-gray-900 text-white shadow-2xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Drawer for Full Description & Metadata (People Format) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col transform transition-transform duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-detail-title"
          >
            {/* Sticky Header Bar */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md z-20 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-gray-700">
                  <History className="w-3.5 h-3.5" />
                </div>
                <span>&gt;</span>
                <span className="text-gray-900 font-semibold">Audit Event</span>
                <span>&gt;</span>
                <span className="font-mono text-gray-600 text-[11px]">{selectedLog.id.substring(0, 8)}</span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close activity detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Title & Summary */}
            <div className="p-6 space-y-5 flex-1 bg-[#FAFAFA]">
              <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                      Activity Action
                    </span>
                    <h2 id="activity-detail-title" className="text-base font-bold text-gray-900">
                      {selectedLog.action.replace(/_/g, ' ')}
                    </h2>
                  </div>
                  <div>{getActionBadge(selectedLog.action)}</div>
                </div>

                {/* Full Description Box */}
                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-800 leading-relaxed font-medium">
                  {selectedLog.description || selectedLog.action}
                </div>
              </div>

              {/* Event Attributes Grid */}
              <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-3 text-xs">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-1 border-b border-gray-100">
                  Event Parameters
                </h3>

                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Timestamp</span>
                  <span className="font-mono text-gray-800">{formatDate(selectedLog.created_at)}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Actor Profile</span>
                  <div className="flex items-center gap-1.5">
                    <PersonAvatar
                      name={selectedLog.actor_profile?.full_name || selectedLog.actor_profile?.email || 'System'}
                      size="sm"
                    />
                    <span className="font-semibold text-gray-900">
                      {selectedLog.actor_profile?.full_name || selectedLog.actor_profile?.email || 'System / Direct API'}
                    </span>
                    {selectedLog.actor_profile?.role && (
                      <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1 rounded">
                        {selectedLog.actor_profile.role}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Target Entity</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-700 uppercase bg-gray-100 px-2 py-0.5 rounded">
                      {selectedLog.entity_type} {selectedLog.entity_id ? `#${selectedLog.entity_id.substring(0, 8)}` : ''}
                    </span>
                    {getEntityLink(selectedLog)}
                  </div>
                </div>
              </div>

              {/* Field Diffs (Before vs After) */}
              {Array.isArray(selectedLog.metadata?.diff) && selectedLog.metadata.diff.length > 0 ? (
                <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Property Transitions
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-500">
                          <th className="pb-1.5">Field</th>
                          <th className="pb-1.5">Previous Value</th>
                          <th className="pb-1.5">New Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(selectedLog.metadata.diff as FieldDiff[]).map((d, i) => (
                          <tr key={i} className="font-mono text-[11px]">
                            <td className="py-1.5 text-gray-700 font-semibold">{d.field}</td>
                            <td className="py-1.5 text-rose-600 line-through max-w-[140px] truncate">
                              {typeof d.from === 'object' ? JSON.stringify(d.from) : String(d.from ?? 'null')}
                            </td>
                            <td className="py-1.5 text-emerald-600 font-bold max-w-[140px] truncate">
                              {typeof d.to === 'object' ? JSON.stringify(d.to) : String(d.to ?? 'null')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {/* Payload & Raw Metadata */}
              {Boolean(selectedLog.new_value || selectedLog.old_value || selectedLog.metadata) ? (
                <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-2">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Full Payload JSON
                  </h3>
                  <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed">
                    {JSON.stringify(
                      {
                        new_value: selectedLog.new_value,
                        old_value: selectedLog.old_value,
                        metadata: selectedLog.metadata,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
