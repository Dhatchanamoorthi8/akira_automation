import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Button,
  Chip,
  Table,
  Input,
  Select,
  ListBox,
  TextArea,
  Checkbox,
  Label,
  Modal,
  Form,
  DatePicker,
  DateField,
  Calendar,
  TimeField,
  TextField,
} from '@heroui/react';
import {
  DateValue,
  getLocalTimeZone,
  now,
} from '@internationalized/date';
import {
  CalendarClock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  Building2,
  Calendar as CalendarIcon,
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
} from '../../types/database';
import { followupService } from '../../services/followupService';
import { enquiryService } from '../../services/enquiryService';
import { attendanceService, StaffWithAttendanceStatus } from '../../services/attendanceService';
import { formatDate } from '../../utils/date';
import { SEOHead } from '../../components/layout/SEOHead';

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
}

const TABS: TabOption[] = [
  { key: 'all', label: 'All Scheduled' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'today', label: 'Due Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
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
  const [staffList, setStaffList] = useState<StaffWithAttendanceStatus[]>([]);

  // Modals
  const [completingFollowup, setCompletingFollowup] = useState<FollowupWithEnquiry | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextDateValue, setNextDateValue] = useState<DateValue | null>(null);
  const [nextType, setNextType] = useState<FollowupType>('call');
  const [nextNotes, setNextNotes] = useState('');
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false);
  const [outcomeError, setOutcomeError] = useState<string | null>(null);

  // Quick Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [recentEnquiries, setRecentEnquiries] = useState<{ id: string; name: string; company: string | null }[]>([]);
  const [targetEnquiryId, setTargetEnquiryId] = useState('');
  const [newScheduleDateValue, setNewScheduleDateValue] = useState<DateValue | null>(null);
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
    attendanceService.getActiveStaffWithAttendance(true).then(setStaffList);
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
      const tz = getLocalTimeZone();
      setNewScheduleDateValue(now(tz).add({ hours: 1 }));
    } catch {
      // fallback if timezone conversion fails
    }
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
    if (!targetEnquiryId) {
      setScheduleError('Please select a customer enquiry.');
      return;
    }
    if (!newScheduleDateValue) {
      setScheduleError('Please select a scheduled date and time.');
      return;
    }

    setIsScheduling(true);
    setScheduleError(null);

    try {
      const tz = getLocalTimeZone();
      const scheduledAt =
        'toDate' in newScheduleDateValue && typeof (newScheduleDateValue as any).toDate === 'function'
          ? (newScheduleDateValue as any).toDate(tz).toISOString()
          : new Date(newScheduleDateValue.toString()).toISOString();

      const res = await followupService.createFollowup({
        enquiryId: targetEnquiryId,
        scheduledAt,
        type: newScheduleType,
        notes: newScheduleNotes.trim() || undefined,
      });

      setIsScheduling(false);

      if (res.error) {
        setScheduleError(res.error);
      } else {
        setShowScheduleModal(false);
        setNewScheduleDateValue(null);
        setNewScheduleNotes('');
        fetchFollowups();
      }
    } catch (err: unknown) {
      setIsScheduling(false);
      setScheduleError(err instanceof Error ? err.message : 'Failed to schedule follow-up.');
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

    if (scheduleNext && nextDateValue) {
      const tz = getLocalTimeZone();
      const scheduledAt =
        'toDate' in nextDateValue && typeof (nextDateValue as any).toDate === 'function'
          ? (nextDateValue as any).toDate(tz).toISOString()
          : new Date(nextDateValue.toString()).toISOString();

      await followupService.scheduleNextFollowup(
        completingFollowup.id,
        completingFollowup.enquiry_id,
        scheduledAt,
        nextType,
        nextNotes.trim() || undefined
      );
    }

    setIsSubmittingOutcome(false);
    setCompletingFollowup(null);
    setOutcomeNotes('');
    setScheduleNext(false);
    setNextDateValue(null);
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
          <Chip size="sm" variant="soft" color="default" className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-900 border border-blue-200">
            <Phone className="w-3 h-3" /> Call
          </Chip>
        );
      case 'email':
        return (
          <Chip size="sm" variant="soft" color="default" className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Mail className="w-3 h-3" /> Email
          </Chip>
        );
      case 'meeting':
        return (
          <Chip size="sm" variant="soft" color="default" className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <CalendarIcon className="w-3 h-3" /> Meeting
          </Chip>
        );
      case 'demo':
        return (
          <Chip size="sm" variant="soft" color="default" className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3 h-3" /> Demo
          </Chip>
        );
      case 'quotation':
        return (
          <Chip size="sm" variant="soft" color="default" className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <FileText className="w-3 h-3" /> Quotation
          </Chip>
        );
      default:
        return (
          <Chip size="sm" variant="soft" color="default" className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <MessageSquare className="w-3 h-3" /> {type}
          </Chip>
        );
    }
  };

  const getPriorityBadge = (priority?: string | null) => {
    if (!priority) return null;
    const styles: Record<string, string> = {
      urgent: 'bg-rose-50 text-rose-700 border-rose-200',
      high: 'bg-amber-50 text-amber-800 border-amber-200',
      medium: 'bg-sky-50 text-sky-800 border-sky-200',
      low: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <Chip
        size="sm"
        variant="soft"
        color="default"
        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${styles[priority] || styles.low}`}
      >
        {priority}
      </Chip>
    );
  };

  const isOverdue = (scheduledAt: string, status: string) =>
    status !== 'completed' && status !== 'cancelled' && new Date(scheduledAt).getTime() < Date.now();

  return (
    <>
      <SEOHead
        title="CRM Follow-ups | Akira Precision Automation CRM"
        description="Executive follow-up management and scheduled client communications tracking."
      />

      <div className="space-y-4 max-w-7xl mx-auto pb-12 font-sans text-slate-900">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading tracking-tight">
              CRM Follow-ups
            </h1>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Track customer calls, demos, quotations, and scheduled touchpoints.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onPress={fetchFollowups}
              isDisabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-all text-xs font-semibold font-sans cursor-pointer"
              aria-label="Refresh list"
            >
              <RotateCw className={`w-3.5 h-3.5 shrink-0 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onPress={openQuickScheduleModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-all shadow-2xs font-sans cursor-pointer"
              aria-label="Schedule Follow-up"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Schedule Follow-up</span>
            </Button>
          </div>
        </div>

        {/* ── Status Tabs (counts computed client-side) ────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {TABS.map((tab) => {
            const isSelected = timeframe === tab.key;
            const count = counts[tab.key] ?? 0;
            return (
              <Button
                key={tab.key}
                variant={isSelected ? 'primary' : 'outline'}
                size="sm"
                onPress={() => setTimeframe(tab.key)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-2xs whitespace-nowrap shrink-0 font-sans cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
                aria-label={`Filter by ${tab.label} (${count})`}
              >
                {tab.key === 'overdue' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                {tab.key === 'today' && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                {tab.key === 'upcoming' && <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />}
                {tab.key === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                <span>{tab.label}</span>
                <Chip
                  size="sm"
                  variant="soft"
                  color="default"
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {count}
                </Chip>
              </Button>
            );
          })}
        </div>

        {/* ── Search + Filters ─────────────────────────────────────────────── */}
        <Card className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative sm:col-span-2 flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="Search customer, company or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 font-sans transition-all text-slate-800"
                aria-label="Search customer, company or notes"
              />
              {searchQuery && (
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  onPress={() => setSearchQuery('')}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer z-10 min-w-0 h-auto"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5 min-w-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Select
                selectedKey={selectedType}
                onSelectionChange={(key) => setSelectedType(String(key))}
                className="w-full"
                aria-label="Filter by activity type"
              >
                <Select.Trigger className="w-full h-8 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer">
                  <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                  <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                </Select.Trigger>
                <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[140px]">
                  <ListBox className="outline-none space-y-0.5">
                    {[
                      { key: 'all', label: 'All Types' },
                      { key: 'call', label: 'Call' },
                      { key: 'email', label: 'Email' },
                      { key: 'meeting', label: 'Meeting' },
                      { key: 'demo', label: 'Demo' },
                      { key: 'quotation', label: 'Quotation' },
                      { key: 'other', label: 'Other' },
                    ].map((t) => (
                      <ListBox.Item
                        key={t.key}
                        id={t.key}
                        textValue={t.label}
                        className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                      >
                        {t.label}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            {/* Priority Filter */}
            <div>
              <Select
                selectedKey={selectedPriority}
                onSelectionChange={(key) => setSelectedPriority(String(key))}
                className="w-full"
                aria-label="Filter by priority"
              >
                <Select.Trigger className="w-full h-8 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer">
                  <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                  <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                </Select.Trigger>
                <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[140px]">
                  <ListBox className="outline-none space-y-0.5">
                    {[
                      { key: 'all', label: 'All Priorities' },
                      { key: 'urgent', label: 'Urgent' },
                      { key: 'high', label: 'High' },
                      { key: 'medium', label: 'Medium' },
                      { key: 'low', label: 'Low' },
                    ].map((p) => (
                      <ListBox.Item
                        key={p.key}
                        id={p.key}
                        textValue={p.label}
                        className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                      >
                        {p.label}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          </div>

          {/* Staff filter row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <Select
                selectedKey={selectedStaff}
                onSelectionChange={(key) => setSelectedStaff(String(key))}
                className="min-w-[200px] max-w-[280px]"
                aria-label="Filter by staff member"
              >
                <Select.Trigger className="w-full h-8 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer">
                  <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                  <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                </Select.Trigger>
                <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[240px] max-h-60 overflow-y-auto">
                  <ListBox className="outline-none space-y-0.5">
                    <ListBox.Item
                      id="all"
                      textValue="All Staff"
                      className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                    >
                      All Staff
                    </ListBox.Item>
                    <ListBox.Item
                      id="unassigned"
                      textValue="Unassigned"
                      className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                    >
                      Unassigned
                    </ListBox.Item>
                    {staffList.map((s) => {
                      const statusPrefix = s.role === 'admin'
                        ? '👑 [Admin] '
                        : {
                            present: '🟢 [Present] ',
                            on_field: '🟡 [On Field] ',
                            clocked_out: '⚪ [Out] ',
                            not_reported: '🔴 ',
                          }[s.attendanceStatus];
                      const labelText = `${statusPrefix}${s.full_name || s.email}`;
                      return (
                        <ListBox.Item
                          key={s.id}
                          id={s.id}
                          textValue={labelText}
                          className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                        >
                          {labelText}
                        </ListBox.Item>
                      );
                    })}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Showing <span className="font-bold text-slate-800">{filteredFollowups.length}</span> of{' '}
              <span className="font-bold text-slate-800">{followups.length}</span> follow-ups
            </div>
          </div>
        </Card>

        {/* ── Error ─────────────────────────────────────────────────────────── */}
        {error && (
          <Card className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex flex-row items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-slate-900 font-heading">Unable to load follow-up entries</p>
              <p className="text-rose-600 mt-0.5">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onPress={fetchFollowups}
              className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 border-none cursor-pointer"
              aria-label="Retry loading follow-ups"
            >
              Retry
            </Button>
          </Card>
        )}

        {/* ── Loading skeleton ──────────────────────────────────────────────── */}
        {loading && (
          <Card className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 px-6 py-4 border-b border-slate-100 last:border-0">
                <div className="w-9 h-9 bg-slate-100 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-3.5 bg-slate-100 rounded" />
                  <div className="w-72 h-2.5 bg-slate-100 rounded" />
                </div>
                <div className="w-24 h-7 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </Card>
        )}

        {/* ── Empty State ───────────────────────────────────────────────────── */}
        {!loading && !error && filteredFollowups.length === 0 && (
          <Card className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200/60">
              <CalendarClock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">No scheduled follow-ups found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {timeframe === 'overdue'
                ? 'Great work! No overdue follow-ups at this time.'
                : timeframe === 'today'
                ? 'No follow-ups scheduled for today.'
                : 'No follow-ups match the selected filters.'}
            </p>
            <Button
              variant="primary"
              size="sm"
              onPress={openQuickScheduleModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              aria-label="Schedule Follow-up"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Follow-up</span>
            </Button>
          </Card>
        )}

        {/* ── Follow-ups Table ──────────────────────────────────────────────── */}
        {!loading && !error && filteredFollowups.length > 0 && (
          <Card className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-0">
            <Table className="w-full">
              <Table.ScrollContainer className="overflow-x-auto">
                <Table.Content aria-label="CRM Follow-ups Data Table" className="w-full text-left text-xs min-w-[860px]">
                  {/* Table head */}
                  <Table.Header className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-700 font-mono uppercase tracking-wider">
                    <Table.Column isRowHeader className="py-3.5 px-5 text-slate-700 font-semibold">Customer</Table.Column>
                    <Table.Column className="py-3.5 px-4 text-slate-700 font-semibold">Type</Table.Column>
                    <Table.Column className="py-3.5 px-4 text-slate-700 font-semibold">Scheduled</Table.Column>
                    <Table.Column className="py-3.5 px-4 text-slate-700 font-semibold">Priority</Table.Column>
                    <Table.Column className="py-3.5 px-4 text-slate-700 font-semibold">Assigned</Table.Column>
                    <Table.Column className="py-3.5 px-4 text-slate-700 font-semibold">Notes / Outcome</Table.Column>
                    <Table.Column className="py-3.5 px-4 text-right text-slate-700 font-semibold">Actions</Table.Column>
                  </Table.Header>

                  {/* Table body */}
                  <Table.Body className="divide-y divide-slate-100 text-xs">
                    {filteredFollowups.map((item) => {
                      const overdue = isOverdue(item.scheduled_at, item.status);
                      const isCompleted = item.status === 'completed';
                      const isCancelled = item.status === 'cancelled';

                      return (
                        <Table.Row
                          key={item.id}
                          className={`transition-colors group ${
                            overdue
                              ? 'bg-rose-50/40 hover:bg-rose-50/70'
                              : isCompleted
                              ? 'bg-emerald-50/20 hover:bg-emerald-50/40'
                              : isCancelled
                              ? 'bg-slate-50/60 hover:bg-slate-100/60'
                              : 'hover:bg-slate-50/60'
                          }`}
                        >
                          {/* Customer */}
                          <Table.Cell className="py-3.5 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 font-mono ${
                                  overdue
                                    ? 'bg-rose-100 text-rose-700'
                                    : isCompleted
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : isCancelled
                                    ? 'bg-slate-100 text-slate-500'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {(item.enquiry?.name || '?').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                {item.enquiry ? (
                                  <Link
                                    to={`/admin/enquiries/${item.enquiry_id}`}
                                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1 group-hover:text-blue-600 text-sm"
                                  >
                                    <span>{item.enquiry.name}</span>
                                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                                  </Link>
                                ) : (
                                  <span className="font-semibold text-slate-900 text-sm">
                                    #{item.enquiry_id.substring(0, 8)}
                                  </span>
                                )}
                                {item.enquiry?.company && (
                                  <div className="flex items-center gap-1 text-[11px] text-slate-700 mt-0.5">
                                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{item.enquiry.company}</span>
                                  </div>
                                )}
                                {item.title && (
                                  <div className="text-[11px] text-slate-700 mt-0.5 italic truncate max-w-[180px]">
                                    {item.title}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Table.Cell>

                          {/* Type */}
                          <Table.Cell className="py-3.5 px-4 whitespace-nowrap">
                            {getTypeBadge(item.type)}
                          </Table.Cell>

                          {/* Scheduled */}
                          <Table.Cell className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-mono">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{formatDate(item.scheduled_at)}</span>
                              </div>
                              {/* Status badge */}
                              {overdue && (
                                <Chip
                                  size="sm"
                                  variant="soft"
                                  color="default"
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wide w-fit font-mono border-none"
                                >
                                  Overdue
                                </Chip>
                              )}
                              {isCompleted && (
                                <Chip
                                  size="sm"
                                  variant="soft"
                                  color="default"
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-800 text-white uppercase tracking-wide w-fit font-mono border-none"
                                >
                                  Completed
                                </Chip>
                              )}
                              {isCancelled && (
                                <Chip
                                  size="sm"
                                  variant="soft"
                                  color="default"
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-600 text-white uppercase tracking-wide w-fit font-mono border-none"
                                >
                                  Cancelled
                                </Chip>
                              )}
                            </div>
                          </Table.Cell>

                          {/* Priority */}
                          <Table.Cell className="py-3.5 px-4 whitespace-nowrap">
                            {getPriorityBadge(item.priority) ?? (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </Table.Cell>

                          {/* Assigned */}
                          <Table.Cell className="py-3.5 px-4 whitespace-nowrap">
                            {item.assigned_profile ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 font-mono">
                                  {(item.assigned_profile.full_name || item.assigned_profile.email).charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[120px]">
                                  {item.assigned_profile.full_name || item.assigned_profile.email}
                                </span>
                              </div>
                            ) : (
                              <Chip size="sm" variant="soft" color="default" className="text-slate-700 italic text-[11px] bg-slate-50 border border-slate-200/80">
                                Unassigned
                              </Chip>
                            )}
                          </Table.Cell>

                          {/* Notes / Outcome */}
                          <Table.Cell className="py-3.5 px-4 max-w-[240px]">
                            {item.outcome ? (
                              <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/70 truncate" title={item.outcome}>
                                <span className="font-semibold">Outcome:</span> {item.outcome}
                              </div>
                            ) : item.notes ? (
                              <p className="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/70 truncate" title={item.notes}>
                                {item.notes}
                              </p>
                            ) : (
                              <span className="text-slate-600 italic text-[11px]">No notes</span>
                            )}
                          </Table.Cell>

                          {/* Actions */}
                          <Table.Cell className="py-3.5 px-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Phone */}
                              {item.enquiry?.phone && (
                                <a
                                  href={`tel:${item.enquiry.phone}`}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200 inline-flex items-center justify-center"
                                  title={`Call ${item.enquiry.phone}`}
                                  aria-label={`Call ${item.enquiry.name || 'customer'} at ${item.enquiry.phone}`}
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Email */}
                              {item.enquiry?.email && (
                                <a
                                  href={`mailto:${item.enquiry.email}`}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200 inline-flex items-center justify-center"
                                  title={`Email ${item.enquiry.email}`}
                                  aria-label={`Email ${item.enquiry.name || 'customer'} at ${item.enquiry.email}`}
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Complete / Cancel */}
                              {!isCompleted && !isCancelled && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onPress={() => {
                                      setCompletingFollowup(item);
                                      setOutcomeNotes('');
                                      setScheduleNext(false);
                                      setOutcomeError(null);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-semibold border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
                                    aria-label={`Complete follow-up for ${item.enquiry?.name || 'customer'}`}
                                  >
                                    <Check className="w-3 h-3 shrink-0" />
                                    <span>Complete</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onPress={() => handleCancelFollowup(item)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                                    aria-label={`Cancel follow-up for ${item.enquiry?.name || 'customer'}`}
                                  >
                                    <X className="w-3.5 h-3.5 shrink-0" />
                                  </Button>
                                </>
                              )}

                              {/* Details */}
                              <Link
                                to={`/admin/followups/${item.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-[11px] font-semibold transition-colors"
                                title="View full follow-up details"
                                aria-label={`View full details for follow-up ${item.id}`}
                              >
                                Details
                              </Link>

                              {/* Dossier */}
                              <Link
                                to={`/admin/enquiries/${item.enquiry_id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-[11px] font-semibold transition-colors"
                                aria-label={`View customer dossier for ${item.enquiry?.name || 'customer'}`}
                              >
                                Dossier
                              </Link>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>

            {/* Table footer */}
            <div className="border-t border-slate-100 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/40">
              <span className="font-mono text-[11px]">
                Showing <span className="font-bold text-slate-800">{filteredFollowups.length}</span> follow-ups
              </span>
              <Button
                variant="outline"
                size="sm"
                onPress={openQuickScheduleModal}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/50 border border-blue-200 px-3 py-1.5 rounded-xl cursor-pointer"
                aria-label="Schedule new follow-up"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Schedule new</span>
              </Button>
            </div>
          </Card>
        )}

        {/* ── MODAL: Complete Follow-up ───────────────────────────────────── */}
        <Modal.Backdrop
          isOpen={!!completingFollowup}
          onOpenChange={(open) => {
            if (!open) {
              setCompletingFollowup(null);
              setOutcomeError(null);
            }
          }}
          variant="blur"
          isDismissable
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <Modal.Container placement="center" className="w-full max-w-lg">
            <Modal.Dialog
              className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 w-full overflow-hidden relative flex flex-col focus:outline-none animate-in zoom-in-95 duration-150"
              aria-labelledby="complete-followup-title"
            >
              <Modal.CloseTrigger
                onPress={() => setCompletingFollowup(null)}
                className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </Modal.CloseTrigger>

              <Modal.Header className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <Modal.Icon className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </Modal.Icon>
                <div>
                  <Modal.Heading
                    id="complete-followup-title"
                    className="font-bold text-slate-900 font-heading text-base leading-snug"
                  >
                    Complete Follow-up
                  </Modal.Heading>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Record outcome for {completingFollowup?.enquiry?.name || 'Customer'}
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="pt-4 overflow-visible">
                <Form onSubmit={handleCompleteSubmit} className="space-y-4">
                  {outcomeError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{outcomeError}</span>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="outcomeNotes" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                      Outcome &amp; Discussion Notes <span className="text-rose-500">*</span>
                    </Label>
                    <TextArea
                      id="outcomeNotes"
                      rows={3}
                      required
                      value={outcomeNotes}
                      onChange={(e) => setOutcomeNotes(e.target.value)}
                      placeholder="Summarize client response, key requirements discussed, or next agreements..."
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none font-sans bg-white"
                    />
                  </div>

                  <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                    <Checkbox
                      id="scheduleNextCheck"
                      isSelected={scheduleNext}
                      onChange={(checked) => {
                        setScheduleNext(checked);
                        if (checked && !nextDateValue) {
                          try {
                            const tz = getLocalTimeZone();
                            setNextDateValue(now(tz).add({ days: 3 }));
                          } catch {}
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <Checkbox.Content className="flex items-center gap-2">
                        <Checkbox.Control className="w-4 h-4 rounded border border-slate-300 flex items-center justify-center data-[selected=true]:bg-blue-600 data-[selected=true]:border-blue-600 transition-colors">
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <span className="text-xs font-bold text-slate-800">
                          Schedule Next Follow-up with this customer
                        </span>
                      </Checkbox.Content>
                    </Checkbox>

                    {scheduleNext && (
                      <div className="space-y-3 pt-2 border-t border-slate-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <DatePicker
                              isRequired
                              granularity="minute"
                              hourCycle={12}
                              value={nextDateValue}
                              onChange={setNextDateValue}
                              className="w-full flex flex-col gap-1"
                              aria-label="Next Follow-up Date and Time"
                            >
                              {({ state }) => (
                                <>
                                  <Label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                                    Next Date &amp; Time
                                  </Label>
                                  <DateField.Group
                                    fullWidth
                                    className="w-full h-9 px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 bg-white font-mono flex items-center justify-between"
                                  >
                                    <DateField.Input className="flex items-center gap-0.5 text-xs">
                                      {(segment) => (
                                        <DateField.Segment
                                          segment={segment}
                                          className="px-0.5 rounded-xs outline-none focus:bg-blue-100 focus:text-blue-900"
                                        />
                                      )}
                                    </DateField.Input>
                                    <DateField.Suffix>
                                      <DatePicker.Trigger className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer transition-colors">
                                        <DatePicker.TriggerIndicator />
                                      </DatePicker.Trigger>
                                    </DateField.Suffix>
                                  </DateField.Group>
                                  <DatePicker.Popover className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 flex flex-col gap-3">
                                    <Calendar aria-label="Next Follow-up Date" className="w-full">
                                      <Calendar.Header className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                        <Calendar.YearPickerTrigger className="text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer hover:text-blue-600">
                                          <Calendar.YearPickerTriggerHeading />
                                          <Calendar.YearPickerTriggerIndicator />
                                        </Calendar.YearPickerTrigger>
                                        <div className="flex items-center gap-1">
                                          <Calendar.NavButton
                                            slot="previous"
                                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                          />
                                          <Calendar.NavButton
                                            slot="next"
                                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                          />
                                        </div>
                                      </Calendar.Header>
                                      <Calendar.Grid className="w-full border-collapse">
                                        <Calendar.GridHeader>
                                          {(day) => (
                                            <Calendar.HeaderCell className="text-[11px] font-semibold text-slate-400 pb-1.5 text-center">
                                              {day}
                                            </Calendar.HeaderCell>
                                          )}
                                        </Calendar.GridHeader>
                                        <Calendar.GridBody>
                                          {(date) => (
                                            <Calendar.Cell
                                              date={date}
                                              className="text-xs p-1 text-center rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white data-[disabled=true]:text-slate-300 data-[unavailable=true]:text-slate-300"
                                            />
                                          )}
                                        </Calendar.GridBody>
                                      </Calendar.Grid>
                                      <Calendar.YearPickerGrid className="w-full">
                                        <Calendar.YearPickerGridBody>
                                          {({ year }) => (
                                            <Calendar.YearPickerCell
                                              year={year}
                                              className="text-xs p-1.5 text-center rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
                                            />
                                          )}
                                        </Calendar.YearPickerGridBody>
                                      </Calendar.YearPickerGrid>
                                    </Calendar>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                      <span className="font-semibold text-slate-600 font-mono">Time</span>
                                      <TimeField
                                        aria-label="Next Follow-up Time"
                                        granularity="minute"
                                        hourCycle={12}
                                        value={state.timeValue}
                                        onChange={(v) => { if (v) state.setTimeValue(v); }}
                                      >
                                        <TimeField.Group className="px-2 py-1 border border-slate-200 rounded-lg bg-slate-50 flex items-center font-mono text-xs">
                                          <TimeField.Input className="flex items-center gap-0.5">
                                            {(segment) => (
                                              <TimeField.Segment
                                                segment={segment}
                                                className="px-0.5 rounded-xs outline-none focus:bg-blue-100 focus:text-blue-900"
                                              />
                                            )}
                                          </TimeField.Input>
                                        </TimeField.Group>
                                      </TimeField>
                                    </div>
                                  </DatePicker.Popover>
                                </>
                              )}
                            </DatePicker>
                          </div>
                          <div>
                            <Label htmlFor="nextType" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                              Activity Type
                            </Label>
                            <Select
                              id="nextType"
                              selectedKey={nextType}
                              onSelectionChange={(key) => setNextType(String(key) as FollowupType)}
                              className="w-full"
                              aria-label="Next follow-up type"
                            >
                              <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-sans flex items-center justify-between focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                <Select.Value className="text-xs font-medium text-slate-800 capitalize truncate" />
                                <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                              </Select.Trigger>
                              <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[130px]">
                                <ListBox className="outline-none space-y-0.5">
                                  {[
                                    { key: 'call', label: 'Call' },
                                    { key: 'email', label: 'Email' },
                                    { key: 'meeting', label: 'Meeting' },
                                    { key: 'demo', label: 'Demo' },
                                    { key: 'quotation', label: 'Quotation' },
                                    { key: 'other', label: 'Other' },
                                  ].map((item) => (
                                    <ListBox.Item
                                      key={item.key}
                                      id={item.key}
                                      textValue={item.label}
                                      className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                                    >
                                      {item.label}
                                    </ListBox.Item>
                                  ))}
                                </ListBox>
                              </Select.Popover>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="nextNotes" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                            Next Agenda / Notes
                          </Label>
                          <Input
                            id="nextNotes"
                            type="text"
                            value={nextNotes}
                            onChange={(e) => setNextNotes(e.target.value)}
                            placeholder="e.g. Send formal quote revision #2"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-sans bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => setCompletingFollowup(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-slate-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      isDisabled={isSubmittingOutcome}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer border-none"
                    >
                      {isSubmittingOutcome ? 'Saving...' : 'Save & Mark Complete'}
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>

        {/* ── MODAL: Quick Schedule Follow-up ─────────────────────────────── */}
        <Modal.Backdrop
          isOpen={showScheduleModal}
          onOpenChange={(open) => {
            setShowScheduleModal(open);
            if (!open) {
              setScheduleError(null);
            }
          }}
          variant="blur"
          isDismissable
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <Modal.Container placement="center" className="w-full max-w-lg">
            <Modal.Dialog
              className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 w-full overflow-hidden relative flex flex-col focus:outline-none animate-in zoom-in-95 duration-150"
              aria-labelledby="schedule-followup-title"
            >
              <Modal.CloseTrigger
                onPress={() => setShowScheduleModal(false)}
                className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </Modal.CloseTrigger>

              <Modal.Header className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <Modal.Icon className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shrink-0">
                  <CalendarClock className="w-5 h-5" />
                </Modal.Icon>
                <div>
                  <Modal.Heading
                    id="schedule-followup-title"
                    className="font-bold text-slate-900 font-heading text-base leading-snug"
                  >
                    Schedule CRM Follow-up
                  </Modal.Heading>
                  <p className="text-xs text-slate-500 mt-0.5">Add a new touchpoint or reminder</p>
                </div>
              </Modal.Header>

              <Modal.Body className="pt-4 overflow-visible">
                <Form onSubmit={handleCreateFollowup} className="space-y-4">
                  {scheduleError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{scheduleError}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="targetEnquiryId" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                      Select Customer / Enquiry <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                      id="targetEnquiryId"
                      name="targetEnquiryId"
                      isRequired
                      selectedKey={targetEnquiryId || undefined}
                      onSelectionChange={(key) => {
                        if (key) setTargetEnquiryId(String(key));
                      }}
                      className="w-full"
                      aria-label="Select Customer or Enquiry"
                      placeholder="-- Choose customer enquiry --"
                    >
                      <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none bg-white font-sans cursor-pointer flex items-center justify-between">
                        <Select.Value className="text-xs font-medium text-slate-800 truncate" />
                        <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                      </Select.Trigger>
                      <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 max-h-60 overflow-y-auto min-w-[280px]">
                        <ListBox className="outline-none space-y-0.5">
                          {recentEnquiries.map((e) => {
                            const label = `${e.name} ${e.company ? `(${e.company})` : ''} - #${e.id.substring(0, 8)}`;
                            return (
                              <ListBox.Item
                                key={e.id}
                                id={e.id}
                                textValue={label}
                                className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                              >
                                {label}
                              </ListBox.Item>
                            );
                          })}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <DatePicker
                        isRequired
                        granularity="minute"
                        hourCycle={12}
                        value={newScheduleDateValue}
                        onChange={setNewScheduleDateValue}
                        className="w-full flex flex-col gap-1"
                        aria-label="Date and Time"
                      >
                        {({ state }) => (
                          <>
                            <Label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                              Date &amp; Time
                            </Label>
                            <DateField.Group
                              fullWidth
                              className="w-full h-9 px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 bg-white font-mono flex items-center justify-between"
                            >
                              <DateField.Input className="flex items-center gap-0.5 text-xs">
                                {(segment) => (
                                  <DateField.Segment
                                    segment={segment}
                                    className="px-0.5 rounded-xs outline-none focus:bg-blue-100 focus:text-blue-900"
                                  />
                                )}
                              </DateField.Input>
                              <DateField.Suffix>
                                <DatePicker.Trigger className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer transition-colors">
                                  <DatePicker.TriggerIndicator />
                                </DatePicker.Trigger>
                              </DateField.Suffix>
                            </DateField.Group>
                            <DatePicker.Popover className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 flex flex-col gap-3">
                              <Calendar aria-label="Follow-up Date" className="w-full">
                                <Calendar.Header className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                  <Calendar.YearPickerTrigger className="text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer hover:text-blue-600">
                                    <Calendar.YearPickerTriggerHeading />
                                    <Calendar.YearPickerTriggerIndicator />
                                  </Calendar.YearPickerTrigger>
                                  <div className="flex items-center gap-1">
                                    <Calendar.NavButton
                                      slot="previous"
                                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                    />
                                    <Calendar.NavButton
                                      slot="next"
                                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                    />
                                  </div>
                                </Calendar.Header>
                                <Calendar.Grid className="w-full border-collapse">
                                  <Calendar.GridHeader>
                                    {(day) => (
                                      <Calendar.HeaderCell className="text-[11px] font-semibold text-slate-400 pb-1.5 text-center">
                                        {day}
                                      </Calendar.HeaderCell>
                                    )}
                                  </Calendar.GridHeader>
                                  <Calendar.GridBody>
                                    {(date) => (
                                      <Calendar.Cell
                                        date={date}
                                        className="text-xs p-1 text-center rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white data-[disabled=true]:text-slate-300 data-[unavailable=true]:text-slate-300"
                                      />
                                    )}
                                  </Calendar.GridBody>
                                </Calendar.Grid>
                                <Calendar.YearPickerGrid className="w-full">
                                  <Calendar.YearPickerGridBody>
                                    {({ year }) => (
                                      <Calendar.YearPickerCell
                                        year={year}
                                        className="text-xs p-1.5 text-center rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
                                      />
                                    )}
                                  </Calendar.YearPickerGridBody>
                                </Calendar.YearPickerGrid>
                              </Calendar>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                <span className="font-semibold text-slate-600 font-mono">Time</span>
                                <TimeField
                                  aria-label="Follow-up Time"
                                  granularity="minute"
                                  hourCycle={12}
                                  value={state.timeValue}
                                  onChange={(v) => { if (v) state.setTimeValue(v); }}
                                >
                                  <TimeField.Group className="px-2 py-1 border border-slate-200 rounded-lg bg-slate-50 flex items-center font-mono text-xs">
                                    <TimeField.Input className="flex items-center gap-0.5">
                                      {(segment) => (
                                        <TimeField.Segment
                                          segment={segment}
                                          className="px-0.5 rounded-xs outline-none focus:bg-blue-100 focus:text-blue-900"
                                        />
                                      )}
                                    </TimeField.Input>
                                  </TimeField.Group>
                                </TimeField>
                              </div>
                            </DatePicker.Popover>
                          </>
                        )}
                      </DatePicker>
                    </div>

                    <div>
                      <Label htmlFor="newScheduleType" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                        Activity Type
                      </Label>
                      <Select
                        id="newScheduleType"
                        selectedKey={newScheduleType}
                        onSelectionChange={(key) => setNewScheduleType(String(key) as FollowupType)}
                        className="w-full"
                        aria-label="Activity Type"
                      >
                        <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none bg-white font-sans cursor-pointer flex items-center justify-between">
                          <Select.Value className="text-xs font-medium text-slate-800 capitalize truncate" />
                          <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                        </Select.Trigger>
                        <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[130px]">
                          <ListBox className="outline-none space-y-0.5">
                            {[
                              { key: 'call', label: 'Call' },
                              { key: 'email', label: 'Email' },
                              { key: 'meeting', label: 'Meeting' },
                              { key: 'demo', label: 'Demo' },
                              { key: 'quotation', label: 'Quotation' },
                              { key: 'other', label: 'Other' },
                            ].map((item) => (
                              <ListBox.Item
                                key={item.key}
                                id={item.key}
                                textValue={item.label}
                                className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                              >
                                {item.label}
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <TextField className="w-full flex flex-col gap-1">
                      <Label htmlFor="newScheduleNotes" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                        Notes &amp; Discussion Goal
                      </Label>
                      <TextArea
                        id="newScheduleNotes"
                        rows={3}
                        value={newScheduleNotes}
                        onChange={(e) => setNewScheduleNotes(e.target.value)}
                        placeholder="e.g. Call engineering manager to discuss dial gauge repeatability specs"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none font-sans bg-white"
                      />
                    </TextField>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => setShowScheduleModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-slate-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      isDisabled={isScheduling}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer border-none"
                    >
                      {isScheduling ? 'Scheduling...' : 'Confirm Schedule'}
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </div>
    </>
  );
};

export default AdminFollowups;
