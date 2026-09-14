import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  Building2,
  Calendar,
  Plus,
  MessageSquare,
  ArrowUpRight,
  Check,
  X,
  FileText,
  RotateCw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  FollowupWithEnquiry,
  FollowupType,
  FollowupTimeframe,
  FollowupPriority,
  StaffProfile,
} from '../../types/database';
import { followupService } from '../../services/followupService';
import { enquiryService } from '../../services/enquiryService';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/date';

// ─── Timeframe helpers (client-side, fixes count bug) ───────────────────────
function getNow() {
  return new Date();
}
function getTodayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function getTomorrowStart() {
  const d = getTodayStart();
  d.setDate(d.getDate() + 1);
  return d;
}

function matchesTimeframe(item: FollowupWithEnquiry, tf: FollowupTimeframe): boolean {
  const scheduledAt = new Date(item.scheduled_at);
  const isCompleted = item.status === 'completed';
  const isCancelled = item.status === 'cancelled';
  const isPending = !isCompleted && !isCancelled;
  const now = getNow();
  const todayStart = getTodayStart();
  const tomorrowStart = getTomorrowStart();

  switch (tf) {
    case 'overdue':
      return isPending && scheduledAt < now;
    case 'today':
      return isPending && scheduledAt >= todayStart && scheduledAt < tomorrowStart;
    case 'upcoming':
      return isPending && scheduledAt >= tomorrowStart;
    case 'completed':
      return isCompleted;
    case 'cancelled':
      return isCancelled;
    case 'all':
    default:
      return true;
  }
}

// ─── Tab definition ──────────────────────────────────────────────────────────
interface TabOption {
  key: FollowupTimeframe;
  label: string;
  activeClass: string;
  badgeClass: string;
  activeBadgeClass: string;
}

const TABS: TabOption[] = [
  {
    key: 'all',
    label: 'All Scheduled',
    activeClass: 'bg-gray-900 text-white border-gray-900 shadow-sm',
    badgeClass: 'bg-gray-100 text-gray-700',
    activeBadgeClass: 'bg-white/20 text-white',
  },
  {
    key: 'overdue',
    label: 'Overdue',
    activeClass: 'bg-rose-600 text-white border-rose-600 shadow-sm',
    badgeClass: 'bg-rose-100 text-rose-700',
    activeBadgeClass: 'bg-white/20 text-white',
  },
  {
    key: 'today',
    label: 'Due Today',
    activeClass: 'bg-amber-500 text-white border-amber-500 shadow-sm',
    badgeClass: 'bg-amber-100 text-amber-700',
    activeBadgeClass: 'bg-white/20 text-white',
  },
  {
    key: 'upcoming',
    label: 'Upcoming',
    activeClass: 'bg-blue-600 text-white border-blue-600 shadow-sm',
    badgeClass: 'bg-blue-100 text-blue-700',
    activeBadgeClass: 'bg-white/20 text-white',
  },
  {
    key: 'completed',
    label: 'Completed',
    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    activeBadgeClass: 'bg-white/20 text-white',
  },
];

