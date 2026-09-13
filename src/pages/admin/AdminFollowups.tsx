import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  Building2,
  Calendar,
  ChevronRight,
  RefreshCw,
  Plus,
  MessageSquare,
  ArrowUpRight,
  Check,
  X,
  FileText,
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

export const AdminFollowups: React.FC = () => {
  const [followups, setFollowups] = useState<FollowupWithEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

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

  // Quick Schedule Modal for any enquiry
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [recentEnquiries, setRecentEnquiries] = useState<{ id: string; name: string; company: string | null }[]>([]);
  const [targetEnquiryId, setTargetEnquiryId] = useState('');
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [newScheduleType, setNewScheduleType] = useState<FollowupType>('call');
  const [newScheduleNotes, setNewScheduleNotes] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Summary counts for tabs
  const [counts, setCounts] = useState<{
    overdue: number;
    today: number;
    upcoming: number;
    completed: number;
    all: number;
  }>({
    overdue: 0,
    today: 0,
    upcoming: 0,
    completed: 0,
    all: 0,
  });

  // Fetch follow-ups
  const fetchFollowups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await followupService.getFollowups({
        timeframe: timeframe !== 'all' ? timeframe : undefined,
        type: selectedType !== 'all' ? (selectedType as FollowupType) : undefined,
        assignedTo: selectedStaff !== 'all' ? selectedStaff : undefined,
        priority: selectedPriority !== 'all' ? (selectedPriority as FollowupPriority) : undefined,
        limit: 100,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setFollowups(res.followups);
        setTotal(res.total);
      }

      // Also refresh summary counts across timeframes
      const [overdueRes, todayRes, upcomingRes, completedRes, allRes] = await Promise.all([
        followupService.getFollowups({ timeframe: 'overdue', limit: 1 }),
        followupService.getFollowups({ timeframe: 'today', limit: 1 }),
        followupService.getFollowups({ timeframe: 'upcoming', limit: 1 }),
        followupService.getFollowups({ timeframe: 'completed', limit: 1 }),
        followupService.getFollowups({ limit: 1 }),
      ]);

      setCounts({
        overdue: overdueRes.total,
        today: todayRes.total,
        upcoming: upcomingRes.total,
        completed: completedRes.total,
        all: allRes.total,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred loading CRM follow-ups.');
    } finally {
      setLoading(false);
    }
  }, [timeframe, selectedType, selectedStaff, selectedPriority]);

  useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  useEffect(() => {
    userService.getAssignableStaff().then(setStaffList);
  }, []);

  // Load enquiries for quick schedule modal
  const openQuickScheduleModal = async () => {
    setShowScheduleModal(true);
    setScheduleError(null);
    try {
      const res = await enquiryService.getEnquiries({ limit: 30 });
      if (res.enquiries.length > 0) {
        setRecentEnquiries(
          res.enquiries.map((e) => ({
            id: e.id,
            name: e.name,
            company: e.company,
          }))
        );
        if (!targetEnquiryId) {
          setTargetEnquiryId(res.enquiries[0].id);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleCreateFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEnquiryId) {
      setScheduleError('Please select a customer enquiry.');
      return;
    }
    if (!newScheduleDate) {
      setScheduleError('Please select a scheduled date and time.');
      return;
    }

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

    // Schedule successive followup if requested
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

  // Filtered followups by search query
  const filteredFollowups = useMemo(() => {
    if (!searchQuery.trim()) return followups;
    const q = searchQuery.toLowerCase();
    return followups.filter((f) => {
      const nameMatch = f.enquiry?.name?.toLowerCase().includes(q);
      const companyMatch = f.enquiry?.company?.toLowerCase().includes(q);
      const notesMatch = f.notes?.toLowerCase().includes(q);
      const outcomeMatch = f.outcome?.toLowerCase().includes(q);
      return nameMatch || companyMatch || notesMatch || outcomeMatch;
    });
  }, [followups, searchQuery]);

  const getTypeBadge = (type: FollowupType) => {
    switch (type) {
      case 'call':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Phone className="w-3 h-3" /> Call
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Mail className="w-3 h-3" /> Email
          </span>
        );
      case 'meeting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Calendar className="w-3 h-3" /> Meeting
          </span>
        );
      case 'demo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3 h-3" /> Demo
          </span>
        );
      case 'quotation':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <FileText className="w-3 h-3" /> Quotation
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <MessageSquare className="w-3 h-3" /> {type}
          </span>
        );
    }
  };

  const isOverdue = (scheduledAt: string, status: string) => {
    return status !== 'completed' && status !== 'cancelled' && new Date(scheduledAt).getTime() < Date.now();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 shadow-sm">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0B1F33] tracking-tight">CRM Follow-ups</h1>
              <p className="text-sm text-slate-500">
                Track customer calls, demos, quotations, and scheduled touchpoints
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchFollowups}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={openQuickScheduleModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Schedule Follow-up
          </button>
        </div>
      </div>

      {/* Timeframe Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        <button
          onClick={() => setTimeframe('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            timeframe === 'all'
              ? 'bg-[#0B1F33] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          All Scheduled
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              timeframe === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setTimeframe('overdue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            timeframe === 'overdue'
              ? 'bg-rose-600 text-white shadow-sm'
              : counts.overdue > 0
              ? 'text-rose-600 hover:bg-rose-50 bg-rose-50/60'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Overdue
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              timeframe === 'overdue'
                ? 'bg-white/20 text-white'
                : counts.overdue > 0
                ? 'bg-rose-200 text-rose-800'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {counts.overdue}
          </span>
        </button>

        <button
          onClick={() => setTimeframe('today')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            timeframe === 'today'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Due Today
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              timeframe === 'today' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {counts.today}
          </span>
        </button>

        <button
          onClick={() => setTimeframe('upcoming')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            timeframe === 'upcoming'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Upcoming
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              timeframe === 'upcoming' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {counts.upcoming}
          </span>
        </button>

        <button
          onClick={() => setTimeframe('completed')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            timeframe === 'completed'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Completed
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              timeframe === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {counts.completed}
          </span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer, company or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Staff Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Staff:</span>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 max-w-[140px]"
            >
              <option value="all">All Staff</option>
              <option value="unassigned">Unassigned</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name || s.email}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredFollowups.length}</span> of{' '}
            <span className="font-bold text-slate-800">{total}</span>
          </span>
        </div>
      </div>

      {/* Error state */}
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

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse flex items-center justify-between">
              <div className="space-y-2">
                <div className="w-40 h-4 bg-slate-200 rounded"></div>
                <div className="w-64 h-3 bg-slate-100 rounded"></div>
              </div>
              <div className="w-24 h-8 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredFollowups.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <CalendarClock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No scheduled follow-ups found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {timeframe === 'overdue'
              ? 'Great work! There are no overdue follow-ups at this time.'
              : timeframe === 'today'
              ? 'No follow-up calls or meetings scheduled for today.'
              : 'There are no follow-ups matching the selected criteria.'}
          </p>
          <button
            onClick={openQuickScheduleModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule Follow-up
          </button>
        </div>
      )}

      {/* Follow-ups List */}
      {!loading && !error && filteredFollowups.length > 0 && (
        <div className="space-y-3">
          {filteredFollowups.map((item) => {
            const overdue = isOverdue(item.scheduled_at, item.status);
            const isCompleted = item.status === 'completed';
            const isCancelled = item.status === 'cancelled';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border transition-all hover:shadow-sm ${
                  overdue
                    ? 'border-rose-300 bg-rose-50/20'
                    : isCompleted
                    ? 'border-slate-200 opacity-80'
                    : isCancelled
                    ? 'border-slate-200 opacity-60 line-through'
                    : 'border-slate-200'
                } p-5 flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                {/* Left: Customer & Details */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      overdue
                        ? 'bg-rose-100 text-rose-700'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : isCancelled
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : overdue ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <CalendarClock className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getTypeBadge(item.type)}
                      {item.priority && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                          item.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.priority}
                        </span>
                      )}
                      {item.assigned_profile && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Assigned: {item.assigned_profile.full_name || item.assigned_profile.email}
                        </span>
                      )}
                      {overdue && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white uppercase tracking-wider">
                          Overdue
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white uppercase tracking-wider">
                          Completed
                        </span>
                      )}
                      {isCancelled && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-600 text-white uppercase tracking-wider">
                          Cancelled
                        </span>
                      )}

                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(item.scheduled_at)}
                      </span>
                    </div>

                    {item.title && (
                      <div className="text-xs font-bold text-slate-800 pt-0.5">
                        {item.title}
                      </div>
                    )}

                    <div className="pt-1">
                      {item.enquiry ? (
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/admin/enquiries/${item.enquiry_id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1.5 transition-colors group"
                          >
                            <span>{item.enquiry.name}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          </Link>
                          {item.enquiry.company && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {item.enquiry.company}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Enquiry #{item.enquiry_id.substring(0, 8)}</span>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-sm text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 max-w-2xl mt-1">
                        {item.notes}
                      </p>
                    )}

                    {item.outcome && (
                      <div className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 max-w-2xl mt-1">
                        <span className="font-semibold">Outcome:</span> {item.outcome}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Quick Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {/* Phone call shortcut */}
                  {item.enquiry?.phone && (
                    <a
                      href={`tel:${item.enquiry.phone}`}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                      title={`Call ${item.enquiry.phone}`}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}

                  {/* Email shortcut */}
                  {item.enquiry?.email && (
                    <a
                      href={`mailto:${item.enquiry.email}`}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                      title={`Email ${item.enquiry.email}`}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}

                  {/* Complete / Cancel Buttons for active followups */}
                  {!isCompleted && !isCancelled && (
                    <>
                      <button
                        onClick={() => {
                          setCompletingFollowup(item);
                          setOutcomeNotes('');
                          setScheduleNext(false);
                          setOutcomeError(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Complete
                      </button>

                      <button
                        onClick={() => handleCancelFollowup(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                        title="Cancel Follow-up"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* View Follow-up Details */}
                  <Link
                    to={`/admin/followups/${item.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
                    title="View full follow-up details"
                  >
                    <span>Details</span>
                  </Link>

                  {/* View Customer Details */}
                  <Link
                    to={`/admin/enquiries/${item.enquiry_id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <span>Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Complete Follow-up */}
      {completingFollowup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Complete Follow-up</h3>
                  <p className="text-xs text-slate-500">
                    Record outcome for {completingFollowup.enquiry?.name || 'Customer'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCompletingFollowup(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
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
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Outcome & Discussion Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="Summarize client response, key requirements discussed, or next agreements..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Toggle to schedule next */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleNext}
                    onChange={(e) => setScheduleNext(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Schedule Next Follow-up with this customer
                  </span>
                </label>

                {scheduleNext && (
                  <div className="space-y-3 pt-2 border-t border-slate-200/60">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Date & Time *</label>
                        <input
                          type="datetime-local"
                          required={scheduleNext}
                          value={nextDate}
                          onChange={(e) => setNextDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Type</label>
                        <select
                          value={nextType}
                          onChange={(e) => setNextType(e.target.value as FollowupType)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
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
                      <label className="block text-xs text-slate-600 mb-1">Next Agenda / Notes</label>
                      <input
                        type="text"
                        value={nextNotes}
                        onChange={(e) => setNextNotes(e.target.value)}
                        placeholder="e.g. Send formal quote revision #2"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingFollowup(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
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

      {/* MODAL: Quick Schedule Follow-up */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Schedule CRM Follow-up</h3>
                  <p className="text-xs text-slate-500">Add a new touchpoint or reminder</p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
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
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Select Customer / Enquiry *
                </label>
                <select
                  required
                  value={targetEnquiryId}
                  onChange={(e) => setTargetEnquiryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
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
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newScheduleDate}
                    onChange={(e) => setNewScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Activity Type
                  </label>
                  <select
                    value={newScheduleType}
                    onChange={(e) => setNewScheduleType(e.target.value as FollowupType)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
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
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notes & Discussion Goal
                </label>
                <textarea
                  rows={3}
                  value={newScheduleNotes}
                  onChange={(e) => setNewScheduleNotes(e.target.value)}
                  placeholder="e.g. Call engineering manager to discuss dial gauge repeatability specs"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
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