export const AdminFollowups: React.FC = () => {
  const [followups, setFollowups] = useState<FollowupWithEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [timeframe, setTimeframe] = useState<FollowupTimeframe>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);

  // Modals
  const [completingFollowup, setCompletingFollowup] = useState<FollowupWithEnquiry | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextDate, setNextDate] = useState('');
  const [nextType, setNextType] = useState<FollowupType>('call');
  const [nextNotes, setNextNotes] = useState('');
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false);
  const [outcomeError, setOutcomeError] = useState<string | null>(null);

  // Quick Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [recentEnquiries, setRecentEnquiries] = useState<{ id: string; name: string; company: string | null }[]>([]);
  const [targetEnquiryId, setTargetEnquiryId] = useState('');
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [newScheduleType, setNewScheduleType] = useState<FollowupType>('call');
  const [newScheduleNotes, setNewScheduleNotes] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // ─── Fetch all followups (no timeframe) — count is derived client-side ───
  const fetchFollowups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await followupService.getFollowups({
        type: selectedType !== 'all' ? (selectedType as FollowupType) : undefined,
        assignedTo: selectedStaff !== 'all' ? selectedStaff : undefined,
        priority: selectedPriority !== 'all' ? (selectedPriority as FollowupPriority) : undefined,
        limit: 500,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setFollowups(res.followups);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred loading CRM follow-ups.');
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedStaff, selectedPriority]);

  useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  useEffect(() => {
    userService.getAssignableStaff().then(setStaffList);
  }, []);

  // ─── Client-side counts (fixes the "all tabs show same number" bug) ───────
  const counts = useMemo<Record<FollowupTimeframe, number>>(() => {
    return {
      all: followups.length,
      overdue: followups.filter((f) => matchesTimeframe(f, 'overdue')).length,
      today: followups.filter((f) => matchesTimeframe(f, 'today')).length,
      upcoming: followups.filter((f) => matchesTimeframe(f, 'upcoming')).length,
      completed: followups.filter((f) => matchesTimeframe(f, 'completed')).length,
      cancelled: followups.filter((f) => matchesTimeframe(f, 'cancelled')).length,
    };
  }, [followups]);

  // ─── Combined filter: timeframe + search ─────────────────────────────────
  const filteredFollowups = useMemo(() => {
    let list = followups.filter((f) => matchesTimeframe(f, timeframe));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((f) => {
        return (
          f.enquiry?.name?.toLowerCase().includes(q) ||
          f.enquiry?.company?.toLowerCase().includes(q) ||
          f.notes?.toLowerCase().includes(q) ||
          f.outcome?.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [followups, timeframe, searchQuery]);

  // ─── Quick Schedule Modal ─────────────────────────────────────────────────
  const openQuickScheduleModal = async () => {
    setShowScheduleModal(true);
    setScheduleError(null);
    try {
      const res = await enquiryService.getEnquiries({ limit: 30 });
      if (res.enquiries.length > 0) {
        setRecentEnquiries(
          res.enquiries.map((e) => ({ id: e.id, name: e.name, company: e.company }))
        );
        if (!targetEnquiryId) setTargetEnquiryId(res.enquiries[0].id);
      }
    } catch {
      // ignore
    }
  };

  const handleCreateFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEnquiryId) { setScheduleError('Please select a customer enquiry.'); return; }
    if (!newScheduleDate) { setScheduleError('Please select a scheduled date and time.'); return; }

    setIsScheduling(true);
    setScheduleError(null);

    const res = await followupService.createFollowup({
      enquiryId: targetEnquiryId,
      scheduledAt: new Date(newScheduleDate).toISOString(),
      type: newScheduleType,
      notes: newScheduleNotes.trim() || undefined,
    });

    setIsScheduling(false);

    if (res.error) {
      setScheduleError(res.error);
    } else {
      setShowScheduleModal(false);
      setNewScheduleDate('');
      setNewScheduleNotes('');
      fetchFollowups();
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingFollowup) return;
    if (!outcomeNotes.trim()) {
      setOutcomeError('Please enter notes or outcome for this follow-up.');
      return;
    }

    setIsSubmittingOutcome(true);
    setOutcomeError(null);

    const res = await followupService.completeFollowup(
      completingFollowup.id,
      outcomeNotes.trim(),
      completingFollowup.enquiry_id
    );

    if (res.error) {
      setOutcomeError(res.error);
      setIsSubmittingOutcome(false);
      return;
    }

    if (scheduleNext && nextDate) {
      await followupService.scheduleNextFollowup(
        completingFollowup.id,
        completingFollowup.enquiry_id,
        new Date(nextDate).toISOString(),
        nextType,
        nextNotes.trim() || undefined
      );
    }

    setIsSubmittingOutcome(false);
    setCompletingFollowup(null);
    setOutcomeNotes('');
    setScheduleNext(false);
    setNextDate('');
    setNextNotes('');
    fetchFollowups();
  };

  const handleCancelFollowup = async (followup: FollowupWithEnquiry) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled follow-up?')) return;
    const res = await followupService.cancelFollowup(followup.id, followup.enquiry_id);
    if (res.error) {
      alert(`Error cancelling follow-up: ${res.error}`);
    } else {
      fetchFollowups();
    }
  };

  // ─── Badge helpers ────────────────────────────────────────────────────────
  const getTypeBadge = (type: FollowupType) => {
    switch (type) {
      case 'call':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Phone className="w-3 h-3" /> Call
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Mail className="w-3 h-3" /> Email
          </span>
        );
      case 'meeting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Calendar className="w-3 h-3" /> Meeting
          </span>
        );
      case 'demo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3 h-3" /> Demo
          </span>
        );
      case 'quotation':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <FileText className="w-3 h-3" /> Quotation
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <MessageSquare className="w-3 h-3" /> {type}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority?: string | null) => {
    if (!priority) return null;
    const styles: Record<string, string> = {
      urgent: 'bg-rose-100 text-rose-700',
      high: 'bg-amber-100 text-amber-700',
      medium: 'bg-sky-100 text-sky-700',
      low: 'bg-slate-100 text-slate-600',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${styles[priority] || styles.low}`}>
        {priority}
      </span>
    );
  };

  const isOverdue = (scheduledAt: string, status: string) =>
    status !== 'completed' && status !== 'cancelled' && new Date(scheduledAt).getTime() < Date.now();

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 font-sans text-gray-900">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CRM Follow-ups</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track customer calls, demos, quotations, and scheduled touchpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchFollowups}
            disabled={loading}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-colors flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
            title="Refresh list"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openQuickScheduleModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule Follow-up
          </button>
        </div>
      </div>

      {/* ── Status Tabs (counts computed client-side — no backend bug) ─── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {TABS.map((tab) => {
          const isSelected = timeframe === tab.key;
          const count = counts[tab.key] ?? 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTimeframe(tab.key)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm whitespace-nowrap shrink-0 border ${
                isSelected
                  ? tab.activeClass
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {tab.key === 'overdue' && <AlertTriangle className="w-3.5 h-3.5" />}
              {tab.key === 'today' && <Clock className="w-3.5 h-3.5" />}
              {tab.key === 'upcoming' && <Calendar className="w-3.5 h-3.5" />}
              {tab.key === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                  isSelected ? tab.activeBadgeClass : tab.badgeClass
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search + Filters ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search customer, company or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="demo">Demo</option>
              <option value="quotation">Quotation</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Staff filter row */}
        <div className="flex items-center gap-3">
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="px-2.5 py-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[200px]"
          >
            <option value="all">All Staff</option>
            <option value="unassigned">Unassigned</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name || s.email}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-500">
            Showing <span className="font-bold text-gray-800">{filteredFollowups.length}</span> of{' '}
            <span className="font-bold text-gray-800">{followups.length}</span>
          </span>
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold">Unable to load follow-up entries</p>
            <p className="text-rose-600 mt-0.5">{error}</p>
          </div>
          <button
            onClick={fetchFollowups}
            className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-md hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Loading skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 px-6 py-4 border-b border-gray-100 last:border-0">
              <div className="w-8 h-8 bg-gray-100 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="w-40 h-3 bg-gray-100 rounded" />
                <div className="w-64 h-2.5 bg-gray-100 rounded" />
              </div>
              <div className="w-24 h-7 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!loading && !error && filteredFollowups.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <CalendarClock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No scheduled follow-ups found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {timeframe === 'overdue'
              ? 'Great work! No overdue follow-ups at this time.'
              : timeframe === 'today'
              ? 'No follow-ups scheduled for today.'
              : 'No follow-ups match the selected filters.'}
          </p>
          <button
            onClick={openQuickScheduleModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> Schedule Follow-up
          </button>
        </div>
      )}

      {/* ── Follow-ups Table ──────────────────────────────────────────────── */}
      {!loading && !error && filteredFollowups.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Table head */}
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Scheduled</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Assigned</th>
                  <th className="py-3.5 px-4">Notes / Outcome</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              {/* Table body */}
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredFollowups.map((item) => {
                  const overdue = isOverdue(item.scheduled_at, item.status);
                  const isCompleted = item.status === 'completed';
                  const isCancelled = item.status === 'cancelled';

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors group ${
                        overdue
                          ? 'bg-rose-50/30 hover:bg-rose-50/50'
                          : isCompleted
                          ? 'opacity-80 hover:bg-gray-50/60'
                          : isCancelled
                          ? 'opacity-50 hover:bg-gray-50/40'
                          : 'hover:bg-gray-50/60'
                      }`}
                    >
                      {/* Customer */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${
                              overdue
                                ? 'bg-rose-100 text-rose-700'
                                : isCompleted
                                ? 'bg-emerald-100 text-emerald-700'
                                : isCancelled
                                ? 'bg-gray-100 text-gray-500'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {(item.enquiry?.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            {item.enquiry ? (
                              <Link
                                to={`/admin/enquiries/${item.enquiry_id}`}
                                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1 group-hover:text-blue-600 text-sm"
                              >
                                {item.enquiry.name}
                                <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              </Link>
                            ) : (
                              <span className="font-semibold text-gray-900 text-sm">
                                #{item.enquiry_id.substring(0, 8)}
                              </span>
                            )}
                            {item.enquiry?.company && (
                              <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                                <Building2 className="w-3 h-3" />
                                {item.enquiry.company}
                              </div>
                            )}
                            {item.title && (
                              <div className="text-[11px] text-gray-500 mt-0.5 italic truncate max-w-[180px]">
                                {item.title}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getTypeBadge(item.type)}
                      </td>

                      {/* Scheduled */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-mono">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {formatDate(item.scheduled_at)}
                          </div>
                          {/* Status badge */}
                          {overdue && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wide w-fit">
                              Overdue
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wide w-fit">
                              Completed
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-500 text-white uppercase tracking-wide w-fit">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getPriorityBadge(item.priority) ?? (
                          <span className="text-gray-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Assigned */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.assigned_profile ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                              {(item.assigned_profile.full_name || item.assigned_profile.email).charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[11px] text-gray-700 truncate max-w-[100px]">
                              {item.assigned_profile.full_name || item.assigned_profile.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Notes / Outcome */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        {item.outcome ? (
                          <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 truncate" title={item.outcome}>
                            <span className="font-semibold">Outcome:</span> {item.outcome}
                          </div>
                        ) : item.notes ? (
                          <p className="text-[11px] text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 truncate" title={item.notes}>
                            {item.notes}
                          </p>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">No notes</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Phone */}
                          {item.enquiry?.phone && (
                            <a
                              href={`tel:${item.enquiry.phone}`}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
                              title={`Call ${item.enquiry.phone}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Email */}
                          {item.enquiry?.email && (
                            <a
                              href={`mailto:${item.enquiry.email}`}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
                              title={`Email ${item.enquiry.email}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Complete / Cancel */}
                          {!isCompleted && !isCancelled && (
                            <>
                              <button
                                onClick={() => {
                                  setCompletingFollowup(item);
                                  setOutcomeNotes('');
                                  setScheduleNext(false);
                                  setOutcomeError(null);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                <Check className="w-3 h-3" /> Complete
                              </button>
                              <button
                                onClick={() => handleCancelFollowup(item)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-gray-200"
                                title="Cancel Follow-up"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Details */}
                          <Link
                            to={`/admin/followups/${item.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-[11px] font-semibold transition-colors"
                            title="View full follow-up details"
                          >
                            Details
                          </Link>

                          {/* Dossier */}
                          <Link
                            to={`/admin/enquiries/${item.enquiry_id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            Dossier
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing <span className="font-semibold text-gray-800">{filteredFollowups.length}</span> follow-ups
            </span>
            <button
              onClick={openQuickScheduleModal}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Schedule new
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: Complete Follow-up ───────────────────────────────────── */}
      {completingFollowup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Complete Follow-up</h3>
                  <p className="text-xs text-gray-500">
                    Record outcome for {completingFollowup.enquiry?.name || 'Customer'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCompletingFollowup(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 pt-4">
              {outcomeError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                  {outcomeError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Outcome &amp; Discussion Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="Summarize client response, key requirements discussed, or next agreements..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleNext}
                    onChange={(e) => setScheduleNext(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    Schedule Next Follow-up with this customer
                  </span>
                </label>

                {scheduleNext && (
                  <div className="space-y-3 pt-2 border-t border-gray-200/60">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Date &amp; Time *</label>
                        <input
                          type="datetime-local"
                          required={scheduleNext}
                          value={nextDate}
                          onChange={(e) => setNextDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Type</label>
                        <select
                          value={nextType}
                          onChange={(e) => setNextType(e.target.value as FollowupType)}
                          className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                        >
                          <option value="call">Call</option>
                          <option value="email">Email</option>
                          <option value="meeting">Meeting</option>
                          <option value="demo">Demo</option>
                          <option value="quotation">Quotation</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Next Agenda / Notes</label>
                      <input
                        type="text"
                        value={nextNotes}
                        onChange={(e) => setNextNotes(e.target.value)}
                        placeholder="e.g. Send formal quote revision #2"
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingFollowup(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOutcome}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmittingOutcome ? 'Saving...' : 'Save & Mark Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Quick Schedule Follow-up ─────────────────────────────── */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Schedule CRM Follow-up</h3>
                  <p className="text-xs text-gray-500">Add a new touchpoint or reminder</p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowup} className="space-y-4 pt-4">
              {scheduleError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                  {scheduleError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Select Customer / Enquiry *
                </label>
                <select
                  required
                  value={targetEnquiryId}
                  onChange={(e) => setTargetEnquiryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="">-- Choose customer enquiry --</option>
                  {recentEnquiries.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} {e.company ? `(${e.company})` : ''} - #{e.id.substring(0, 8)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Date &amp; Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newScheduleDate}
                    onChange={(e) => setNewScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Activity Type
                  </label>
                  <select
                    value={newScheduleType}
                    onChange={(e) => setNewScheduleType(e.target.value as FollowupType)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="demo">Demo</option>
                    <option value="quotation">Quotation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Notes &amp; Discussion Goal
                </label>
                <textarea
                  rows={3}
                  value={newScheduleNotes}
                  onChange={(e) => setNewScheduleNotes(e.target.value)}
                  placeholder="e.g. Call engineering manager to discuss dial gauge repeatability specs"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isScheduling ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFollowups;
